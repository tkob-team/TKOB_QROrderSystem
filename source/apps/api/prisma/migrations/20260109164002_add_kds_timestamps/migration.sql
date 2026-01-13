-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "preparing_at" TIMESTAMP(3),
ADD COLUMN     "ready_at" TIMESTAMP(3);
