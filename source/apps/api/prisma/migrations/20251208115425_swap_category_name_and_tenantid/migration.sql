/*
  Warnings:

  - A unique constraint covering the columns `[name,tenant_id]` on the table `menu_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "menu_categories_tenant_id_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "menu_categories_name_tenant_id_key" ON "menu_categories"("name", "tenant_id");
