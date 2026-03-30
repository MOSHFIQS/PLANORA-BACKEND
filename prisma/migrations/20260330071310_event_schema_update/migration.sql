-- AlterTable
ALTER TABLE "event" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "event_isFeatured_idx" ON "event"("isFeatured");
