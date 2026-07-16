# Referral / Agent / Payment Hardening — Implementation Plan

Design review findings for the enrollment → payment → commission pipeline
(`app/api/public/vydhra/*`, `lib/payment`, `lib/referral`, `lib/agent`, `lib/coupon`)
with the concrete fix for each. Ordered by priority.

Legend: 🔴 must fix (money correctness) · 🟠 should fix (integrity/abuse) · 🟡 nice to have

---

## 🔴 1. Make post-payment side effects atomic

**Problem.** In `completePaymentAndEnrollment` (`lib/payment/index.ts:325-385`), the
payment row, coupon `currentUses` increment, agent/student earnings increments, and
enrollment status update run as **separate awaits**. The unique `razorpayPaymentId`
row is created *first*, so if the process dies mid-sequence, a retry hits the
`alreadyProcessed` fast path and returns success — commission is silently never
credited and/or the enrollment stays `PENDING` for a paid order. The failure is
permanent by design.

**Fix.** Wrap steps 3–6 in a single `prisma.$transaction`; keep only email dispatch
outside it.

- [ ] Refactor `incrementAgentEarnings` and `incrementStudentReferralEarnings` to accept
      an optional `tx: Prisma.TransactionClient` (default `prisma`) so they can run
      inside the transaction.
- [ ] In `completePaymentAndEnrollment`, replace steps 3–6 with:

```ts
const result = await prisma.$transaction(async (tx) => {
  const payment = await createPayment({ ... }, tx);          // unique razorpayPaymentId
  if (couponId) {
    await tx.coupon.update({ where: { id: couponId }, data: { currentUses: { increment: 1 } } });
  }
  const agentCredit = agentId
    ? await incrementAgentEarnings(agentId, amountUsd, { tx, paymentId: payment.id })
    : null;
  const studentCredit = referrerStudentId
    ? await incrementStudentReferralEarnings(referrerStudentId, amountUsd, { tx, paymentId: payment.id })
    : null;
  await tx.courseEnrollment.update({ where: { id: enrollmentId }, data: { status: "PAID" } });
  return { payment, agentCredit, studentCredit };
});
```

- [ ] Keep the P2002 catch, but move it around the **whole transaction**: on P2002,
      re-read the winner payment and return `alreadyProcessed` (the winner's
      transaction did all the side effects, so nothing is lost).
- [ ] Compute `await toUsd(amount, currency)` **before** the transaction (it may hit an
      external rate source; no network calls inside a transaction).
- [ ] Move the `studentData`/`courseData`/`enrollmentData` fetches and both email sends
      after the transaction, unchanged (best-effort stays best-effort).

**Acceptance.** Kill the process between payment insert and enrollment update (simulate
by throwing inside the transaction after `createPayment`): no payment row exists,
retry succeeds fully. No path exists where a `COMPLETED` payment coexists with a
`PENDING` enrollment or uncredited commission.

---

## 🔴 2. Add a commission ledger (`CommissionCredit`)

**Problem.** `agent.totalEarned` / `student.totalEarned` are float aggregates mutated
with `increment`. The per-payment commission amount is never persisted — earnings
can't be audited, reconciled against payouts, or reversed for a refund.

**Fix.** New table written in the same transaction as fix #1; aggregates become
derived (kept for display, but the ledger is the source of truth).

- [ ] `prisma/schema.prisma`:

```prisma
model CommissionCredit {
  id                String   @id @default(cuid())
  paymentId         String
  payment           Payment  @relation(fields: [paymentId], references: [id])
  agentId           String?
  agent             Agent?   @relation(fields: [agentId], references: [id])
  referrerStudentId String?
  referrerStudent   Student? @relation("ReferralCredits", fields: [referrerStudentId], references: [id])
  amountUsd         Decimal  @db.Decimal(12, 2)
  rateType          RateType           // snapshot of the rate used
  rateValue         Decimal  @db.Decimal(12, 2)
  saleAmountUsd     Decimal  @db.Decimal(12, 2)
  status            CreditStatus @default(EARNED)   // EARNED | REVERSED | PAID_OUT
  reversedAt        DateTime?
  createdAt         DateTime @default(now())

  @@unique([paymentId, agentId])
  @@unique([paymentId, referrerStudentId])
  @@index([agentId, status])
  @@index([referrerStudentId, status])
}

enum CreditStatus {
  EARNED
  REVERSED
  PAID_OUT
}
```

