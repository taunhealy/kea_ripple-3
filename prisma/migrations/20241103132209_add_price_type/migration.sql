-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('PRESETS', 'PACKS');

-- AlterTable
ALTER TABLE "Download" ADD COLUMN     "isPurchased" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PresetPack" ADD COLUMN     "priceType" "PriceType" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "PresetUpload" ADD COLUMN     "contentType" "ContentType" NOT NULL DEFAULT 'PRESETS',
ADD COLUMN     "priceType" "PriceType" NOT NULL DEFAULT 'FREE';
