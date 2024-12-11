/*
  Warnings:

  - The values [SERUM,VITAL] on the enum `VstType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VstType_new" AS ENUM ('SYNTH');
ALTER TABLE "PresetSubmission" ALTER COLUMN "vstType" DROP DEFAULT;
ALTER TABLE "VST" ALTER COLUMN "type" TYPE "VstType_new" USING ("type"::text::"VstType_new");
ALTER TABLE "PresetSubmission" ALTER COLUMN "vstType" TYPE "VstType_new" USING ("vstType"::text::"VstType_new");
ALTER TYPE "VstType" RENAME TO "VstType_old";
ALTER TYPE "VstType_new" RENAME TO "VstType";
DROP TYPE "VstType_old";
ALTER TABLE "PresetSubmission" ALTER COLUMN "vstType" SET DEFAULT 'SYNTH';
COMMIT;

-- AlterTable
ALTER TABLE "PresetSubmission" ALTER COLUMN "vstType" SET DEFAULT 'SYNTH';
