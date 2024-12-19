/*
  Warnings:

  - A unique constraint covering the columns `[userId,packId]` on the table `PresetPackDownload` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeAccountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PresetPackDownload_userId_packId_key" ON "PresetPackDownload"("userId", "packId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeAccountId_key" ON "User"("stripeAccountId");
