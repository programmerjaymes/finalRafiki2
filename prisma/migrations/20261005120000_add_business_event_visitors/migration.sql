ALTER TABLE "business_events"
ADD COLUMN "userId" TEXT,
ADD COLUMN "action" VARCHAR(50);

ALTER TABLE "business_events"
ADD CONSTRAINT "business_events_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "businesses"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "business_events"
ADD CONSTRAINT "business_events_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "business_events_userId_idx" ON "business_events"("userId");
CREATE INDEX "business_events_createdAt_idx" ON "business_events"("createdAt");
