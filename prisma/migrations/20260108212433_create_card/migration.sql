/*
  Warnings:

  - Added the required column `phoneNumber` to the `personal_info` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "personal_info" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phoneNumber" TEXT NOT NULL;
