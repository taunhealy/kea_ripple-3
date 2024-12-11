/*
  Warnings:

  - Made the column `soundDesignerId` on table `PresetPackUpload` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PresetPackUpload" DROP CONSTRAINT "PresetPackUpload_soundDesignerId_fkey";

-- AlterTable
ALTER TABLE "PresetPackUpload" ALTER COLUMN "soundDesignerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "PresetPackUpload" ADD CONSTRAINT "PresetPackUpload_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
