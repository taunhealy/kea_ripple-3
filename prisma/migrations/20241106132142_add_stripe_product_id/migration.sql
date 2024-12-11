/*
  Warnings:

  - A unique constraint covering the columns `[stripeProductId]` on the table `PresetUpload` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PresetUpload" ADD COLUMN     "stripeProductId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PresetUpload_stripeProductId_key" ON "PresetUpload"("stripeProductId");
