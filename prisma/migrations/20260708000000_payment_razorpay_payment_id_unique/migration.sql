-- Idempotency backstop: one Payment row per Razorpay payment, so a webhook
-- retry racing the client's /payment/verify call cannot double-credit
-- referral earnings. NULLs (non-Razorpay payments) remain unrestricted.
-- If this migration fails, duplicate razorpayPaymentId rows already exist
-- from a past race — dedupe them manually before re-running:
--   SELECT "razorpayPaymentId", COUNT(*) FROM "Payment"
--   WHERE "razorpayPaymentId" IS NOT NULL
--   GROUP BY 1 HAVING COUNT(*) > 1;
CREATE UNIQUE INDEX "Payment_razorpayPaymentId_key" ON "Payment"("razorpayPaymentId");
