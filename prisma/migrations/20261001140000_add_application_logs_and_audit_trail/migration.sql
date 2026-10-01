CREATE TABLE "application_logs" (
  "id" TEXT NOT NULL,
  "level" VARCHAR(20) NOT NULL,
  "message" TEXT NOT NULL,
  "route" TEXT,
  "method" VARCHAR(10),
  "statusCode" INTEGER,
  "stack" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "application_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "application_logs_level_idx" ON "application_logs"("level");
CREATE INDEX "application_logs_status_code_idx" ON "application_logs"("statusCode");
CREATE INDEX "application_logs_created_at_idx" ON "application_logs"("createdAt");

CREATE TABLE "audit_trail" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" VARCHAR(100) NOT NULL,
  "entityType" VARCHAR(100) NOT NULL,
  "entityId" TEXT,
  "description" TEXT,
  "metadata" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_trail_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_trail_actor_id_idx" ON "audit_trail"("actorId");
CREATE INDEX "audit_trail_action_idx" ON "audit_trail"("action");
CREATE INDEX "audit_trail_entity_idx" ON "audit_trail"("entityType", "entityId");
CREATE INDEX "audit_trail_created_at_idx" ON "audit_trail"("createdAt");
ALTER TABLE "audit_trail" ADD CONSTRAINT "audit_trail_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
