-- CreateTable
CREATE TABLE "QuestionnaireResponseType" (
    "questionnaireId" TEXT NOT NULL,
    "responseTypeId" TEXT NOT NULL,

    CONSTRAINT "QuestionnaireResponseType_pkey" PRIMARY KEY ("questionnaireId","responseTypeId")
);

-- AddForeignKey
ALTER TABLE "QuestionnaireResponseType" ADD CONSTRAINT "QuestionnaireResponseType_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("questionnaireId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireResponseType" ADD CONSTRAINT "QuestionnaireResponseType_responseTypeId_fkey" FOREIGN KEY ("responseTypeId") REFERENCES "ResponseType"("responseTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionnaireId_responseTypeId_fkey" FOREIGN KEY ("questionnaireId", "responseTypeId") REFERENCES "QuestionnaireResponseType"("questionnaireId", "responseTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;