- [ ] In `incrementAgentEarnings` / `incrementStudentReferralEarnings`: create the
      `CommissionCredit` row (snapshotting `rateType`/`rateValue` used) alongside the
      `totalEarned` increment, inside the caller's transaction. The `@@unique` on
      `(paymentId, agentId)` is a second idempotency net.
- [ ] Migration + backfill script (`scripts/backfill-commission-credits.ts`): derive
      historical credits from `Payment` rows joined to agent/referrer, computing
      commission from the *current* rate (flag these rows, e.g. `backfilled: true`
      column or a note field, since historical rates are unknown).
- [ ] Admin dashboard: on agent detail (`app/(dashboard)/agents/[id]`) and student
      detail pages, replace the payments-derived earnings display with a credits list
      (amount, status, payment link). `totalPaid` bookkeeping in
      `updateAgentStatistics` / `updateStudentReferralStats` should transition credit
      rows `EARNED → PAID_OUT` rather than only bumping a counter.
- [ ] While in the schema: consider migrating `totalEarned`/`totalPaid`/`amount` money
      columns from `Float` to `Decimal(12,2)` to stop rounding drift. Separate
      migration, same PR series.

**Acceptance.** `SUM(CommissionCredit.amountUsd WHERE status != REVERSED)` equals
`totalEarned` for every agent/student (add a reconciliation script to CI or a cron).

---

## 🔴 3. Handle refunds and capture failures

**Problem.** `verify/route.ts:48` accepts `authorized` as well as `captured`. If capture
later fails, or the payment is refunded, the enrollment stays `PAID` and commission
stays credited. There is no Razorpay webhook handler at all — client-side verify is
the only completion path.

**Fix.**

