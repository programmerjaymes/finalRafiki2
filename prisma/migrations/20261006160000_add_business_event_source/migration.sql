ALTER TABLE "business_events" ADD COLUMN "source" VARCHAR(10) NOT NULL DEFAULT 'WEB';
CREATE INDEX "business_events_source_idx" ON "business_events"("source");
