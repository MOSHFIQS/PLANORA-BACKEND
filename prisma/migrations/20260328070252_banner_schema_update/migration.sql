-- AlterTable
ALTER TABLE "banner" ADD COLUMN     "dateTime" TIMESTAMP(3),
ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'ONLINE';
