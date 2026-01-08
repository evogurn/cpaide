-- CreateTable
CREATE TABLE "folder_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folder_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder_template_nodes" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "level" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folder_template_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "folder_template_nodes_templateId_idx" ON "folder_template_nodes"("templateId");

-- CreateIndex
CREATE INDEX "folder_template_nodes_parentId_idx" ON "folder_template_nodes"("parentId");

-- CreateIndex
CREATE INDEX "folder_template_nodes_level_idx" ON "folder_template_nodes"("level");

-- CreateIndex
CREATE INDEX "folder_template_nodes_position_idx" ON "folder_template_nodes"("position");

-- AddForeignKey
ALTER TABLE "folder_template_nodes" ADD CONSTRAINT "folder_template_nodes_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "folder_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_template_nodes" ADD CONSTRAINT "folder_template_nodes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folder_template_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
