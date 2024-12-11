/*
  Warnings:

  - The values [SAVED_FOR_LATER] on the enum `CartType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CartType_new" AS ENUM ('CART', 'WISHLIST');
ALTER TABLE "Cart" ALTER COLUMN "type" TYPE "CartType_new" USING ("type"::text::"CartType_new");
ALTER TYPE "CartType" RENAME TO "CartType_old";
ALTER TYPE "CartType_new" RENAME TO "CartType";
DROP TYPE "CartType_old";
COMMIT;

-- DropIndex
DROP INDEX "Cart_userId_type_key";

-- AlterTable
ALTER TABLE "Cart" ALTER COLUMN "type" SET DEFAULT 'CART';

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "priceAlerts" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "itemType" "CartItemType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "presetId" TEXT,
    "packId" TEXT,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_key" ON "Wishlist"("userId");

-- CreateIndex
CREATE INDEX "WishlistItem_wishlistId_idx" ON "WishlistItem"("wishlistId");

-- CreateIndex
CREATE INDEX "WishlistItem_presetId_idx" ON "WishlistItem"("presetId");

-- CreateIndex
CREATE INDEX "WishlistItem_packId_idx" ON "WishlistItem"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_wishlistId_presetId_packId_key" ON "WishlistItem"("wishlistId", "presetId", "packId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPackUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
