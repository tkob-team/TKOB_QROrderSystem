-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'INACTIVE');

-- CreateTable
CREATE TABLE "tables" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "table_number" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "location" TEXT,
    "description" TEXT,
    "status" "TableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "qr_token" TEXT,
    "qr_token_hash" TEXT,
    "qr_token_created_at" TIMESTAMP(3),
    "qr_invalidated_at" TIMESTAMP(3),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tables_qr_token_key" ON "tables"("qr_token");

-- CreateIndex
CREATE INDEX "tables_tenant_id_status_idx" ON "tables"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "tables_tenant_id_active_idx" ON "tables"("tenant_id", "active");

-- CreateIndex
CREATE INDEX "tables_qr_token_idx" ON "tables"("qr_token");

-- CreateIndex
CREATE UNIQUE INDEX "tables_table_number_tenant_id_key" ON "tables"("table_number", "tenant_id");

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
