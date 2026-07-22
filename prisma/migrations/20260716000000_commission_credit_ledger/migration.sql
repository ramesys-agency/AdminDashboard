-- CreateEnum
CREATE TYPE "CreditStatus" AS ENUM ('EARNED', 'REVERSED', 'PAID_OUT');

-- CreateTable
CREATE TABLE "CommissionCredit" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "agentId" TEXT,
    "referrerStudentId" TEXT,
    "rateType" "CommissionType" NOT NULL,
    "rateValue" DOUBLE PRECISION NOT NULL,
    "saleAmountUsd" DOUBLE PRECISION NOT NULL,
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "status" "CreditStatus" NOT NULL DEFAULT 'EARNED',
    "backfilled" BOOLEAN NOT NULL DEFAULT false,
    "reversedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionCredit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommissionCredit_agentId_status_idx" ON "CommissionCredit"("agentId", "status");

-- CreateIndex
CREATE INDEX "CommissionCredit_referrerStudentId_status_idx" ON "CommissionCredit"("referrerStudentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionCredit_paymentId_agentId_key" ON "CommissionCredit"("paymentId", "agentId");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionCredit_paymentId_referrerStudentId_key" ON "CommissionCredit"("paymentId", "referrerStudentId");

-- AddForeignKey
ALTER TABLE "CommissionCredit" ADD CONSTRAINT "CommissionCredit_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionCredit" ADD CONSTRAINT "CommissionCredit_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionCredit" ADD CONSTRAINT "CommissionCredit_referrerStudentId_fkey" FOREIGN KEY ("referrerStudentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
