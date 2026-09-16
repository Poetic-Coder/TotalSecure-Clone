/*
  Warnings:

  - You are about to drop the column `plan_id` on the `client_subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `plan_pk` on the `client_subscriptions` table. All the data in the column will be lost.
  - You are about to drop the `subscription_plans` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[company_pk,period]` on the table `payroll_runs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_pk,name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `agreed_price` to the `client_subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `package_id` to the `client_subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `package_pk` to the `client_subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_pk` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_pk` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `guards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_pk` to the `guards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `payroll_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_pk` to the `payroll_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_pk` to the `staff` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CHURNED');

-- CreateEnum
CREATE TYPE "PlatformStaffRole" AS ENUM ('PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_BILLING');

-- CreateEnum
CREATE TYPE "ServiceTier" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PermissionModule" AS ENUM ('GUARD', 'SITE', 'CLIENT', 'SUBSCRIPTION', 'DEPLOYMENT', 'SHIFT', 'INVOICE', 'EQUIPMENT', 'INCIDENT', 'CONMMAND_CENTER', 'VEHICLE', 'PATROL', 'VISITOR', 'AUDITLOG', 'NOTIFICATION');

-- AlterEnum
ALTER TYPE "InvoiceLineType" ADD VALUE 'SUBSCRIPTION_FEE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SUBSCRIPTION_EXPIRING';
ALTER TYPE "NotificationType" ADD VALUE 'PLAN_LIMIT_REACHED';

-- DropForeignKey
ALTER TABLE "client_subscriptions" DROP CONSTRAINT "client_subscriptions_plan_pk_plan_id_fkey";

-- DropIndex
DROP INDEX "payroll_runs_period_key";

-- DropIndex
DROP INDEX "roles_name_key";

-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "company_id" UUID,
ADD COLUMN     "company_pk" INTEGER;

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "company_id" UUID,
ADD COLUMN     "company_pk" INTEGER;

-- AlterTable
ALTER TABLE "client_subscriptions" DROP COLUMN "plan_id",
DROP COLUMN "plan_pk",
ADD COLUMN     "agreed_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "auto_renew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'NGN',
ADD COLUMN     "discount_pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "package_id" UUID NOT NULL,
ADD COLUMN     "package_pk" INTEGER NOT NULL,
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "company_id" UUID NOT NULL,
ADD COLUMN     "company_pk" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "equipment" ADD COLUMN     "company_id" UUID NOT NULL,
ADD COLUMN     "company_pk" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "guards" ADD COLUMN     "company_id" UUID NOT NULL,
ADD COLUMN     "company_pk" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "company_id" UUID,
ADD COLUMN     "company_pk" INTEGER;

-- AlterTable
ALTER TABLE "payroll_runs" ADD COLUMN     "company_id" UUID NOT NULL,
ADD COLUMN     "company_pk" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "company_id" UUID,
ADD COLUMN     "company_pk" INTEGER;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "company_id" UUID NOT NULL,
ADD COLUMN     "company_pk" INTEGER NOT NULL,
ADD COLUMN     "custom_role_id" UUID,
ADD COLUMN     "custom_role_pk" INTEGER;

-- DropTable
DROP TABLE "subscription_plans";

-- CreateTable
CREATE TABLE "platform_staff" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "PlatformStaffRole" NOT NULL,
    "active" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "first_name" TEXT,
    "last_name" TEXT,
    "last_login_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_staff_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "companies" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "registration_number" TEXT,
    "tax_id" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "default_guard_payout_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "platform_plans" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "description" TEXT,
    "monthly_price" DOUBLE PRECISION NOT NULL,
    "quarterly_price" DOUBLE PRECISION,
    "annual_price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "max_clients" INTEGER,
    "max_sites" INTEGER,
    "max_guards_deployed" INTEGER,
    "max_cameras" INTEGER,
    "max_staff_users" INTEGER,
    "storage_retention_days" INTEGER NOT NULL DEFAULT 30,
    "has_guard_management" BOOLEAN NOT NULL DEFAULT true,
    "has_patrol_management" BOOLEAN NOT NULL DEFAULT true,
    "has_visitor_management" BOOLEAN NOT NULL DEFAULT true,
    "has_vehicle_management" BOOLEAN NOT NULL DEFAULT true,
    "has_incident_management" BOOLEAN NOT NULL DEFAULT true,
    "has_cctv_integration" BOOLEAN NOT NULL DEFAULT false,
    "has_command_center" BOOLEAN NOT NULL DEFAULT false,
    "has_reporting" BOOLEAN NOT NULL DEFAULT true,
    "has_advanced_analytics" BOOLEAN NOT NULL DEFAULT false,
    "has_api_access" BOOLEAN NOT NULL DEFAULT false,
    "has_biometric_checkin" BOOLEAN NOT NULL DEFAULT false,
    "has_sms_alerts" BOOLEAN NOT NULL DEFAULT false,
    "has_email_alerts" BOOLEAN NOT NULL DEFAULT true,
    "has_multi_branch" BOOLEAN NOT NULL DEFAULT false,
    "has_custom_roles" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_plans_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "company_subscriptions" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "trial_ends_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "external_ref" TEXT,
    "company_pk" INTEGER NOT NULL,
    "company_id" UUID NOT NULL,
    "plan_pk" INTEGER NOT NULL,
    "plan_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_subscriptions_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "service_packages" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "ServiceTier" NOT NULL DEFAULT 'STANDARD',
    "description" TEXT,
    "for_client_type" "ClientType",
    "monthly_price" DOUBLE PRECISION NOT NULL,
    "quarterly_price" DOUBLE PRECISION,
    "annual_price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "setup_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "included_guard_count" INTEGER NOT NULL DEFAULT 0,
    "bill_guards_separately" BOOLEAN NOT NULL DEFAULT true,
    "max_sites" INTEGER,
    "max_cameras" INTEGER,
    "max_portal_users" INTEGER,
    "max_visitors_per_month" INTEGER,
    "storage_retention_days" INTEGER NOT NULL DEFAULT 30,
    "has_patrol_visibility" BOOLEAN NOT NULL DEFAULT true,
    "has_visitor_management" BOOLEAN NOT NULL DEFAULT true,
    "has_vehicle_management" BOOLEAN NOT NULL DEFAULT true,
    "has_incident_portal" BOOLEAN NOT NULL DEFAULT true,
    "has_cctv_access" BOOLEAN NOT NULL DEFAULT false,
    "has_live_tracking" BOOLEAN NOT NULL DEFAULT false,
    "has_reporting" BOOLEAN NOT NULL DEFAULT true,
    "has_advanced_analytics" BOOLEAN NOT NULL DEFAULT false,
    "has_sms_alerts" BOOLEAN NOT NULL DEFAULT false,
    "has_email_alerts" BOOLEAN NOT NULL DEFAULT true,
    "has_dedicated_manager" BOOLEAN NOT NULL DEFAULT false,
    "response_time_sla_mins" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "company_pk" INTEGER NOT NULL,
    "company_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_packages_pkey" PRIMARY KEY ("pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_staff_id_key" ON "platform_staff"("id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_staff_email_key" ON "platform_staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "platform_staff_phone_key" ON "platform_staff"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "platform_staff_pk_id_key" ON "platform_staff"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_id_key" ON "companies"("id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_phone_key" ON "companies"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "companies_pk_id_key" ON "companies"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_plans_id_key" ON "platform_plans"("id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_plans_name_key" ON "platform_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "platform_plans_pk_id_key" ON "platform_plans"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "company_subscriptions_id_key" ON "company_subscriptions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "company_subscriptions_company_pk_key" ON "company_subscriptions"("company_pk");

-- CreateIndex
CREATE UNIQUE INDEX "company_subscriptions_company_id_key" ON "company_subscriptions"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_subscriptions_pk_id_key" ON "company_subscriptions"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "company_subscriptions_company_pk_company_id_key" ON "company_subscriptions"("company_pk", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_packages_id_key" ON "service_packages"("id");

-- CreateIndex
CREATE UNIQUE INDEX "service_packages_pk_id_key" ON "service_packages"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "service_packages_company_pk_name_key" ON "service_packages"("company_pk", "name");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_company_pk_period_key" ON "payroll_runs"("company_pk", "period");

-- CreateIndex
CREATE UNIQUE INDEX "roles_company_pk_name_key" ON "roles"("company_pk", "name");

-- AddForeignKey
ALTER TABLE "company_subscriptions" ADD CONSTRAINT "company_subscriptions_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_subscriptions" ADD CONSTRAINT "company_subscriptions_plan_pk_plan_id_fkey" FOREIGN KEY ("plan_pk", "plan_id") REFERENCES "platform_plans"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_subscriptions" ADD CONSTRAINT "client_subscriptions_package_pk_package_id_fkey" FOREIGN KEY ("package_pk", "package_id") REFERENCES "service_packages"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_custom_role_pk_custom_role_id_fkey" FOREIGN KEY ("custom_role_pk", "custom_role_id") REFERENCES "roles"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guards" ADD CONSTRAINT "guards_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;
