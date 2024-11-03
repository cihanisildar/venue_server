/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `UserPreference` will be added. If there are existing duplicate values, this will fail.

*/
-- DropTable
DROP TABLE "user"."User";

-- CreateTable
CREATE TABLE "user"."UserProfile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "age" INTEGER,
    "phoneNumber" TEXT,
    "role" "user"."UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "reliabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "restrictedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "user"."UserProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_username_key" ON "user"."UserProfile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "user"."UserPreference"("userId");

-- AddForeignKey
ALTER TABLE "user"."UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
