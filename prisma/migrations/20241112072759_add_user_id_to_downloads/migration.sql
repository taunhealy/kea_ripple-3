/*
  Warnings:

  - The values [ELECTRONIC,HIP_HOP,ROCK,METAL,HARDWAVE,WAVE,PHONK,FUTURE_BASS,COLOR_BASS,HOUSE,TECHNO,TRANCE,DUBSTEP,DRUM_AND_BASS,DRILL,AMAPIANO,TRAP,AMBIENT,SYNTHWAVE,EXPERIMENTAL,IDM,BREAKBEAT,GLITCH_HOP,DOWNTEMPO,LO_FI] on the enum `GenreType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `soundDesignerId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `soundDesignerId` on the `PresetDownload` table. All the data in the column will be lost.
  - You are about to drop the column `soundDesignerId` on the `PresetPackDownload` table. All the data in the column will be lost.
  - You are about to drop the column `soundDesignerId` on the `PresetPackUpload` table. All the data in the column will be lost.
  - You are about to drop the column `soundDesignerId` on the `PresetUpload` table. All the data in the column will be lost.
  - You are about to drop the column `soundDesignerId` on the `Tutorial` table. All the data in the column will be lost.
  - You are about to drop the `SoundDesigner` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripeSessionId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `PresetPackUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Tutorial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GenreType_new" AS ENUM ('SYSTEM', 'CUSTOM');
ALTER TYPE "GenreType" RENAME TO "GenreType_old";
ALTER TYPE "GenreType_new" RENAME TO "GenreType";
DROP TYPE "GenreType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_soundDesignerId_fkey";

-- DropForeignKey
ALTER TABLE "PresetDownload" DROP CONSTRAINT "PresetDownload_soundDesignerId_fkey";

-- DropForeignKey
ALTER TABLE "PresetPackDownload" DROP CONSTRAINT "PresetPackDownload_soundDesignerId_fkey";

-- DropForeignKey
ALTER TABLE "PresetPackUpload" DROP CONSTRAINT "PresetPackUpload_soundDesignerId_fkey";

-- DropForeignKey
ALTER TABLE "PresetRequest" DROP CONSTRAINT "PresetRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "PresetSubmission" DROP CONSTRAINT "PresetSubmission_userId_fkey";

-- DropForeignKey
ALTER TABLE "PresetUpload" DROP CONSTRAINT "PresetUpload_soundDesignerId_fkey";

-- DropForeignKey
ALTER TABLE "Tutorial" DROP CONSTRAINT "Tutorial_soundDesignerId_fkey";

-- DropIndex
DROP INDEX "Order_soundDesignerId_idx";

-- DropIndex
DROP INDEX "PresetDownload_soundDesignerId_idx";

-- DropIndex
DROP INDEX "PresetPackDownload_soundDesignerId_idx";

-- DropIndex
DROP INDEX "PresetPackUpload_soundDesignerId_idx";

-- DropIndex
DROP INDEX "PresetUpload_soundDesignerId_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "soundDesignerId",
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeSessionId" TEXT;

-- AlterTable
ALTER TABLE "PresetDownload" DROP COLUMN "soundDesignerId";

-- AlterTable
ALTER TABLE "PresetPackDownload" DROP COLUMN "soundDesignerId";

-- AlterTable
ALTER TABLE "PresetPackUpload" DROP COLUMN "soundDesignerId",
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "vstId" TEXT;

-- AlterTable
ALTER TABLE "PresetUpload" DROP COLUMN "soundDesignerId";

-- AlterTable
ALTER TABLE "Tutorial" DROP COLUMN "soundDesignerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "SoundDesigner";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_image_key" ON "User"("image");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "PresetDownload_userId_idx" ON "PresetDownload"("userId");

-- CreateIndex
CREATE INDEX "PresetPackUpload_genreId_idx" ON "PresetPackUpload"("genreId");

-- CreateIndex
CREATE INDEX "PresetPackUpload_vstId_idx" ON "PresetPackUpload"("vstId");

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetPackUpload" ADD CONSTRAINT "PresetPackUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetPackUpload" ADD CONSTRAINT "PresetPackUpload_vstId_fkey" FOREIGN KEY ("vstId") REFERENCES "VST"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetDownload" ADD CONSTRAINT "PresetDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetPackDownload" ADD CONSTRAINT "PresetPackDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetRequest" ADD CONSTRAINT "PresetRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetSubmission" ADD CONSTRAINT "PresetSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
