-- CreateEnum
CREATE TYPE "AuctionPlatform" AS ENUM ('COPART', 'IAAI');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED', 'SPAM');

-- CreateEnum
CREATE TYPE "SocialChannel" AS ENUM ('TELEGRAM', 'FACEBOOK', 'INSTAGRAM', 'VIBER');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('QUEUED', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PublicationDecision" AS ENUM ('PENDING', 'APPROVED', 'EXCLUDED');

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "identityKey" TEXT NOT NULL,
    "externalId" TEXT,
    "slug" TEXT NOT NULL,
    "vin" TEXT,
    "lotNumber" TEXT NOT NULL,
    "platform" "AuctionPlatform" NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "trim" TEXT,
    "vehicleType" TEXT,
    "bodyStyle" TEXT,
    "engine" TEXT,
    "fuel" TEXT,
    "transmission" TEXT,
    "drive" TEXT,
    "color" TEXT,
    "odometerMiles" INTEGER,
    "odometerKm" INTEGER,
    "primaryDamage" TEXT,
    "secondaryDamage" TEXT,
    "lossType" TEXT,
    "keysAvailable" BOOLEAN,
    "runCondition" TEXT,
    "currentBid" INTEGER,
    "buyNowPrice" INTEGER,
    "estimatedValue" INTEGER,
    "lastSoldPrice" INTEGER,
    "auctionDate" TIMESTAMP(3),
    "auctionStatus" TEXT,
    "seller" TEXT,
    "sellerType" TEXT,
    "facility" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "saleDocument" TEXT,
    "titleType" TEXT,
    "sourceUrl" TEXT,
    "videoUrl" TEXT,
    "media360Url" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "publicationDecision" "PublicationDecision" NOT NULL DEFAULT 'PENDING',
    "rawData" JSONB NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehiclePhoto" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehiclePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionSyncLog" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "provider" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'RUNNING',
    "apiRequests" INTEGER NOT NULL DEFAULT 0,
    "receivedRecords" INTEGER NOT NULL DEFAULT 0,
    "createdRecords" INTEGER NOT NULL DEFAULT 0,
    "updatedRecords" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "messenger" TEXT,
    "interest" TEXT,
    "vehicleId" TEXT,
    "vin" TEXT,
    "lotNumber" TEXT,
    "vehicleTitle" TEXT,
    "vehicleUrl" TEXT,
    "source" TEXT,
    "sourceChannel" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPublication" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "channel" "SocialChannel" NOT NULL,
    "status" "PublicationStatus" NOT NULL DEFAULT 'QUEUED',
    "externalPostId" TEXT,
    "externalPostUrl" TEXT,
    "postText" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPublicationError" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT,
    "vehicleId" TEXT NOT NULL,
    "channel" "SocialChannel" NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialPublicationError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialTemplate" (
    "id" TEXT NOT NULL,
    "channel" "SocialChannel" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialChannelSetting" (
    "id" TEXT NOT NULL,
    "channel" "SocialChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "dailyLimit" INTEGER NOT NULL DEFAULT 1,
    "timeWindows" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialChannelSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_slug_key" ON "Vehicle"("slug");

-- Stable platform + lot identity remains unique even when VIN is missing.
CREATE UNIQUE INDEX "Vehicle_identityKey_key" ON "Vehicle"("identityKey");

-- CreateIndex
CREATE INDEX "Vehicle_isActive_auctionDate_idx" ON "Vehicle"("isActive", "auctionDate");

-- CreateIndex
CREATE INDEX "Vehicle_make_model_idx" ON "Vehicle"("make", "model");

-- CreateIndex
CREATE INDEX "Vehicle_platform_auctionStatus_idx" ON "Vehicle"("platform", "auctionStatus");

-- CreateIndex
CREATE INDEX "Vehicle_currentBid_idx" ON "Vehicle"("currentBid");

-- CreateIndex
-- CreateIndex
CREATE INDEX "VehiclePhoto_vehicleId_position_idx" ON "VehiclePhoto"("vehicleId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "VehiclePhoto_vehicleId_url_key" ON "VehiclePhoto"("vehicleId", "url");

-- CreateIndex
CREATE INDEX "AuctionSyncLog_startedAt_idx" ON "AuctionSyncLog"("startedAt");

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SocialPublication_status_scheduledAt_idx" ON "SocialPublication"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "SocialPublication_channel_publishedAt_idx" ON "SocialPublication"("channel", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SocialPublication_vehicleId_channel_key" ON "SocialPublication"("vehicleId", "channel");

-- CreateIndex
CREATE INDEX "SocialPublicationError_timestamp_idx" ON "SocialPublicationError"("timestamp");

-- CreateIndex
CREATE INDEX "SocialPublicationError_channel_vehicleId_idx" ON "SocialPublicationError"("channel", "vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialTemplate_channel_key" ON "SocialTemplate"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "SocialChannelSetting_channel_key" ON "SocialChannelSetting"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- AddForeignKey
ALTER TABLE "VehiclePhoto" ADD CONSTRAINT "VehiclePhoto_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPublication" ADD CONSTRAINT "SocialPublication_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPublicationError" ADD CONSTRAINT "SocialPublicationError_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "SocialPublication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPublicationError" ADD CONSTRAINT "SocialPublicationError_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
