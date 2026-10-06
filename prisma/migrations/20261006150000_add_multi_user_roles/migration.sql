CREATE TABLE "user_role_assignments" (
  "userId" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  CONSTRAINT "user_role_assignments_pkey" PRIMARY KEY ("userId", "role")
);

CREATE INDEX "user_role_assignments_role_idx" ON "user_role_assignments"("role");
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "user_role_assignments" ("userId", "role")
SELECT id, role FROM "users" ON CONFLICT DO NOTHING;
