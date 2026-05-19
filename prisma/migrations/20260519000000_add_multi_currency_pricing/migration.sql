/*
  Multi-currency pricing support.
  - Replace flat price/priceINR/priceUSD columns on Course and CourseBatch with
    relational CoursePricing and BatchPricing tables.
  - Replace flat discountType/discountValue on Coupon with CouponDiscount table,
    enabling per-currency discount rules per coupon code.
*/

-- CreateTable
CREATE TABLE "CoursePricing" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CoursePricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchPricing" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BatchPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponDiscount" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CouponDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoursePricing_courseId_currency_key" ON "CoursePricing"("courseId", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "BatchPricing_batchId_currency_key" ON "BatchPricing"("batchId", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "CouponDiscount_couponId_currency_key" ON "CouponDiscount"("couponId", "currency");

-- AddForeignKey
ALTER TABLE "CoursePricing" ADD CONSTRAINT "CoursePricing_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchPricing" ADD CONSTRAINT "BatchPricing_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "CourseBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponDiscount" ADD CONSTRAINT "CouponDiscount_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: drop old flat price columns from Course
ALTER TABLE "Course" DROP COLUMN IF EXISTS "price",
DROP COLUMN IF EXISTS "priceINR",
DROP COLUMN IF EXISTS "priceUSD";

-- AlterTable: drop old flat price columns from CourseBatch
ALTER TABLE "CourseBatch" DROP COLUMN IF EXISTS "price",
DROP COLUMN IF EXISTS "priceINR",
DROP COLUMN IF EXISTS "priceUSD";

-- AlterTable: drop old flat discount columns from Coupon
ALTER TABLE "Coupon" DROP COLUMN IF EXISTS "discountType",
DROP COLUMN IF EXISTS "discountValue";
