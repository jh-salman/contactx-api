/*
  Warnings:

  - You are about to drop the column `banner` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `contacts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "card_scans" ADD COLUMN     "banner" TEXT,
ADD COLUMN     "profile_img" TEXT;

-- AlterTable
ALTER TABLE "contacts" DROP COLUMN "banner",
DROP COLUMN "image";
