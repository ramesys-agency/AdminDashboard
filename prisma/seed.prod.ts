/**
 * Production seed — master data only.
 *
 * Creates the minimum a fresh production database needs to be usable:
 *   • Businesses (Ramesys, Vydhra)
 *   • All Vydhra courses with USD + INR pricing
 *   • One Jan 2027 launch batch per LIVE course (none for COMING_SOON courses)
 *   • Referral settings row for Vydhra (schema defaults)
 *   • One SUPERADMIN account, credentials read from the environment
 *
 * Deliberately does NOT create students, agents, coupons, enquiries, payments,
 * clients or projects — those are real business records and belong to the app.
 *
 * Safe to re-run: every write is an upsert or existence-checked create, and
 * nothing is deleted unless SEED_RESET is set (see below). Re-running re-syncs
 * course content/pricing from prisma/data/courses.ts and resets the admin
 * password to ADMIN_PASSWORD. A launch batch that already has enrollments is
 * never touched.
 *
 * Required env: DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD
 * Optional env: ADMIN_NAME
 *
 * To start from a genuinely empty database (wipes ALL rows in every table,
 * including students, payments and admin accounts) run with:
 *   SEED_RESET=DELETE_ALL_DATA npm run db:seed:prod
 */
import { BusinessType, BatchStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import { config } from "../lib/config";
import bcrypt from "bcryptjs";
import { coursesData } from "./data/courses";

const MIN_PASSWORD_LENGTH = 12;

/** The seed owns exactly one batch per LIVE course, identified by this name. */
const LAUNCH_BATCH_NAME = "Cohort 1 — Jan 2027";
/** Monday, 4 January 2027 — first weekday of the launch month. */
const LAUNCH_START = new Date("2027-01-04T00:00:00.000Z");
const LAUNCH_MAX_SEATS = 50;
const DEFAULT_DURATION_WEEKS = 8;

/**
 * WHATSAPP_GROUP_URL is often set to a bare "https://chat.whatsapp.com/" with no
 * invite code. Only stamp it onto batches when it carries an actual invite path;
 * otherwise leave null so the email layer falls back to the env value at send time.
 */
function whatsappGroupUrl(): string | null {
  const raw = process.env.WHATSAPP_GROUP_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.pathname.replace(/\/+$/, "").length > 0 ? raw : null;
  } catch {
    return null;
  }
}

