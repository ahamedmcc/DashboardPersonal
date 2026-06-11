-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "actionItems" TEXT[] DEFAULT ARRAY[]::TEXT[];
