-- Add activeSessionToken column to users table for single session enforcement
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activeSessionToken" TEXT;

-- Create unique index on activeSessionToken
CREATE UNIQUE INDEX IF NOT EXISTS "users_activeSessionToken_key" ON "users"("activeSessionToken");
