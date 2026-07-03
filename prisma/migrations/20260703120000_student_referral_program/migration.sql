-- Student referral program: per-student referral fields, referrer link on payments,
-- and a per-business ReferralSettings row for configurable defaults.

-- AlterTable: Student referral fields
ALTER TABLE "Student" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "discountType" "DiscountType",
ADD COLUMN     "discountValue" DOUBLE PRECISION,
ADD COLUMN     "commissionType" "CommissionType",
ADD COLUMN     "commissionValue" DOUBLE PRECISION,
ADD COLUMN     "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "additionalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Student_referralCode_key" ON "Student"("referralCode");

-- AlterTable: Payment referrer link
ALTER TABLE "Payment" ADD COLUMN     "referrerStudentId" TEXT;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_referrerStudentId_fkey" FOREIGN KEY ("referrerStudentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ReferralSettings" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "studentReferralEnabled" BOOLEAN NOT NULL DEFAULT true,
    "studentDiscountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "studentDiscountValue" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "studentCommissionType" "CommissionType" NOT NULL DEFAULT 'PERCENTAGE',
    "studentCommissionValue" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "agentDiscountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "agentDiscountValue" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "agentCommissionType" "CommissionType" NOT NULL DEFAULT 'PERCENTAGE',
    "agentCommissionValue" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ReferralSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferralSettings_businessId_key" ON "ReferralSettings"("businessId");

-- AddForeignKey
ALTER TABLE "ReferralSettings" ADD CONSTRAINT "ReferralSettings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
