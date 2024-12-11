/*
  Warnings:

  - A unique constraint covering the columns `[userId,presetId]` on the table `PresetDownload` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PresetDownload_presetId_idx";

-- DropIndex
DROP INDEX "PresetDownload_userId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "PresetDownload_userId_presetId_key" ON "PresetDownload"("userId", "presetId");
