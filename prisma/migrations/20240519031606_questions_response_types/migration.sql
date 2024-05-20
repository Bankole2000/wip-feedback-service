/*
  Warnings:

  - You are about to drop the `QuestionChoiceOptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RatingOptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScaleOptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionChoiceOptions" DROP CONSTRAINT "QuestionChoiceOptions_questionId_fkey";

-- DropForeignKey
ALTER TABLE "RatingOptions" DROP CONSTRAINT "RatingOptions_responseTypeId_fkey";

-- DropForeignKey
ALTER TABLE "ScaleOptions" DROP CONSTRAINT "ScaleOptions_responseTypeId_fkey";

-- DropTable
DROP TABLE "QuestionChoiceOptions";

-- DropTable
DROP TABLE "RatingOptions";

-- DropTable
DROP TABLE "ScaleOptions";

-- CreateTable
CREATE TABLE "QuestionChoiceOption" (
    "questionId" TEXT NOT NULL,
    "name" TEXT,
    "value" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QuestionChoiceOption_pkey" PRIMARY KEY ("questionId","value")
);

-- CreateTable
CREATE TABLE "ScaleOption" (
    "name" TEXT,
    "value" INTEGER NOT NULL,
    "responseTypeId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RatingOption" (
    "name" TEXT,
    "value" INTEGER NOT NULL,
    "responseTypeId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ScaleOption_responseTypeId_value_key" ON "ScaleOption"("responseTypeId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "RatingOption_responseTypeId_value_key" ON "RatingOption"("responseTypeId", "value");

-- AddForeignKey
ALTER TABLE "QuestionChoiceOption" ADD CONSTRAINT "QuestionChoiceOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("questionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleOption" ADD CONSTRAINT "ScaleOption_responseTypeId_fkey" FOREIGN KEY ("responseTypeId") REFERENCES "ResponseType"("responseTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingOption" ADD CONSTRAINT "RatingOption_responseTypeId_fkey" FOREIGN KEY ("responseTypeId") REFERENCES "ResponseType"("responseTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;
