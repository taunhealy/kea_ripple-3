/*
  Warnings:

  - You are about to drop the column `lastPriceSync` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `packId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `presetId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `priceAlert` on the `CartItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,itemId,itemType]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemType` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CartItemType" AS ENUM ('PRESET', 'PACK');

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_packId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_presetId_fkey";

-- DropIndex
DROP INDEX "CartItem_packId_idx";

-- DropIndex
DROP INDEX "CartItem_presetId_idx";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "lastPriceSync",
DROP COLUMN "packId",
DROP COLUMN "presetId",
DROP COLUMN "priceAlert",
ADD COLUMN     "itemId" TEXT NOT NULL,
ADD COLUMN     "itemType" "CartItemType" NOT NULL;

-- AlterTable
ALTER TABLE "PresetUpload" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "CartItem_itemId_idx" ON "CartItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_itemId_itemType_key" ON "CartItem"("cartId", "itemId", "itemType");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_presetId_fkey" FOREIGN KEY ("itemId") REFERENCES "PresetUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_packId_fkey" FOREIGN KEY ("itemId") REFERENCES "PresetPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
