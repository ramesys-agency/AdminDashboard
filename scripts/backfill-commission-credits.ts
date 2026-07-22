import { PrismaClient } from "@prisma/client";

// Backfills CommissionCredit ledger rows for historical COMPLETED payments
// that credited an agent or a referring student. Commission is derived from
// the beneficiary's CURRENT rate (historical rates weren't recorded), so
// rows are flagged backfilled=true. Idempotent — payments that already have
// a credit row for the beneficiary are skipped.
//
// Run with: npx tsx scripts/backfill-commission-credits.ts

const prisma = new PrismaClient();

const FALLBACK_USD_TO_INR = 85.0;

function commissionFor(
  type: "PERCENTAGE" | "FLAT",
  value: number,
  saleAmountUsd: number,
): number {
  return type === "PERCENTAGE" ? (saleAmountUsd * (value || 0)) / 100 : value || 0;
}

async function backfill() {
  const payments = await prisma.payment.findMany({
    where: {
      status: "COMPLETED",
      OR: [{ agentId: { not: null } }, { referrerStudentId: { not: null } }],
    },
    include: {
      agent: { select: { commissionType: true, commissionValue: true } },
      referrerStudent: { select: { commissionType: true, commissionValue: true } },
      commissionCredits: { select: { agentId: true, referrerStudentId: true } },
    },
  });

  const settings = await prisma.referralSettings.findFirst();
  console.log(`Found ${payments.length} completed payments with a beneficiary.`);

  let created = 0;
  let skipped = 0;

  for (const payment of payments) {
    // Match the runtime conversion: earnings are tracked in USD
    const rate = payment.exchangeRate || FALLBACK_USD_TO_INR;
    const saleAmountUsd =
      (payment.currency ?? "USD").toUpperCase() === "INR"
        ? Math.round((payment.amount / rate) * 100) / 100
        : payment.amount;

    if (payment.agentId && payment.agent) {
      const exists = payment.commissionCredits.some((c) => c.agentId === payment.agentId);
      if (exists) {
        skipped++;
      } else {
        const amountUsd = commissionFor(
          payment.agent.commissionType,
          payment.agent.commissionValue,
          saleAmountUsd,
        );
        await prisma.commissionCredit.create({
          data: {
            paymentId: payment.id,
            agentId: payment.agentId,
            rateType: payment.agent.commissionType,
            rateValue: payment.agent.commissionValue || 0,
            saleAmountUsd,
            amountUsd,
            backfilled: true,
          },
        });
        created++;
      }
    }

    if (payment.referrerStudentId && payment.referrerStudent) {
      const exists = payment.commissionCredits.some(
        (c) => c.referrerStudentId === payment.referrerStudentId,
      );
      if (exists) {
        skipped++;
      } else {
        const rateType =
          payment.referrerStudent.commissionType ??
          settings?.studentCommissionType ??
          "PERCENTAGE";
        const rateValue =
          payment.referrerStudent.commissionValue ?? settings?.studentCommissionValue ?? 10;
        await prisma.commissionCredit.create({
          data: {
            paymentId: payment.id,
            referrerStudentId: payment.referrerStudentId,
            rateType,
            rateValue,
            saleAmountUsd,
            amountUsd: commissionFor(rateType, rateValue, saleAmountUsd),
            backfilled: true,
          },
        });
        created++;
      }
    }
  }

  console.log(`Backfill complete: ${created} credits created, ${skipped} already present.`);

  // Reconciliation report: ledger sum vs stored aggregate
  const agents = await prisma.agent.findMany({
    select: { id: true, name: true, code: true, totalEarned: true },
  });
  for (const agent of agents) {
    const sum = await prisma.commissionCredit.aggregate({
      where: { agentId: agent.id, status: { not: "REVERSED" } },
      _sum: { amountUsd: true },
    });
    const ledger = sum._sum.amountUsd ?? 0;
    if (Math.abs(ledger - agent.totalEarned) > 0.01) {
      console.warn(
        `  MISMATCH agent ${agent.name} (${agent.code}): ledger $${ledger.toFixed(2)} vs totalEarned $${agent.totalEarned.toFixed(2)}`,
      );
    }
  }
  console.log("Reconciliation report done (mismatches above, if any).");
}

backfill()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
