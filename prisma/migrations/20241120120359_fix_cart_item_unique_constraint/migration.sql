/*
  Warnings:

  - A unique constraint covering the columns `[cartId,presetId,packId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CartItem_presetId_packId_key";

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_presetId_packId_key" ON "CartItem"("cartId", "presetId", "packId");
