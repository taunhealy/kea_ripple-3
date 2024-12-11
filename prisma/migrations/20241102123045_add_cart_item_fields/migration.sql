/*
  Warnings:

  - You are about to drop the column `itemId` on the `CartItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,presetId,packId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_packId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_presetId_fkey";

-- DropIndex
DROP INDEX "CartItem_cartId_itemId_itemType_key";

-- DropIndex
DROP INDEX "CartItem_itemId_idx";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "itemId",
ADD COLUMN     "packId" TEXT,
ADD COLUMN     "presetId" TEXT;

-- CreateIndex
CREATE INDEX "CartItem_presetId_idx" ON "CartItem"("presetId");

-- CreateIndex
CREATE INDEX "CartItem_packId_idx" ON "CartItem"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_presetId_packId_key" ON "CartItem"("cartId", "presetId", "packId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