- [ ] New route `app/api/public/vydhra/payment/webhook/route.ts`:
      - Validate `X-Razorpay-Signature` (HMAC-SHA256 of raw body with
        `RAZORPAY_WEBHOOK_SECRET` — new env var; use the **raw** request text, not
        re-serialized JSON).
      - `payment.captured` → call `completePaymentAndEnrollment` (idempotent via #1),
        so enrollment completes even if the buyer closes the tab before client verify.
      - `payment.failed` (after authorized) and `refund.processed` → new
        `reversePaymentEffects(razorpayPaymentId)` in `lib/payment`:
        mark payment `REFUNDED`/`FAILED`, set enrollment back to `PENDING`
        (or `CANCELLED`), decrement `coupon.currentUses`, flip the payment's
        `CommissionCredit` rows to `REVERSED` and decrement `totalEarned` — all in one
        transaction.
- [ ] Tighten verify: treat `authorized` as provisional — either drop it (require
      `captured`, Razorpay auto-captures in most configurations) or keep accepting it
      but rely on the webhook to reverse if capture fails. Decide once, comment it.
- [ ] Register the webhook URL + secret in the Razorpay dashboard (deployment note).

**Acceptance.** Refunding a test-mode payment reverses enrollment status, coupon usage,
and both earnings aggregates + ledger rows. Replaying the webhook is a no-op.

---

## 🟠 4. Enforce the shared code namespace on the admin side

**Problem.** `isCodeTaken` (`lib/referral/index.ts:93`) guards student-code generation
against coupons/agents, but `createCoupon`/`createAgent` don't check student referral
codes. An admin creating coupon `PRIYA-7XK2` silently shadows that student's code
forever (checkout resolves coupons first).

**Fix.**

- [ ] Export `isCodeTaken(code, opts?: { excludeCouponCode?: string })` from
      `lib/referral`.
- [ ] `createCoupon` (`lib/coupon/index.ts`): reject when the normalized code matches an
      existing student `referralCode` or agent code → throw
      `"Code already in use by a student referral / agent"`; surface as a 409 in the
      coupons API route and a form error in `app/(dashboard)/coupons/new`.
- [ ] `createAgent` (`lib/agent/index.ts:143`): same check before the transaction (it
      already creates a coupon with the same code, so one check covers both).
- [ ] One-off audit script: report existing collisions between
      `Student.referralCode`, `Coupon.code`, `Agent.code` so current shadowing (if any)
      gets fixed manually.

**Acceptance.** Creating a coupon or agent with an existing student referral code fails
with a clear message; audit script returns zero collisions after cleanup.

---

## 🟠 5. Close the `maxUses` / `validUntil` TOCTOU

**Problem.** Coupon limits are checked at **order creation** (`enroll/route.ts:142`) but
usage is incremented at **payment verification** — N concurrent checkouts can all pass
the check, and an order created before expiry is honored whenever it's paid.

**Fix.** Re-check and increment atomically at credit time, inside the #1 transaction:

- [ ] Replace the unconditional increment in `completePaymentAndEnrollment` with a
      guarded conditional update:

```ts
const updated = await tx.coupon.updateMany({
  where: {
    id: couponId,
    OR: [{ maxUses: null }, { currentUses: { lt: coupon.maxUses } }], // guard in SQL
  },
  data: { currentUses: { increment: 1 } },
});
const couponHonored = updated.count === 1;
```

      (`updateMany` so the row-level `WHERE` makes the check-and-increment atomic.)
- [ ] Decide the over-limit policy and encode it: the payment already succeeded, so
      **honor the discount but log loudly** (`console.error` + optional admin email)
      when `couponHonored === false`, and skip crediting the agent for that sale.
      Refusing the enrollment post-payment is worse than eating one extra discount.
- [ ] Keep the enroll-time check as the UX guard (fail fast before money moves).
- [ ] Optional tightening: store `couponValidUntil` in order notes and skip agent credit
      if paid after expiry — same "honor discount, skip commission" policy.

**Acceptance.** Concurrency test: two simultaneous verifies against a coupon with one
remaining use → `currentUses` ends at `maxUses`, exactly one agent credit written.

---

## 🟠 6. Fix quote/charge drift (exchange rate + GST)

**Problem.** Two sources of "the number the user saw isn't the number charged":
1. FLAT USD discounts on INR checkouts convert with the **live** rate at each call, so
   `/coupon/validate` (UI preview) and `/enroll` (order) can disagree.
2. `/coupon/validate` returns `finalAmount` **without GST**, while `/enroll` adds 18%
   for INR.

**Fix.**

- [ ] Extract one shared pricing function used by *both* routes:

```ts
// lib/pricing/quote.ts
export async function quoteEnrollment(params: {
  basePrice: number; currency: "USD" | "INR";
  coupon?: ResolvedCoupon | null; referral?: ResolvedStudentReferral | null;
  usdToInrRate: number;
}): Promise<{ subtotal: number; discountAmount: number; gstAmount: number; total: number }>
```

      Move the discount-resolution + GST math out of `enroll/route.ts:127-204` and
      `coupon/validate/route.ts:50-122` into it. This removes the duplicated
      coupon-vs-referral fallback logic too.
- [ ] `/coupon/validate` response: include `gstAmount` and `total` computed by the same
      function; update `EnrollmentClient.tsx` (Vydhra) to display that total.
- [ ] Rate pinning: cache `getUsdToInrRate()` with a short TTL (e.g. 30–60 min) so
      validate → enroll within a session sees the same rate. (Full pinning —
      persisting the quoted rate on the enrollment and reusing it at order creation —
      is optional; the TTL cache removes ~all real drift since enroll immediately
      creates the Razorpay order with the final amount.)

**Acceptance.** For an INR checkout with a FLAT USD coupon, validate's `total` equals
the Razorpay order amount created seconds later. No pricing math remains inline in
either route.

---

## 🟡 7. Stop re-querying the Vydhra business row everywhere

**Problem.** `prisma.business.findFirst({ where: { type: "COURSE_SELLING" } })` is
duplicated in ~8 modules and runs on every request — a hidden single-business
assumption as repeated boilerplate.

**Fix.**

- [ ] `lib/business.ts` with a module-level memoized lookup:

```ts
let vydhraId: string | null = null;
export async function getVydhraBusinessId(): Promise<string> {
  if (vydhraId) return vydhraId;
  const b = await prisma.business.findFirst({ where: { type: "COURSE_SELLING" }, select: { id: true } });
  if (!b) throw new Error("Vydhra business not found");
  return (vydhraId = b.id);
}
```

      (The id is immutable in practice; memoizing per server process is safe.)
- [ ] Replace all inline lookups (`lib/agent`, `lib/coupon`, `lib/referral`,
      `lib/student`, enroll/validate/referral-apply routes, …) — grep for
      `COURSE_SELLING`.

---

## 🟡 8. Rate-limit code validation + stronger code entropy

**Problem.** Referral codes are `NAME-XXXX` with a 31-char alphabet → ~923k suffixes per
guessable name prefix, and `/coupon/validate` + `/enroll` are unauthenticated oracles.
A script can brute-force valid codes (each hit = a discount + commission credited to a
stranger).

**Fix.**

- [ ] Rate-limit `/api/public/vydhra/coupon/validate` and `/enroll` by IP (e.g. 10
      req/min for validate, 5/min for enroll). Simplest: an in-memory sliding-window
      limiter in `middleware.ts` for these paths (upgrade to Redis/Upstash if the app
      ever runs multi-instance).
- [ ] Bump the suffix from 4 → 6 chars in `ensureStudentReferralCode`
      (`lib/referral/index.ts:118`) → ~887M combinations per prefix. Existing codes
      stay valid; only new ones get longer.
- [ ] Use `crypto.randomInt(CODE_ALPHABET.length)` instead of `Math.random()` in
      `randomCodeSuffix` — free correctness, no downside.

---

## 🟡 9. Make `updateCoupon` transactional

**Problem.** `lib/coupon/index.ts` `updateCoupon` does `couponDiscount.deleteMany` then
`coupon.update` as two calls — a crash in between strips a coupon of all discounts,
making it silently unusable ("not available in USD").

**Fix.**

- [ ] Wrap in `prisma.$transaction(async (tx) => { ... })`: delete + recreate discounts
      and update the coupon atomically.

---

## 🟡 10. Clean up abandoned PENDING enrollments

**Problem.** `/enroll` upserts the student and creates a `PENDING` enrollment **before**
payment. Abandoned checkouts accumulate forever. Seat counting already excludes
PENDING, so this is hygiene, not correctness — but the students table also fills with
upserted rows that never bought.

**Fix.**

- [ ] `lib/enrollment/cleanup.ts`: delete (or mark `EXPIRED`) `PENDING` enrollments
      older than 48h with no associated payment. Prefer a status flip over deletion —
      keeps the funnel measurable.
- [ ] Trigger: a Vercel cron / route handler `app/api/cron/cleanup-enrollments` guarded
      by `CRON_SECRET`, daily.
- [ ] Leave upserted students alone (they're leads), but don't email them referral
      codes — already the case since codes are only generated on payment.

---

## Guard-rail: email skipped when `courseId` missing (from the earlier flow check)

`completePaymentAndEnrollment` only sends the confirmation email when
`studentData?.email && courseData?.name` (`lib/payment/index.ts:430`). `courseId` comes
from order notes and *is* always set by `/enroll`, but the guard silently drops the
entire email (receipt + referral code) if it's ever absent.

- [ ] Fall back to resolving the course through the enrollment
      (`courseEnrollment.course`) instead of trusting notes, and send the email
      whenever the student has an email address.

---

## Suggested sequencing

| PR | Contents | Risk |
|----|----------|------|
| 1 | #1 transaction + #5 guarded increment + #9 (all small, same file area) | Low — behavior-preserving on the happy path |
| 2 | #2 ledger schema + backfill + dashboard read paths | Medium — migration + backfill |
| 3 | #3 webhook + reversal (depends on #2 for clean reversal) | Medium — new external surface |
| 4 | #4 namespace checks + audit script | Low |
| 5 | #6 shared quote function + validate/UI change | Medium — touches Vydhra frontend |
| 6 | #7, #8, #10, email guard | Low |

Each PR should run the existing enrollment E2E path (enroll → Razorpay test payment →
verify → email) before merge.
