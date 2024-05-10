/*
  Warnings:

  - Added the required column `updated` to the `Survey` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('INDIVIDUAL', 'ORGANIZATION');

-- AlterTable
ALTER TABLE "Survey" ADD COLUMN     "canViewParticipants" BOOLEAN DEFAULT false,
ADD COLUMN     "clientUserId" TEXT,
ADD COLUMN     "closingDate" TIMESTAMP(3),
ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creatorUserId" TEXT,
ADD COLUMN     "feedbackGiverSurveyThreshold" INTEGER DEFAULT 3,
ADD COLUMN     "hasProvideFeedbackEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "hasRequestFeedbackEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "openingDate" TIMESTAMP(3),
ADD COLUMN     "published" BOOLEAN DEFAULT false,
ADD COLUMN     "requiresSelfAssessment" BOOLEAN DEFAULT false,
ADD COLUMN     "responsePerQuestionnaireThreshold" INTEGER DEFAULT 3,
ADD COLUMN     "shortDesc" TEXT,
ADD COLUMN     "updated" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "AssociatedSurvey" (
    "surveyId" TEXT NOT NULL,
    "associatedSurveyId" TEXT NOT NULL,

    CONSTRAINT "AssociatedSurvey_pkey" PRIMARY KEY ("surveyId","associatedSurveyId")
);

-- AddForeignKey
ALTER TABLE "AssociatedSurvey" ADD CONSTRAINT "AssociatedSurvey_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("surveyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssociatedSurvey" ADD CONSTRAINT "AssociatedSurvey_associatedSurveyId_fkey" FOREIGN KEY ("associatedSurveyId") REFERENCES "Survey"("surveyId") ON DELETE RESTRICT ON UPDATE CASCADE;
