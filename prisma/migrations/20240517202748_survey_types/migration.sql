/*
  Warnings:

  - You are about to drop the `_SurveyHasType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SurveyHasType" DROP CONSTRAINT "_SurveyHasType_A_fkey";

-- DropForeignKey
ALTER TABLE "_SurveyHasType" DROP CONSTRAINT "_SurveyHasType_B_fkey";

-- DropTable
DROP TABLE "_SurveyHasType";

-- CreateTable
CREATE TABLE "SurveyHasType" (
    "surveyType" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,

    CONSTRAINT "SurveyHasType_pkey" PRIMARY KEY ("surveyType","surveyId")
);

-- AddForeignKey
ALTER TABLE "SurveyHasType" ADD CONSTRAINT "SurveyHasType_surveyType_fkey" FOREIGN KEY ("surveyType") REFERENCES "SurveyType"("surveyType") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyHasType" ADD CONSTRAINT "SurveyHasType_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("surveyId") ON DELETE RESTRICT ON UPDATE CASCADE;
