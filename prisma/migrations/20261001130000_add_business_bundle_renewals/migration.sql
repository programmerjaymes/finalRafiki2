CREATE TYPE "BusinessRenewalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "BusinessBundleHistorySource" AS ENUM ('INITIAL', 'RENEWAL');

CREATE TABLE "business_bundle_history" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "bundleName" TEXT NOT NULL,
    "bundlePrice" DOUBLE PRECISION NOT NULL,
    "bundleDuration" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "source" "BusinessBundleHistorySource" NOT NULL DEFAULT 'INITIAL',
    "renewalRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_bundle_history_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "business_bundle_history_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "business_renewal_requests" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "previousBundleId" TEXT NOT NULL,
    "previousBundleName" TEXT NOT NULL,
    "previousStartedAt" TIMESTAMP(3) NOT NULL,
    "previousExpiresAt" TIMESTAMP(3) NOT NULL,
    "newBundleId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "paymentReference" TEXT,
    "status" "BusinessRenewalStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "decidedById" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    CONSTRAINT "business_renewal_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "business_renewal_requests_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "business_renewal_requests_newBundleId_fkey"
      FOREIGN KEY ("newBundleId") REFERENCES "bundles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "business_bundle_history_renewalRequestId_key"
  ON "business_bundle_history"("renewalRequestId");
CREATE INDEX "business_bundle_history_businessId_startedAt_idx"
  ON "business_bundle_history"("businessId", "startedAt");
CREATE INDEX "business_renewal_requests_businessId_status_idx"
  ON "business_renewal_requests"("businessId", "status");
CREATE INDEX "business_renewal_requests_status_requestedAt_idx"
  ON "business_renewal_requests"("status", "requestedAt");

INSERT INTO "business_bundle_history"
  ("id", "businessId", "bundleId", "bundleName", "bundlePrice", "bundleDuration",
   "startedAt", "expiresAt", "source", "createdAt")
SELECT
  md5(random()::text || clock_timestamp()::text || b.id),
  b.id,
  b."bundleId",
  bu.name,
  bu.price,
  bu.duration,
  b."createdAt",
  b."bundleExpiresAt",
  'INITIAL'::"BusinessBundleHistorySource",
  CURRENT_TIMESTAMP
FROM "businesses" b
JOIN "bundles" bu ON bu.id = b."bundleId";
