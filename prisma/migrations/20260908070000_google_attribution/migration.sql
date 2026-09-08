ALTER TABLE "Lead"
  ADD COLUMN "utmTerm" TEXT,
  ADD COLUMN "gclid" TEXT,
  ADD COLUMN "gbraid" TEXT,
  ADD COLUMN "wbraid" TEXT;

CREATE INDEX "Lead_gclid_idx" ON "Lead"("gclid");
