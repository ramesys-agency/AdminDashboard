/*
  Warnings:

  - You are about to drop the column `discountPercent` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `discountPercent` on the `Coupon` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FLAT');

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "discountPercent";

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "discountPercent",
ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
ADD COLUMN     "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 10;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_courseEnrollmentId_fkey" FOREIGN KEY ("courseEnrollmentId") REFERENCES "CourseEnrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
