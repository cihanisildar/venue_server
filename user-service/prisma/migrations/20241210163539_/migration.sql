/*
  Warnings:

  - The `birthdate` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user"."UserProfile" DROP COLUMN "birthdate",
ADD COLUMN     "birthdate" TIMESTAMP(3);
