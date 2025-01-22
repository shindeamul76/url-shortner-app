/*
  Warnings:

  - The `topic` column on the `ShortURL` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Topic" AS ENUM ('acquisition', 'activation', 'retention');

-- AlterTable
ALTER TABLE "ShortURL" DROP COLUMN "topic",
ADD COLUMN     "topic" "Topic";
