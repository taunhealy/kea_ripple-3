/*
  Warnings:

  - You are about to drop the column `contentType` on the `PresetUpload` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `VST` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `itemType` on the `CartItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `itemType` on the `WishlistItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('PRESET', 'PACK', 'REQUEST');

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "itemType",
ADD COLUMN     "itemType" "ItemType" NOT NULL;

-- AlterTable
ALTER TABLE "PresetUpload" DROP COLUMN "contentType",
ADD COLUMN     "itemType" "ItemType" NOT NULL DEFAULT 'PRESET',
ADD COLUMN     "referenceTrackUrl" TEXT;

-- AlterTable
ALTER TABLE "WishlistItem" DROP COLUMN "itemType",
ADD COLUMN     "itemType" "ItemType" NOT NULL;

-- DropEnum
DROP TYPE "CartItemType";

-- DropEnum
DROP TYPE "ContentType";

-- CreateIndex
CREATE UNIQUE INDEX "VST_name_key" ON "VST"("name");
