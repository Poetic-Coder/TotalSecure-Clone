-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';

-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';

-- RenameForeignKey
ALTER TABLE "platform_staff_assignments" RENAME CONSTRAINT "platform_staff_assignments_platform_staff_pk_platform_staff_id_" TO "platform_staff_assignments_platform_staff_pk_platform_staf_fkey";
