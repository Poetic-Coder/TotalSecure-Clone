/*
  Warnings:

  - A unique constraint covering the columns `[client_pk,client_id]` on the table `api_keys` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "client_id" UUID,
ADD COLUMN     "client_pk" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_client_pk_client_id_key" ON "api_keys"("client_pk", "client_id");

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;
