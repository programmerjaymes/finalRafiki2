ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'AGENT';

ALTER TABLE "users" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "users" ADD COLUMN "mobileSessionToken" TEXT;
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");
CREATE UNIQUE INDEX "users_mobileSessionToken_key" ON "users"("mobileSessionToken");

ALTER TABLE "system_settings" ADD COLUMN "agentCommissionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

ALTER TABLE "businesses"
  ADD COLUMN "referralAgentId" TEXT,
  ADD COLUMN "agentCommissionAmount" DOUBLE PRECISION,
  ADD COLUMN "agentCommissionPaid" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "agentCommissionPaidAt" TIMESTAMP(3);

CREATE INDEX "businesses_referralAgentId_idx" ON "businesses"("referralAgentId");
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_referralAgentId_fkey"
  FOREIGN KEY ("referralAgentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "application_logs" ADD COLUMN "source" VARCHAR(10) NOT NULL DEFAULT 'WEB';
ALTER TABLE "audit_trail" ADD COLUMN "source" VARCHAR(10) NOT NULL DEFAULT 'WEB';

CREATE TABLE "usage_sessions" (
  "id" TEXT NOT NULL,
  "installationId" TEXT NOT NULL,
  "source" VARCHAR(10) NOT NULL,
  "userId" TEXT,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastActivity" TEXT,
  "appVersion" TEXT,
  CONSTRAINT "usage_sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "usage_sessions_source_installationId_key" ON "usage_sessions"("source", "installationId");
CREATE INDEX "usage_sessions_source_lastSeenAt_idx" ON "usage_sessions"("source", "lastSeenAt");
CREATE INDEX "usage_sessions_userId_idx" ON "usage_sessions"("userId");
