-- CreateEnum
CREATE TYPE "venue"."VenueType" AS ENUM ('CAFE', 'RESTAURANT', 'HISTORICAL_PLACE', 'MUSEUM', 'PARK', 'OTHER');

-- CreateEnum
CREATE TYPE "venue"."InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "venue"."UpdateType" AS ENUM ('GENERAL_INFO', 'MENU', 'FEATURES', 'OPENING_HOURS', 'IMAGES');

-- CreateEnum
CREATE TYPE "venue"."UpdateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "venue"."EventStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "venue"."RewardType" AS ENUM ('EVENT_ATTENDANCE', 'LOYALTY_POINTS', 'SPECIAL_DISCOUNT');

-- CreateEnum
CREATE TYPE "venue"."ReviewType" AS ENUM ('RATING_ONLY', 'QUICK_REVIEW', 'DETAILED_REVIEW');

-- CreateTable
CREATE TABLE "venue"."Venue" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "venue"."VenueType" NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."CafeOwner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "businessLicense" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CafeOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."VenueManager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."ManagerInvitation" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "venue"."InviteStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagerInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."Location" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."MenuItem" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."VenueFeature" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "petsAllowed" BOOLEAN NOT NULL DEFAULT false,
    "quiet" BOOLEAN NOT NULL DEFAULT false,
    "outdoor" BOOLEAN NOT NULL DEFAULT false,
    "wifi" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "accessibility" BOOLEAN NOT NULL DEFAULT false,
    "maxGroupSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."OpeningHour" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."VenueImage" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."VenueUpdate" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "type" "venue"."UpdateType" NOT NULL,
    "oldData" JSONB NOT NULL,
    "newData" JSONB NOT NULL,
    "status" "venue"."UpdateStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."Event" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "status" "venue"."EventStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "comment" TEXT,
    "images" TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "checkInLocation" JSONB,
    "checkInTime" TIMESTAMP(3),
    "reviewType" "venue"."ReviewType" NOT NULL DEFAULT 'RATING_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."Rating" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "overall" INTEGER NOT NULL,
    "atmosphere" INTEGER,
    "service" INTEGER,
    "valueForMoney" INTEGER,
    "cleanliness" INTEGER,
    "foodQuality" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."Reward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "type" "venue"."RewardType" NOT NULL,
    "code" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CafeOwner_userId_key" ON "venue"."CafeOwner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CafeOwner_taxId_key" ON "venue"."CafeOwner"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "VenueManager_userId_key" ON "venue"."VenueManager"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VenueManager_venueId_key" ON "venue"."VenueManager"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "ManagerInvitation_token_key" ON "venue"."ManagerInvitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ManagerInvitation_venueId_email_key" ON "venue"."ManagerInvitation"("venueId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Location_venueId_key" ON "venue"."Location"("venueId");

-- CreateIndex
CREATE INDEX "Review_venueId_isVerified_idx" ON "venue"."Review"("venueId", "isVerified");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_reviewId_key" ON "venue"."Rating"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_code_key" ON "venue"."Reward"("code");

-- AddForeignKey
ALTER TABLE "venue"."Venue" ADD CONSTRAINT "Venue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "venue"."CafeOwner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."VenueManager" ADD CONSTRAINT "VenueManager_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venue"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."VenueManager" ADD CONSTRAINT "VenueManager_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "venue"."CafeOwner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."ManagerInvitation" ADD CONSTRAINT "ManagerInvitation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "venue"."CafeOwner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."ManagerInvitation" ADD CONSTRAINT "ManagerInvitation_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venue"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."Location" ADD CONSTRAINT "Location_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venue"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."MenuItem" ADD CONSTRAINT "MenuItem_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venue"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."VenueFeature" ADD CONSTRAINT "VenueFeature_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venue"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."OpeningHour" ADD CONSTRAINT "OpeningHour_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venue"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."VenueImage" ADD CONSTRAINT "VenueImage_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venue"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."VenueUpdate" ADD CONSTRAINT "VenueUpdate_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venue"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."Event" ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venue"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."Review" ADD CONSTRAINT "Review_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venue"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."Rating" ADD CONSTRAINT "Rating_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "venue"."Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."Reward" ADD CONSTRAINT "Reward_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venue"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
