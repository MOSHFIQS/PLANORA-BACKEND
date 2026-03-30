-- AlterTable
ALTER TABLE "banner" ADD COLUMN     "eventId" TEXT;

-- CreateIndex
CREATE INDEX "banner_eventId_idx" ON "banner"("eventId");

-- AddForeignKey
ALTER TABLE "banner" ADD CONSTRAINT "banner_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
