-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BILL_TO_TABLE', 'CARD_ONLINE', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'BILL_TO_TABLE',
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
