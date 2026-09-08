ALTER TABLE "Lead"
  ADD COLUMN "telegramDelivered" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "telegramError" TEXT,
  ADD COLUMN "telegramSentAt" TIMESTAMP(3);

