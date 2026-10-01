CREATE TYPE "AppExpenseCategory" AS ENUM (
  'DEPLOYMENT', 'DATABASE', 'HOSTING', 'DOMAIN', 'SMS',
  'SOFTWARE', 'MAINTENANCE', 'MARKETING', 'OTHER'
);

CREATE TYPE "AppExpenseStatus" AS ENUM ('PAID', 'PENDING', 'OVERDUE');

CREATE TABLE "app_expenses" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" "AppExpenseCategory" NOT NULL,
  "vendor" TEXT,
  "reference" TEXT,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'TZS',
  "status" "AppExpenseStatus" NOT NULL DEFAULT 'PAID',
  "paidAt" TIMESTAMP(3),
  "applicableFrom" TIMESTAMP(3) NOT NULL,
  "applicableTo" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "evidenceUrl" TEXT,
  "evidenceName" TEXT,
  "evidenceMimeType" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "app_expenses_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "app_expenses_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "app_expenses_category_idx" ON "app_expenses"("category");
CREATE INDEX "app_expenses_status_idx" ON "app_expenses"("status");
CREATE INDEX "app_expenses_applicableFrom_applicableTo_idx"
  ON "app_expenses"("applicableFrom", "applicableTo");
CREATE INDEX "app_expenses_createdById_idx" ON "app_expenses"("createdById");
