-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_questionnaireId_fkey";

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "description" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Question" (
    "questionId" TEXT NOT NULL,
    "description" TEXT,
    "sectionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "questionnaireId" TEXT NOT NULL,
    "responseTypeId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "QuestionChoiceOptions" (
    "questionId" TEXT NOT NULL,
    "name" TEXT,
    "value" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QuestionChoiceOptions_pkey" PRIMARY KEY ("questionId","value")
);

-- CreateTable
CREATE TABLE "QuestionVersion" (
    "surveyType" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT,

    CONSTRAINT "QuestionVersion_pkey" PRIMARY KEY ("questionId","surveyType")
);

-- CreateTable
CREATE TABLE "ResponseType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdByUserId" TEXT,
    "responseType" TEXT NOT NULL,
    "responseTypeId" TEXT NOT NULL,

    CONSTRAINT "ResponseType_pkey" PRIMARY KEY ("responseTypeId")
);

-- CreateTable
CREATE TABLE "ScaleOptions" (
    "name" TEXT,
    "value" INTEGER NOT NULL,
    "responseTypeId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RatingOptions" (
    "name" TEXT,
    "value" INTEGER NOT NULL,
    "responseTypeId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ResponseType_createdByUserId_responseTypeId_key" ON "ResponseType"("createdByUserId", "responseTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "ScaleOptions_responseTypeId_value_key" ON "ScaleOptions"("responseTypeId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "RatingOptions_responseTypeId_value_key" ON "RatingOptions"("responseTypeId", "value");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("questionnaireId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("sectionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("questionnaireId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_responseTypeId_fkey" FOREIGN KEY ("responseTypeId") REFERENCES "ResponseType"("responseTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionChoiceOptions" ADD CONSTRAINT "QuestionChoiceOptions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("questionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVersion" ADD CONSTRAINT "QuestionVersion_surveyType_fkey" FOREIGN KEY ("surveyType") REFERENCES "SurveyType"("surveyType") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVersion" ADD CONSTRAINT "QuestionVersion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("questionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleOptions" ADD CONSTRAINT "ScaleOptions_responseTypeId_fkey" FOREIGN KEY ("responseTypeId") REFERENCES "ResponseType"("responseTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingOptions" ADD CONSTRAINT "RatingOptions_responseTypeId_fkey" FOREIGN KEY ("responseTypeId") REFERENCES "ResponseType"("responseTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;
