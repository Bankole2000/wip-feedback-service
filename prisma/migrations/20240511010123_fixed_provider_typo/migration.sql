/*
  Warnings:

  - You are about to drop the column `hasProvideFeedbackEnabled` on the `Survey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Survey" DROP COLUMN "hasProvideFeedbackEnabled",
ADD COLUMN     "hasProviderFeedbackEnabled" BOOLEAN DEFAULT false;
