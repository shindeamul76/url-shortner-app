/*
  Warnings:

  - Added the required column `maxRequests` to the `RateLimit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RateLimit" ADD COLUMN     "maxRequests" INTEGER NOT NULL,
ADD COLUMN     "timeWindowEnd" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RedirectLog" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "ShortURL" ADD COLUMN     "clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "lastAccessed" TIMESTAMP(3);
