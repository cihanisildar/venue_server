-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'CAFE_OWNER', 'VENUE_MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TimePreference" AS ENUM ('EARLY_MORNING', 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'ANY');

-- CreateEnum
CREATE TYPE "NoisePreference" AS ENUM ('SILENT', 'QUIET', 'MODERATE', 'LIVELY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "age" INTEGER,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "reliabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "restrictedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "petsAllowed" BOOLEAN NOT NULL DEFAULT false,
    "quiet" BOOLEAN NOT NULL DEFAULT false,
    "outdoor" BOOLEAN NOT NULL DEFAULT false,
    "wifi" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "accessibility" BOOLEAN NOT NULL DEFAULT false,
    "studyPlace" BOOLEAN NOT NULL DEFAULT false,
    "noiseLevel" "NoisePreference" DEFAULT 'MODERATE',
    "preferredTime" "TimePreference" DEFAULT 'ANY',
    "groupSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
