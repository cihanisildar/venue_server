/*
  Warnings:

  - You are about to drop the column `age` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user"."UserProfile" DROP COLUMN "age",
ADD COLUMN     "birthdate" TIMESTAMP(3);
