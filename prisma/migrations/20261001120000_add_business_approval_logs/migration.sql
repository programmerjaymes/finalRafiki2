CREATE TABLE "business_approval_logs" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_approval_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "business_approval_logs_businessId_idx"
    ON "business_approval_logs"("businessId");

CREATE INDEX "business_approval_logs_approvedById_idx"
    ON "business_approval_logs"("approvedById");

CREATE INDEX "business_approval_logs_approvedAt_idx"
    ON "business_approval_logs"("approvedAt");

ALTER TABLE "business_approval_logs"
    ADD CONSTRAINT "business_approval_logs_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "businesses"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "business_approval_logs"
    ADD CONSTRAINT "business_approval_logs_approvedById_fkey"
    FOREIGN KEY ("approvedById") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve visibility history for businesses approved before this audit trail existed.
INSERT INTO "business_approval_logs" ("id", "businessId", "approvedAt")
SELECT
    CONCAT('legacy_', SUBSTRING(MD5("id") FROM 1 FOR 18)),
    "id",
    "updatedAt"
FROM "businesses"
WHERE "isApproved" = true;
