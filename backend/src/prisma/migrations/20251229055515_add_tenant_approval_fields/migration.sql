-- CreateEnum
CREATE TYPE "TenantApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "approvalStatus" "TenantApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT;

-- CreateIndex
CREATE INDEX "tenants_approvalStatus_idx" ON "tenants"("approvalStatus");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
