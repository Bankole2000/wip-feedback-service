-- DropForeignKey
ALTER TABLE "AssociatedSurvey" DROP CONSTRAINT "AssociatedSurvey_associatedSurveyId_fkey";

-- DropForeignKey
ALTER TABLE "AssociatedSurvey" DROP CONSTRAINT "AssociatedSurvey_surveyId_fkey";

-- AddForeignKey
ALTER TABLE "AssociatedSurvey" ADD CONSTRAINT "AssociatedSurvey_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("surveyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssociatedSurvey" ADD CONSTRAINT "AssociatedSurvey_associatedSurveyId_fkey" FOREIGN KEY ("associatedSurveyId") REFERENCES "Survey"("surveyId") ON DELETE CASCADE ON UPDATE CASCADE;
