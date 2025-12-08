/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,name]` on the table `menu_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "menu_categories_tenant_id_name_key" ON "menu_categories"("tenant_id", "name");
