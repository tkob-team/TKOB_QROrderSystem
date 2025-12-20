-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "current_session_id" TEXT;

-- CreateTable
CREATE TABLE "table_sessions" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "cleared_at" TIMESTAMP(3),
    "cleared_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "table_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "table_sessions_table_id_active_idx" ON "table_sessions"("table_id", "active");

-- CreateIndex
CREATE INDEX "table_sessions_tenant_id_active_idx" ON "table_sessions"("tenant_id", "active");

-- CreateIndex
CREATE INDEX "table_sessions_active_created_at_idx" ON "table_sessions"("active", "created_at");

-- CreateIndex
CREATE INDEX "tables_current_session_id_idx" ON "tables"("current_session_id");

-- AddForeignKey
ALTER TABLE "table_sessions" ADD CONSTRAINT "table_sessions_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
