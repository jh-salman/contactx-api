-- AlterTable
ALTER TABLE "card_scans" ADD COLUMN     "addressName" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "formattedAddress" TEXT,
ADD COLUMN     "isoCountryCode" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "streetNumber" TEXT,
ADD COLUMN     "subregion" TEXT;

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "addressName" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "formattedAddress" TEXT,
ADD COLUMN     "isoCountryCode" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "streetNumber" TEXT,
ADD COLUMN     "subregion" TEXT,
ALTER COLUMN "cardId" DROP NOT NULL,
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "personal_info" ADD COLUMN     "maidenName" TEXT,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "preferred" TEXT,
ADD COLUMN     "prefix" TEXT,
ADD COLUMN     "pronoun" TEXT,
ADD COLUMN     "suffix" TEXT,
ALTER COLUMN "phoneNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "visitor_contact_shares" ADD COLUMN     "addressName" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "formattedAddress" TEXT,
ADD COLUMN     "isoCountryCode" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "streetNumber" TEXT,
ADD COLUMN     "subregion" TEXT;
