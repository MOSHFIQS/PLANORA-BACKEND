/*
  Warnings:

  - A unique constraint covering the columns `[participationId,status]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invitationId,status]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "payments_participationId_status_key" ON "payments"("participationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_invitationId_status_key" ON "payments"("invitationId", "status");
