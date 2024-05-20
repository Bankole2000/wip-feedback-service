-- AlterTable
ALTER TABLE "Survey" ADD COLUMN     "useClientBrandTheme" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "Section" (
    "sectionId" TEXT NOT NULL,
    "name" TEXT,
    "questionnaireId" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("sectionId")
);

-- CreateTable
CREATE TABLE "Questionnaire" (
    "questionnaireId" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Questionnaire_pkey" PRIMARY KEY ("questionnaireId")
);

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("questionnaireId") ON DELETE RESTRICT ON UPDATE CASCADE;