function requireAdminCredentials() {
  const email = config.adminEmail.trim().toLowerCase();
  const password = config.adminPassword;
  const errors: string[] = [];

  if (!email) {
    errors.push("ADMIN_EMAIL is not set");
  } else if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    errors.push(`ADMIN_EMAIL is not a valid email address: ${email}`);
  }

  if (!password) {
    errors.push("ADMIN_PASSWORD is not set");
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`);
  } else if (/^(admin|password|changeme)/i.test(password)) {
    errors.push("ADMIN_PASSWORD looks like a placeholder — use a generated password");
  }

  if (errors.length) {
    throw new Error(
      `Refusing to seed:\n  - ${errors.join("\n  - ")}\n` +
        `Set them in the environment (see .env.example) and re-run.`,
    );
  }

  return { email, password, name: config.adminName };
}

/**
 * Live vs Coming Soon lives in the course `details` JSON, not a schema column.
 * Both consumers treat a missing status as LIVE — see Vydhra's src/lib/api.ts
 * and components/courses/CourseForm.tsx — so mirror that rule here.
 */
function isComingSoon(course: any): boolean {
  return course.status === "COMING_SOON";
}

/** "12 Weeks" → 12. Falls back to 8 weeks if the course omits or reshapes it. */
function durationWeeks(course: any): number {
  const match = /(\d+)\s*week/i.exec(String(course.duration ?? ""));
  return match ? Number(match[1]) : DEFAULT_DURATION_WEEKS;
}

/** Launch batch runs from LAUNCH_START for the course's advertised duration. */
function launchBatchDates(course: any) {
  const weeks = durationWeeks(course);
  return {
    startDate: LAUNCH_START,
    endDate: new Date(LAUNCH_START.getTime() + weeks * 7 * 24 * 60 * 60 * 1000),
    weeks,
  };
}

/** Course prices in the data file are the "sale" price; show a 1.5x strike-through. */
function pricingRows(course: any) {
  const priceUSD: number = course.priceUSD ?? course.price ?? 0;
  const priceINR: number | undefined = course.priceINR;

  return [
    {
      currency: "USD",
      amount: priceUSD,
      originalPrice: Math.round(priceUSD * 1.5),
    },
    ...(priceINR
      ? [
          {
            currency: "INR",
            amount: priceINR,
            // Round to the nearest ...999 for a cleaner strike-through price
            originalPrice: Math.round((priceINR * 1.5) / 1000) * 1000 - 1,
          },
        ]
      : []),
  ];
}

/**
 * Wipes every table, FK-safe order first. Gated behind an exact env value so it
 * can never fire by accident — a plain `npm run db:seed:prod` never deletes.
 */
async function resetDatabase() {
  console.log("🧹 SEED_RESET=DELETE_ALL_DATA — wiping all tables...");

  const before = {
    students: await prisma.student.count(),
    payments: await prisma.payment.count(),
    enrollments: await prisma.courseEnrollment.count(),
    admins: await prisma.adminUser.count(),
  };
  console.log(`   deleting: ${JSON.stringify(before)}`);

  // Order matters: children before parents (BatchPricing, CoursePricing and
  // CouponDiscount cascade from their parents).
  await prisma.commissionCredit.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.courseEnrollment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.courseBatch.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.enquiry.deleteMany({});
  await prisma.referralSettings.deleteMany({});
  await prisma.business.deleteMany({});
  await prisma.adminUser.deleteMany({});

  console.log("✅ Database wiped");
}

async function main() {
  const admin = requireAdminCredentials();

  if (process.env.SEED_RESET === "DELETE_ALL_DATA") {
    await resetDatabase();
  } else if (process.env.SEED_RESET) {
    throw new Error(
      `SEED_RESET is set to "${process.env.SEED_RESET}" — expected exactly "DELETE_ALL_DATA". Aborting.`,
    );
  }

  console.log("🌱 Seeding production master data (idempotent)...");

  // ─── Businesses ──────────────────────────────────────────────
  const ramesys = await prisma.business.upsert({
    where: { name: "Ramesys" },
    update: {},
    create: { name: "Ramesys", type: BusinessType.IT_SERVICES },
  });

  const vydhra = await prisma.business.upsert({
    where: { name: "Vydhra" },
    update: {},
    create: { name: "Vydhra", type: BusinessType.COURSE_SELLING },
  });

  console.log(`✅ Businesses ready (Ramesys: ${ramesys.id}, Vydhra: ${vydhra.id})`);

  // ─── Referral settings (schema defaults) ─────────────────────
  await prisma.referralSettings.upsert({
    where: { businessId: vydhra.id },
    update: {},
    create: { businessId: vydhra.id },
  });

  console.log("✅ Referral settings ready");

  // ─── Courses, pricing and launch batches ─────────────────────
  let coursesCreated = 0;
  let coursesUpdated = 0;
  let batchesCreated = 0;
  let batchesUpdated = 0;
  const liveSlugs: string[] = [];
  const comingSoonSlugs: string[] = [];
  const staleBatchWarnings: string[] = [];

  for (const course of coursesData) {
    const existing = await prisma.course.findUnique({
      where: { slug: course.slug },
      select: { id: true },
    });

    const courseRecord = existing
      ? await prisma.course.update({
          where: { id: existing.id },
          data: {
            name: course.title,
            description: course.description,
            details: course as any,
          },
        })
      : await prisma.course.create({
          data: {
            businessId: vydhra.id,
            slug: course.slug,
            name: course.title,
            description: course.description,
            details: course as any,
          },
        });

    if (existing) coursesUpdated++;
    else coursesCreated++;

    // Pricing is keyed by (courseId, currency) — upsert so re-runs re-sync prices
    for (const row of pricingRows(course)) {
      await prisma.coursePricing.upsert({
        where: { courseId_currency: { courseId: courseRecord.id, currency: row.currency } },
        update: { amount: row.amount, originalPrice: row.originalPrice },
        create: { courseId: courseRecord.id, ...row },
      });
    }

    // A Coming Soon course has no dates announced yet — giving it a batch would
    // list a joinable cohort for a course the site refuses to enrol anyone in.
    if (isComingSoon(course)) {
      comingSoonSlugs.push(course.slug);
      const strayBatches = await prisma.courseBatch.count({
        where: { courseId: courseRecord.id },
      });
      if (strayBatches) {
        staleBatchWarnings.push(`${course.slug} (${strayBatches})`);
      }
      continue;
    }

    liveSlugs.push(course.slug);

    const { startDate, endDate } = launchBatchDates(course);
    const existingBatch = await prisma.courseBatch.findFirst({
      where: { courseId: courseRecord.id, name: LAUNCH_BATCH_NAME },
      select: { id: true, _count: { select: { enrollments: true } } },
    });

    if (!existingBatch) {
      await prisma.courseBatch.create({
        data: {
          courseId: courseRecord.id,
          name: LAUNCH_BATCH_NAME,
          startDate,
          endDate,
          maxSeats: LAUNCH_MAX_SEATS,
          status: BatchStatus.UPCOMING,
          whatsappGroupUrl: whatsappGroupUrl(),
          pricing: { createMany: { data: pricingRows(course) } },
        },
      });
      batchesCreated++;
      continue;
    }

    // Students are already in this cohort — its dates are now an operational
    // fact, not seed data. Leave it exactly as the admin has it.
    if (existingBatch._count.enrollments > 0) continue;

    await prisma.courseBatch.update({
      where: { id: existingBatch.id },
      data: { startDate, endDate, maxSeats: LAUNCH_MAX_SEATS, status: BatchStatus.UPCOMING },
    });
    for (const row of pricingRows(course)) {
      await prisma.batchPricing.upsert({
        where: { batchId_currency: { batchId: existingBatch.id, currency: row.currency } },
        update: { amount: row.amount, originalPrice: row.originalPrice },
        create: { batchId: existingBatch.id, ...row },
      });
    }
    batchesUpdated++;
  }

  console.log(
    `✅ Courses ready (${coursesCreated} created, ${coursesUpdated} updated) · ` +
      `${liveSlugs.length} LIVE, ${comingSoonSlugs.length} COMING_SOON`,
  );
  console.log(
    `   Launch batches (${LAUNCH_BATCH_NAME}): ${batchesCreated} created, ${batchesUpdated} re-dated` +
      ` · none for Coming Soon courses`,
  );
  console.log(`   LIVE: ${liveSlugs.join(", ") || "none"}`);
  if (staleBatchWarnings.length) {
    console.warn(
      `⚠️  These Coming Soon courses still have batches from an earlier run: ` +
        `${staleBatchWarnings.join(", ")}\n` +
        `   Delete them in the dashboard — the seed won't remove batches that may hold enrollments.`,
    );
  }

  // ─── Admin user ──────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(admin.password, 12);
  const adminUser = await prisma.adminUser.upsert({
    where: { email: admin.email },
    update: { password: hashedPassword, name: admin.name, role: "SUPERADMIN" },
    create: {
      email: admin.email,
      password: hashedPassword,
      name: admin.name,
      role: "SUPERADMIN",
    },
  });

  console.log(`✅ Admin user ready (${adminUser.email} · password from ADMIN_PASSWORD)`);

  // Any other admin account can still log in — surface it instead of silently
  // leaving a forgotten login (e.g. an old seed's admin) in place.
  const otherAdmins = await prisma.adminUser.findMany({
    where: { email: { not: admin.email } },
    select: { email: true, role: true },
  });
  if (otherAdmins.length) {
    console.warn(
      `⚠️  Other admin accounts exist and can still log in: ` +
        otherAdmins.map((a) => `${a.email} (${a.role})`).join(", ") +
        `\n   Delete them from the dashboard, or re-run with SEED_RESET=DELETE_ALL_DATA.`,
    );
  }

  console.log("\n🎉 Production seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
