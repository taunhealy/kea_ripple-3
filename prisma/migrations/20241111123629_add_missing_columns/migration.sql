/*
  Warnings:

  - A unique constraint covering the columns `[stripeSessionId]` on the table `PresetDownload` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSessionId]` on the table `PresetPackDownload` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `soundDesignerId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `PresetDownload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `soundDesignerId` to the `PresetDownload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `PresetPackDownload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `soundDesignerId` to the `PresetPackDownload` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "soundDesignerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PresetDownload" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "soundDesignerId" TEXT NOT NULL,
ADD COLUMN     "stripeSessionId" TEXT;

-- AlterTable
ALTER TABLE "PresetPackDownload" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "soundDesignerId" TEXT NOT NULL,
ADD COLUMN     "stripeSessionId" TEXT;

-- CreateIndex
CREATE INDEX "Order_soundDesignerId_idx" ON "Order"("soundDesignerId");

-- CreateIndex
CREATE UNIQUE INDEX "PresetDownload_stripeSessionId_key" ON "PresetDownload"("stripeSessionId");

-- CreateIndex
CREATE INDEX "PresetDownload_soundDesignerId_idx" ON "PresetDownload"("soundDesignerId");

-- CreateIndex
CREATE INDEX "PresetDownload_createdAt_idx" ON "PresetDownload"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PresetPackDownload_stripeSessionId_key" ON "PresetPackDownload"("stripeSessionId");

-- CreateIndex
CREATE INDEX "PresetPackDownload_soundDesignerId_idx" ON "PresetPackDownload"("soundDesignerId");

-- CreateIndex
CREATE INDEX "PresetPackDownload_createdAt_idx" ON "PresetPackDownload"("createdAt");

-- AddForeignKey
ALTER TABLE "PresetDownload" ADD CONSTRAINT "PresetDownload_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetPackDownload" ADD CONSTRAINT "PresetPackDownload_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
