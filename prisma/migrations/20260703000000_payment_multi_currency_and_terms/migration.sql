-- AlterTable
ALTER TABLE "BatchPricing" ADD COLUMN     "originalPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CourseEnrollment" ADD COLUMN     "acceptedTerms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptedTermsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CoursePricing" ADD COLUMN     "originalPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "acceptedTerms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptedTermsAt" TIMESTAMP(3),
ADD COLUMN     "amountInINR" DOUBLE PRECISION,
ADD COLUMN     "exchangeRate" DOUBLE PRECISION;
