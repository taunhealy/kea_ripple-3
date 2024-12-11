-- AlterTable
ALTER TABLE "PresetPackUpload" ADD COLUMN     "genreId" TEXT;

-- AddForeignKey
ALTER TABLE "PresetPackUpload" ADD CONSTRAINT "PresetPackUpload_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE;
