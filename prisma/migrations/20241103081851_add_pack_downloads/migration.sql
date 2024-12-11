/*
  Warnings:

  - A unique constraint covering the columns `[userId,presetId,packId]` on the table `Download` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Download` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Download_userId_presetId_idx";

-- AlterTable
ALTER TABLE "Download" ADD COLUMN     "packId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Download_userId_idx" ON "Download"("userId");

-- CreateIndex
CREATE INDEX "Download_presetId_idx" ON "Download"("presetId");

-- CreateIndex
CREATE INDEX "Download_packId_idx" ON "Download"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "Download_userId_presetId_packId_key" ON "Download"("userId", "presetId", "packId");

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
