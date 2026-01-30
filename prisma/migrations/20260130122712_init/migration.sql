/*
  Warnings:

  - You are about to drop the `permission_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "permission_requests" DROP CONSTRAINT "permission_requests_cardId_fkey";

-- DropForeignKey
ALTER TABLE "permission_requests" DROP CONSTRAINT "permission_requests_cardOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "permission_requests" DROP CONSTRAINT "permission_requests_requesterId_fkey";

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "banner" TEXT,
ADD COLUMN     "image" TEXT;

-- DropTable
DROP TABLE "permission_requests";
