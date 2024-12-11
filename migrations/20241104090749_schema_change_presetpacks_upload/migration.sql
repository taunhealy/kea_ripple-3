-- CreateEnum
CREATE TYPE "PresetType" AS ENUM ('PAD', 'LEAD', 'PLUCK', 'BASS', 'FX', 'OTHER');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('PRESETS', 'PACKS');

-- CreateEnum
CREATE TYPE "CartType" AS ENUM ('CART', 'SAVED_FOR_LATER', 'WISHLIST');

-- CreateEnum
CREATE TYPE "CartItemType" AS ENUM ('PRESET', 'PACK');

-- CreateEnum
CREATE TYPE "VSTType" AS ENUM ('SERUM', 'VITAL', 'POLYGRID');

-- CreateEnum
CREATE TYPE "GenreType" AS ENUM ('ELECTRONIC', 'HIP_HOP', 'ROCK', 'METAL', 'HARDWAVE', 'WAVE', 'PHONK', 'FUTURE_BASS', 'COLOR_BASS', 'HOUSE', 'TECHNO', 'TRANCE', 'DUBSTEP', 'DRUM_AND_BASS', 'DRILL', 'AMAPIANO', 'TRAP', 'AMBIENT', 'SYNTHWAVE', 'EXPERIMENTAL', 'IDM', 'BREAKBEAT', 'GLITCH_HOP', 'DOWNTEMPO', 'LO_FI', 'CUSTOM', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "SoundDesigner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "profileImage" TEXT,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoundDesigner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetUpload" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "presetType" "PresetType" NOT NULL,
    "soundPreviewUrl" TEXT,
    "presetFileUrl" TEXT,
    "priceType" "PriceType" NOT NULL DEFAULT 'FREE',
    "price" DOUBLE PRECISION,
    "spotifyLink" TEXT,
    "originalFileName" TEXT,
    "guide" TEXT,
    "tags" TEXT[],
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "contentType" "ContentType" NOT NULL DEFAULT 'PRESETS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "genreId" TEXT,
    "soundDesignerId" TEXT,
    "presetRequestId" TEXT,
    "vstId" TEXT,

    CONSTRAINT "PresetUpload_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Tutorial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "soundPreviewUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "soundDesignerId" TEXT NOT NULL,

    CONSTRAINT "Tutorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeLink" TEXT,
    "enquiryDetails" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "genreId" TEXT,

    CONSTRAINT "PresetRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetSubmission" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "soundPreviewUrl" TEXT,
    "presetFileUrl" TEXT,
    "guide" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "presetRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PresetSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CartType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "itemType" "CartItemType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cartId" TEXT NOT NULL,
    "presetId" TEXT,
    "packId" TEXT,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "presetId" TEXT,
    "sampleId" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VST" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "VST_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "presetId" TEXT,
    "packId" TEXT,
    "cartItemId" TEXT,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackPresets" (
    "presetId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackPresets_pkey" PRIMARY KEY ("presetId","packId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SoundDesigner_userId_key" ON "SoundDesigner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SoundDesigner_username_key" ON "SoundDesigner"("username");

-- CreateIndex
CREATE INDEX "PresetUpload_genreId_idx" ON "PresetUpload"("genreId");

-- CreateIndex
CREATE INDEX "PresetUpload_soundDesignerId_idx" ON "PresetUpload"("soundDesignerId");

-- CreateIndex
CREATE INDEX "PresetUpload_vstId_idx" ON "PresetUpload"("vstId");

-- CreateIndex
CREATE INDEX "PresetUpload_createdAt_idx" ON "PresetUpload"("createdAt");

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

-- CreateIndex
CREATE INDEX "PresetRequest_userId_idx" ON "PresetRequest"("userId");

-- CreateIndex
CREATE INDEX "PresetRequest_genreId_idx" ON "PresetRequest"("genreId");

-- CreateIndex
CREATE INDEX "PresetSubmission_presetRequestId_idx" ON "PresetSubmission"("presetRequestId");

-- CreateIndex
CREATE INDEX "PresetSubmission_userId_idx" ON "PresetSubmission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_type_key" ON "Cart"("userId", "type");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_presetId_idx" ON "CartItem"("presetId");

-- CreateIndex
CREATE INDEX "CartItem_packId_idx" ON "CartItem"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_presetId_packId_key" ON "CartItem"("cartId", "presetId", "packId");

-- CreateIndex
CREATE UNIQUE INDEX "VST_name_key" ON "VST"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE INDEX "PriceHistory_presetId_idx" ON "PriceHistory"("presetId");

-- CreateIndex
CREATE INDEX "PriceHistory_packId_idx" ON "PriceHistory"("packId");

-- CreateIndex
CREATE INDEX "PriceHistory_cartItemId_idx" ON "PriceHistory"("cartItemId");

-- CreateIndex
CREATE INDEX "PackPresets_presetId_idx" ON "PackPresets"("presetId");

-- CreateIndex
CREATE INDEX "PackPresets_packId_idx" ON "PackPresets"("packId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_presetRequestId_fkey" FOREIGN KEY ("presetRequestId") REFERENCES "PresetRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_vstId_fkey" FOREIGN KEY ("vstId") REFERENCES "VST"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetPackUpload" ADD CONSTRAINT "PresetPackUpload_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetDownload" ADD CONSTRAINT "PresetDownload_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetPackDownload" ADD CONSTRAINT "PresetPackDownload_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPackUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetRequest" ADD CONSTRAINT "PresetRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SoundDesigner"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetRequest" ADD CONSTRAINT "PresetRequest_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetSubmission" ADD CONSTRAINT "PresetSubmission_presetRequestId_fkey" FOREIGN KEY ("presetRequestId") REFERENCES "PresetRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetSubmission" ADD CONSTRAINT "PresetSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SoundDesigner"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPackUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPackUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackPresets" ADD CONSTRAINT "PackPresets_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackPresets" ADD CONSTRAINT "PackPresets_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPackUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
