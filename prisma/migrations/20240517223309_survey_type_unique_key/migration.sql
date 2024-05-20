/*
  Warnings:

  - A unique constraint covering the columns `[createdByUserId,surveyType]` on the table `SurveyType` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "SurveyHasType" DROP CONSTRAINT "SurveyHasType_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "SurveyHasType" DROP CONSTRAINT "SurveyHasType_surveyType_fkey";

-- DropIndex
DROP INDEX "SurveyType_surveyType_key";

-- CreateIndex
CREATE UNIQUE INDEX "SurveyType_createdByUserId_surveyType_key" ON "SurveyType"("createdByUserId", "surveyType");

-- AddForeignKey
ALTER TABLE "SurveyHasType" ADD CONSTRAINT "SurveyHasType_surveyType_fkey" FOREIGN KEY ("surveyType") REFERENCES "SurveyType"("surveyType") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyHasType" ADD CONSTRAINT "SurveyHasType_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("surveyId") ON DELETE CASCADE ON UPDATE CASCADE;
