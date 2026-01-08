-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "customPrice" DECIMAL(10,2),
ADD COLUMN     "discountCode" TEXT,
ADD COLUMN     "discountExpiry" TIMESTAMP(3),
ADD COLUMN     "discountFixedAmount" DECIMAL(10,2),
ADD COLUMN     "discountPercent" DECIMAL(5,2);
