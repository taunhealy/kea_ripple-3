/*
  Warnings:

  - The values [IN_PROGRESS,COMPLETED,CANCELLED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('OPEN', 'SATISFIED');
ALTER TABLE "PresetRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PresetRequest" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "PresetRequest" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterTable
ALTER TABLE "PresetSubmission" ADD COLUMN     "presetType" "PresetType" NOT NULL DEFAULT 'LEAD',
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceType" "PriceType" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "vstId" TEXT,
ADD COLUMN     "vstType" "VstType" NOT NULL DEFAULT 'SERUM';

-- CreateIndex
CREATE INDEX "PresetSubmission_vstId_idx" ON "PresetSubmission"("vstId");

-- AddForeignKey
ALTER TABLE "PresetSubmission" ADD CONSTRAINT "PresetSubmission_vstId_fkey" FOREIGN KEY ("vstId") REFERENCES "VST"("id") ON DELETE SET NULL ON UPDATE CASCADE;
