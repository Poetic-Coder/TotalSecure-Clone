-- CreateEnum
CREATE TYPE "PermissionEffect" AS ENUM ('GRANT', 'DENY');

-- AlterEnum
ALTER TYPE "PermissionModule" ADD VALUE 'STAFF';
ALTER TYPE "PermissionModule" ADD VALUE 'ROLE';
ALTER TYPE "PermissionModule" ADD VALUE 'PAYROLL';
ALTER TYPE "PermissionModule" ADD VALUE 'COMPANY';

-- CreateTable
CREATE TABLE "staff_permissions" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "effect" "PermissionEffect" NOT NULL,
    "staff_pk" INTEGER NOT NULL,
    "staff_id" UUID NOT NULL,
    "permission_pk" INTEGER NOT NULL,
    "permission_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_permissions_pkey" PRIMARY KEY ("pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_permissions_id_key" ON "staff_permissions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_permissions_staff_pk_permission_pk_key" ON "staff_permissions"("staff_pk", "permission_pk");

-- CreateIndex
CREATE UNIQUE INDEX "staff_permissions_pk_id_key" ON "staff_permissions"("pk", "id");

-- AddForeignKey
ALTER TABLE "staff_permissions" ADD CONSTRAINT "staff_permissions_staff_pk_staff_id_fkey" FOREIGN KEY ("staff_pk", "staff_id") REFERENCES "staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_permissions" ADD CONSTRAINT "staff_permissions_permission_pk_permission_id_fkey" FOREIGN KEY ("permission_pk", "permission_id") REFERENCES "permissions"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;
