-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('NORMAL', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "actual_prep_time" INTEGER,
ADD COLUMN     "estimated_prep_time" INTEGER,
ADD COLUMN     "priority" "OrderPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "received_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "order_items_order_id_prepared_idx" ON "order_items"("order_id", "prepared");
