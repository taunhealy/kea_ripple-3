-- CreateEnum
CREATE TYPE "PresetType" AS ENUM ('PAD', 'LEAD', 'PLUCK', 'BASS', 'FX', 'OTHER');

-- CreateEnum
CREATE TYPE "VSTType" AS ENUM ('SERUM', 'VITAL', 'POLYGRID');

-- CreateEnum
CREATE TYPE "GenreType" AS ENUM ('ELECTRONIC', 'HIP_HOP', 'ROCK', 'METAL', 'HARDWAVE', 'WAVE', 'PHONK', 'FUTURE_BASS', 'COLOR_BASS', 'HOUSE', 'TECHNO', 'TRANCE', 'DUBSTEP', 'DRUM_AND_BASS', 'DRILL', 'AMAPIANO', 'TRAP', 'AMBIENT', 'SYNTHWAVE', 'EXPERIMENTAL', 'IDM', 'BREAKBEAT', 'GLITCH_HOP', 'DOWNTEMPO', 'LO_FI', 'CUSTOM', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CartType" AS ENUM ('CART', 'SAVED_FOR_LATER', 'WISHLIST');

-- CreateTable
CREATE TABLE "SoundDesigner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "websiteUrl" TEXT,

    CONSTRAINT "SoundDesigner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VST" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "VST_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetUpload" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "presetType" "PresetType" NOT NULL,
    "soundPreviewUrl" TEXT,
    "presetFileUrl" TEXT,
    "price" DOUBLE PRECISION,
    "spotifyLink" TEXT,
    "genreId" TEXT,
    "soundDesignerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "presetRequestId" TEXT,
    "vstId" TEXT,
    "guide" TEXT,
    "tags" TEXT[],
    "originalFileName" TEXT,

    CONSTRAINT "PresetUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeLink" TEXT,
    "genreId" TEXT,
    "enquiryDetails" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "PresetRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetSubmission" (
    "id" TEXT NOT NULL,
    "presetRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "soundPreviewUrl" TEXT,
    "presetFileUrl" TEXT,
    "guide" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "PresetSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tutorial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "soundPreviewUrl" TEXT NOT NULL,
    "soundDesignerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tutorial_pkey" PRIMARY KEY ("id")
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
    "orderId" TEXT NOT NULL,
    "presetId" TEXT,
    "sampleId" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Download" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "presetId" TEXT,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "PresetPack" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "soundPreviewUrl" TEXT,
    "soundDesignerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "PresetPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackPresets" (
    "presetId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackPresets_pkey" PRIMARY KEY ("presetId","packId")
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
    "cartId" TEXT NOT NULL,
    "presetId" TEXT,
    "packId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priceAlert" BOOLEAN NOT NULL DEFAULT false,
    "lastPriceSync" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SoundDesigner_userId_key" ON "SoundDesigner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SoundDesigner_username_key" ON "SoundDesigner"("username");

-- CreateIndex
CREATE UNIQUE INDEX "VST_name_key" ON "VST"("name");

-- CreateIndex
CREATE INDEX "PresetUpload_genreId_idx" ON "PresetUpload"("genreId");

-- CreateIndex
CREATE INDEX "PresetUpload_soundDesignerId_idx" ON "PresetUpload"("soundDesignerId");

-- CreateIndex
CREATE INDEX "PresetUpload_vstId_idx" ON "PresetUpload"("vstId");

-- CreateIndex
CREATE INDEX "PresetUpload_createdAt_idx" ON "PresetUpload"("createdAt");

-- CreateIndex
CREATE INDEX "PresetRequest_userId_idx" ON "PresetRequest"("userId");

-- CreateIndex
CREATE INDEX "PresetRequest_genreId_idx" ON "PresetRequest"("genreId");

-- CreateIndex
CREATE INDEX "PresetSubmission_presetRequestId_idx" ON "PresetSubmission"("presetRequestId");

-- CreateIndex
CREATE INDEX "PresetSubmission_userId_idx" ON "PresetSubmission"("userId");

-- CreateIndex
CREATE INDEX "Download_userId_presetId_idx" ON "Download"("userId", "presetId");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE INDEX "PriceHistory_presetId_idx" ON "PriceHistory"("presetId");

-- CreateIndex
CREATE INDEX "PriceHistory_packId_idx" ON "PriceHistory"("packId");

-- CreateIndex
CREATE INDEX "PriceHistory_cartItemId_idx" ON "PriceHistory"("cartItemId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "PresetPack_soundDesignerId_idx" ON "PresetPack"("soundDesignerId");

-- CreateIndex
CREATE INDEX "PresetPack_createdAt_idx" ON "PresetPack"("createdAt");

-- CreateIndex
CREATE INDEX "PackPresets_presetId_idx" ON "PackPresets"("presetId");

-- CreateIndex
CREATE INDEX "PackPresets_packId_idx" ON "PackPresets"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_type_key" ON "Cart"("userId", "type");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_presetId_idx" ON "CartItem"("presetId");

-- CreateIndex
CREATE INDEX "CartItem_packId_idx" ON "CartItem"("packId");

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_presetRequestId_fkey" FOREIGN KEY ("presetRequestId") REFERENCES "PresetRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_vstId_fkey" FOREIGN KEY ("vstId") REFERENCES "VST"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetRequest" ADD CONSTRAINT "PresetRequest_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetRequest" ADD CONSTRAINT "PresetRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SoundDesigner"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetSubmission" ADD CONSTRAINT "PresetSubmission_presetRequestId_fkey" FOREIGN KEY ("presetRequestId") REFERENCES "PresetRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetSubmission" ADD CONSTRAINT "PresetSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SoundDesigner"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetPack" ADD CONSTRAINT "PresetPack_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackPresets" ADD CONSTRAINT "PackPresets_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackPresets" ADD CONSTRAINT "PackPresets_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PresetPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
