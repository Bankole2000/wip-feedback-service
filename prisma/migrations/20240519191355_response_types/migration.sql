/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `ResponseType` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ResponseType" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "responseType" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ResponseType_id_key" ON "ResponseType"("id");
