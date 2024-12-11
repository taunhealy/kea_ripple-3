/*
  Warnings:

  - You are about to drop the column `price` on the `PresetUpload` table. All the data in the column will be lost.
  - You are about to drop the `Download` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PresetPack` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `PresetUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `VST` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VstType" AS ENUM ('SERUM', 'VITAL');

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_packId_fkey";

-- DropForeignKey
ALTER TABLE "Download" DROP CONSTRAINT "Download_packId_fkey";

-- DropForeignKey
ALTER TABLE "Download" DROP CONSTRAINT "Download_presetId_fkey";

-- DropForeignKey
ALTER TABLE "PackPresets" DROP CONSTRAINT "PackPresets_packId_fkey";

-- DropForeignKey
ALTER TABLE "PresetPack" DROP CONSTRAINT "PresetPack_soundDesignerId_fkey";

-- DropForeignKey
ALTER TABLE "PriceHistory" DROP CONSTRAINT "PriceHistory_packId_fkey";

-- DropIndex
DROP INDEX "VST_name_key";

-- AlterTable
ALTER TABLE "PresetUpload" DROP COLUMN "price",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "presetType" SET DEFAULT 'LEAD';

-- AlterTable
ALTER TABLE "VST" ADD COLUMN     "type" "VstType" NOT NULL;

-- DropTable
DROP TABLE "Download";

-- DropTable
DROP TABLE "PresetPack";

-- DropEnum
DROP TYPE "VSTType";

-- CreateTable
CREATE TABLE "PresetPackUpload" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "priceType" "PriceType" NOT NULL DEFAULT 'FREE',
    "price" DOUBLE PRECISION,
    "soundPreviewUrl" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "soundDesignerId" TEXT,

    CONSTRAINT "PresetPackUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetDownload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "presetId" TEXT NOT NULL,

    CONSTRAINT "PresetDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetPackDownload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "packId" TEXT NOT NULL,

    CONSTRAINT "PresetPackDownload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PresetPackUpload_soundDesignerId_idx" ON "PresetPackUpload"("soundDesignerId");

-- CreateIndex
CREATE INDEX "PresetPackUpload_createdAt_idx" ON "PresetPackUpload"("createdAt");

-- CreateIndex
CREATE INDEX "PresetDownload_userId_idx" ON "PresetDownload"("userId");

-- CreateIndex
CREATE INDEX "PresetDownload_presetId_idx" ON "PresetDownload"("presetId");

-- CreateIndex
CREATE INDEX "PresetPackDownload_userId_idx" ON "PresetPackDownload"("userId");

-- CreateIndex
CREATE INDEX "PresetPackDownload_packId_idx" ON "PresetPackDownload"("packId");

-- AddForeignKey
ALTER TABLE "PresetPackUpload" ADD CONSTRAINT "PresetPackUpload_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetDownload" ADD CONSTRAINT "PresetDownload_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetPackDownload" ADD CONSTRAINT "PresetPackDownload_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPackUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPackUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPackUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackPresets" ADD CONSTRAINT "PackPresets_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPackUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
