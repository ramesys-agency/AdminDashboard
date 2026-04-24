import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function syncAgentEarnings() {
  console.log("Starting agent earnings synchronization...");

  const agents = await prisma.agent.findMany({
    include: {
      payments: {
        where: { status: "COMPLETED" },
      },
    },
  });

  console.log(`Found ${agents.length} agents to process.`);

  for (const agent of agents) {
    let totalEarned = 0;

    for (const payment of agent.payments) {
      if (agent.commissionType === "PERCENTAGE") {
        totalEarned += (payment.amount * (agent.commissionValue || 0)) / 100;
      } else {
        totalEarned += agent.commissionValue || 0;
      }
    }

    console.log(
      `Agent ${agent.name} (${agent.code}): Calculated totalEarned = $${totalEarned.toLocaleString()}`,
    );

    await prisma.agent.update({
      where: { id: agent.id },
      data: { totalEarned },
    });
  }

  console.log("Earnings synchronization complete!");
}

syncAgentEarnings()
  .catch((e) => {
    console.error("Error during synchronization:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
