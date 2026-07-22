import { PrismaClient } from "@prisma/client";

// Reports collisions in the shared code namespace (Coupon.code, Agent.code,
// Student.referralCode). Checkout resolves coupons first, so a coupon/agent
// code equal to a student's referral code silently shadows it — createCoupon
// and createAgent now reject new collisions, but pre-existing ones must be
// resolved manually.
//
// Run with: npx tsx scripts/audit-code-collisions.ts

const prisma = new PrismaClient();

async function audit() {
  const [coupons, agents, students] = await Promise.all([
    prisma.coupon.findMany({ select: { code: true } }),
    prisma.agent.findMany({ select: { code: true, name: true } }),
    prisma.student.findMany({
      where: { referralCode: { not: null } },
      select: { referralCode: true, name: true, email: true },
    }),
  ]);

  const couponCodes = new Set(coupons.map((c) => c.code.toUpperCase()));
  const agentByCode = new Map(agents.map((a) => [a.code.toUpperCase(), a]));

  let collisions = 0;
  for (const student of students) {
    const code = student.referralCode!.toUpperCase();
    if (couponCodes.has(code)) {
      collisions++;
      console.warn(
        `SHADOWED: student ${student.name} <${student.email}> referral code "${code}" is also a coupon — the student's code never resolves at checkout.`,
      );
    }
    const agent = agentByCode.get(code);
    if (agent) {
      collisions++;
      console.warn(
        `COLLISION: student ${student.name} <${student.email}> referral code "${code}" is also agent "${agent.name}"'s code.`,
      );
    }
  }

  // Agent codes are expected to have a same-code coupon (created as a pair) —
  // flag agents whose coupon is missing instead.
  for (const agent of agents) {
    if (!couponCodes.has(agent.code.toUpperCase())) {
      console.warn(
        `ORPHANED AGENT: "${agent.name}" code "${agent.code}" has no matching coupon — their code won't work at checkout.`,
      );
    }
  }

  console.log(
    collisions === 0
      ? "No student-code collisions found."
      : `${collisions} collision(s) found — resolve by regenerating the student's code or renaming the coupon/agent.`,
  );
}

audit()
  .catch((err) => {
    console.error("Audit failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
