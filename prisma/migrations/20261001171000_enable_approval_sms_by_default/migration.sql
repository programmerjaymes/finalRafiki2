ALTER TABLE "system_settings" ALTER COLUMN "approvalSmsNotificationsEnabled" SET DEFAULT true;
INSERT INTO "system_settings" ("id", "approvalSmsNotificationsEnabled", "createdAt", "updatedAt")
VALUES ('global', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
