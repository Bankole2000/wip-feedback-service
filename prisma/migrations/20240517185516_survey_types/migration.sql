-- AlterTable
ALTER TABLE "Survey" ALTER COLUMN "requiresSelfAssessment" SET DEFAULT true;

-- CreateTable
CREATE TABLE "SurveyType" (
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "surveyType" TEXT NOT NULL,
    "createdByUserId" TEXT,

    CONSTRAINT "SurveyType_pkey" PRIMARY KEY ("surveyType")
);

-- CreateTable
CREATE TABLE "_SurveyHasType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SurveyType_surveyType_key" ON "SurveyType"("surveyType");

-- CreateIndex
CREATE UNIQUE INDEX "_SurveyHasType_AB_unique" ON "_SurveyHasType"("A", "B");

-- CreateIndex
CREATE INDEX "_SurveyHasType_B_index" ON "_SurveyHasType"("B");

-- AddForeignKey
ALTER TABLE "_SurveyHasType" ADD CONSTRAINT "_SurveyHasType_A_fkey" FOREIGN KEY ("A") REFERENCES "Survey"("surveyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SurveyHasType" ADD CONSTRAINT "_SurveyHasType_B_fkey" FOREIGN KEY ("B") REFERENCES "SurveyType"("surveyType") ON DELETE CASCADE ON UPDATE CASCADE;
