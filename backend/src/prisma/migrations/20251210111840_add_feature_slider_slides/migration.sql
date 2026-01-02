-- CreateTable
CREATE TABLE "feature_slider_slides" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "imageUrl" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_slider_slides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feature_slider_slides_tenantId_idx" ON "feature_slider_slides"("tenantId");

-- CreateIndex
CREATE INDEX "feature_slider_slides_order_idx" ON "feature_slider_slides"("order");

-- CreateIndex
CREATE INDEX "feature_slider_slides_enabled_idx" ON "feature_slider_slides"("enabled");

-- AddForeignKey
ALTER TABLE "feature_slider_slides" ADD CONSTRAINT "feature_slider_slides_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
