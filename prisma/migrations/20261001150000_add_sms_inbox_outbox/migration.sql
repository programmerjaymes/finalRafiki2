CREATE TYPE "SmsDeliveryStatus" AS ENUM ('SENT', 'FAILED');
CREATE TABLE "sms_messages" (
  "id" TEXT NOT NULL,
  "recipientId" TEXT,
  "sentById" TEXT,
  "recipientName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "SmsDeliveryStatus" NOT NULL,
  "errorMessage" TEXT,
  "gatewaySenderId" TEXT,
  "creditsRemaining" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sms_messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "sms_messages_status_idx" ON "sms_messages"("status");
CREATE INDEX "sms_messages_recipient_id_idx" ON "sms_messages"("recipientId");
CREATE INDEX "sms_messages_sent_by_id_idx" ON "sms_messages"("sentById");
CREATE INDEX "sms_messages_created_at_idx" ON "sms_messages"("createdAt");
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
