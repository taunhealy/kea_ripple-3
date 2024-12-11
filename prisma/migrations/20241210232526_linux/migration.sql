-- DropForeignKey
ALTER TABLE "PresetUpload" DROP CONSTRAINT "PresetUpload_presetRequestId_fkey";

-- CreateTable
CREATE TABLE "_PresetRequestToPresetUpload" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PresetRequestToPresetUpload_AB_unique" ON "_PresetRequestToPresetUpload"("A", "B");

-- CreateIndex
CREATE INDEX "_PresetRequestToPresetUpload_B_index" ON "_PresetRequestToPresetUpload"("B");

-- AddForeignKey
ALTER TABLE "_PresetRequestToPresetUpload" ADD CONSTRAINT "_PresetRequestToPresetUpload_A_fkey" FOREIGN KEY ("A") REFERENCES "PresetRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PresetRequestToPresetUpload" ADD CONSTRAINT "_PresetRequestToPresetUpload_B_fkey" FOREIGN KEY ("B") REFERENCES "PresetUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
