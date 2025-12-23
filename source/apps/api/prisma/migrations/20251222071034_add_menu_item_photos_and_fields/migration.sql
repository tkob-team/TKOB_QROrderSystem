-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "chef_recommended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "popularity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "preparation_time" INTEGER,
ADD COLUMN     "primary_photo_id" TEXT;

-- CreateTable
CREATE TABLE "menu_item_photos" (
    "id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_item_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "menu_item_photos_menu_item_id_idx" ON "menu_item_photos"("menu_item_id");

-- CreateIndex
CREATE INDEX "menu_item_photos_menu_item_id_is_primary_idx" ON "menu_item_photos"("menu_item_id", "is_primary");

-- CreateIndex
CREATE INDEX "menu_items_tenant_id_popularity_idx" ON "menu_items"("tenant_id", "popularity");

-- CreateIndex
CREATE INDEX "menu_items_tenant_id_chef_recommended_idx" ON "menu_items"("tenant_id", "chef_recommended");

-- AddForeignKey
ALTER TABLE "menu_item_photos" ADD CONSTRAINT "menu_item_photos_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
