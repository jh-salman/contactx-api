-- CreateTable
CREATE TABLE "permission_requests" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "cardOwnerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permission_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "permission_requests_requesterId_idx" ON "permission_requests"("requesterId");

-- CreateIndex
CREATE INDEX "permission_requests_cardOwnerId_idx" ON "permission_requests"("cardOwnerId");

-- CreateIndex
CREATE INDEX "permission_requests_cardId_idx" ON "permission_requests"("cardId");

-- CreateIndex
CREATE INDEX "permission_requests_status_idx" ON "permission_requests"("status");

-- AddForeignKey
ALTER TABLE "permission_requests" ADD CONSTRAINT "permission_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_requests" ADD CONSTRAINT "permission_requests_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_requests" ADD CONSTRAINT "permission_requests_cardOwnerId_fkey" FOREIGN KEY ("cardOwnerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
