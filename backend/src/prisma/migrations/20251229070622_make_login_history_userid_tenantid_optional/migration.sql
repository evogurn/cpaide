-- DropForeignKey
ALTER TABLE "login_history" DROP CONSTRAINT "login_history_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "login_history" DROP CONSTRAINT "login_history_userId_fkey";

-- AlterTable
ALTER TABLE "login_history" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "tenantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
