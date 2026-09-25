/*
  Multi-tenant migration (data-safe for non-empty UAT/prod).

  Failed originally with:
    ERROR: column "company_id" of relation "clients" contains null values
  because Prisma added NOT NULL tenant columns in one step on tables that
  already had rows.

  Fix: create companies first → seed a legacy company → add nullable
  tenant columns → backfill → SET NOT NULL. Same pattern for
  client_subscriptions package columns.
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

ALTER TYPE "NotificationType" ADD VALUE 'SUBSCRIPTION_EXPIRING';
ALTER TYPE "NotificationType" ADD VALUE 'PLAN_LIMIT_REACHED';

-- DropForeignKey
ALTER TABLE "client_subscriptions" DROP CONSTRAINT IF EXISTS "client_subscriptions_plan_pk_plan_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "payroll_runs_period_key";

-- DropIndex
DROP INDEX IF EXISTS "roles_name_key";

-- Optional tenant columns
ALTER TABLE "api_keys" ADD COLUMN "company_id" UUID,
ADD COLUMN "company_pk" INTEGER;

ALTER TABLE "audit_logs" ADD COLUMN "company_id" UUID,
ADD COLUMN "company_pk" INTEGER;

ALTER TABLE "notifications" ADD COLUMN "company_id" UUID,
ADD COLUMN "company_pk" INTEGER;

ALTER TABLE "roles" ADD COLUMN "company_id" UUID,
ADD COLUMN "company_pk" INTEGER;

-- Create tenant tables BEFORE attaching existing rows
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

-- Seed legacy company for existing rows (password = ChangeMe123! — rotate after migrate)
INSERT INTO "companies" (
  "id", "name", "slug", "email", "password", "status", "createdAt", "updatedAt"
) VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Legacy Migration Company',
  'legacy-migration',
  'legacy-migration@system.local',
  '$2b$10$J8AcGBuSvjftoDWWTJoTheCg5mHW1d7URZPTdtU4AVNjJZzoxFlKa',
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO "service_packages" (
  "id", "name", "tier", "description", "monthly_price", "currency",
  "company_pk", "company_id", "createdAt", "updatedAt"
)
SELECT
  '00000000-0000-4000-8000-000000000002',
  'Legacy Default Package',
  'STANDARD',
  'Auto-created during multi-tenant migration for existing subscriptions',
  0,
  'NGN',
  c."pk",
  c."id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "companies" c
WHERE c."slug" = 'legacy-migration';

-- Add required tenant columns as NULLABLE first
ALTER TABLE "clients" ADD COLUMN "company_id" UUID,
ADD COLUMN "company_pk" INTEGER;

ALTER TABLE "equipment" ADD COLUMN "company_id" UUID,
ADD COLUMN "company_pk" INTEGER;

ALTER TABLE "guards" ADD COLUMN "company_id" UUID,
ADD COLUMN "company_pk" INTEGER;

ALTER TABLE "payroll_runs" ADD COLUMN "company_id" UUID,
ADD COLUMN "company_pk" INTEGER;

ALTER TABLE "staff" ADD COLUMN "company_id" UUID,
ADD COLUMN "company_pk" INTEGER,
ADD COLUMN "custom_role_id" UUID,
ADD COLUMN "custom_role_pk" INTEGER;

-- Backfill existing rows onto the legacy company
UPDATE "clients" c
SET "company_pk" = co."pk", "company_id" = co."id"
FROM "companies" co
WHERE co."slug" = 'legacy-migration' AND c."company_id" IS NULL;

UPDATE "staff" s
SET "company_pk" = co."pk", "company_id" = co."id"
FROM "companies" co
WHERE co."slug" = 'legacy-migration' AND s."company_id" IS NULL;

UPDATE "guards" g
SET "company_pk" = co."pk", "company_id" = co."id"
FROM "companies" co
WHERE co."slug" = 'legacy-migration' AND g."company_id" IS NULL;

UPDATE "equipment" e
SET "company_pk" = co."pk", "company_id" = co."id"
FROM "companies" co
WHERE co."slug" = 'legacy-migration' AND e."company_id" IS NULL;

UPDATE "payroll_runs" p
SET "company_pk" = co."pk", "company_id" = co."id"
FROM "companies" co
WHERE co."slug" = 'legacy-migration' AND p."company_id" IS NULL;

-- Now enforce NOT NULL
ALTER TABLE "clients" ALTER COLUMN "company_id" SET NOT NULL,
ALTER COLUMN "company_pk" SET NOT NULL;

ALTER TABLE "equipment" ALTER COLUMN "company_id" SET NOT NULL,
ALTER COLUMN "company_pk" SET NOT NULL;

ALTER TABLE "guards" ALTER COLUMN "company_id" SET NOT NULL,
ALTER COLUMN "company_pk" SET NOT NULL;

ALTER TABLE "payroll_runs" ALTER COLUMN "company_id" SET NOT NULL,
ALTER COLUMN "company_pk" SET NOT NULL;

ALTER TABLE "staff" ALTER COLUMN "company_id" SET NOT NULL,
ALTER COLUMN "company_pk" SET NOT NULL;

-- client_subscriptions: drop old plan FKs/cols, add package cols safely
ALTER TABLE "client_subscriptions" DROP COLUMN IF EXISTS "plan_id",
DROP COLUMN IF EXISTS "plan_pk";

ALTER TABLE "client_subscriptions"
ADD COLUMN "agreed_price" DOUBLE PRECISION,
ADD COLUMN "auto_renew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "cancel_reason" TEXT,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'NGN',
ADD COLUMN "discount_pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "package_id" UUID,
ADD COLUMN "package_pk" INTEGER,
ADD COLUMN "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "client_subscriptions" cs
SET
  "package_pk" = sp."pk",
  "package_id" = sp."id",
  "agreed_price" = COALESCE(cs."agreed_price", sp."monthly_price", 0)
FROM "service_packages" sp
WHERE sp."name" = 'Legacy Default Package' AND cs."package_id" IS NULL;

ALTER TABLE "client_subscriptions" ALTER COLUMN "agreed_price" SET NOT NULL,
ALTER COLUMN "package_id" SET NOT NULL,
ALTER COLUMN "package_pk" SET NOT NULL;

DROP TABLE IF EXISTS "subscription_plans";

-- Indexes
CREATE UNIQUE INDEX "platform_staff_id_key" ON "platform_staff"("id");
CREATE UNIQUE INDEX "platform_staff_email_key" ON "platform_staff"("email");
CREATE UNIQUE INDEX "platform_staff_phone_key" ON "platform_staff"("phone");
CREATE UNIQUE INDEX "platform_staff_pk_id_key" ON "platform_staff"("pk", "id");

CREATE UNIQUE INDEX "companies_id_key" ON "companies"("id");
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");
CREATE UNIQUE INDEX "companies_phone_key" ON "companies"("phone");
CREATE UNIQUE INDEX "companies_pk_id_key" ON "companies"("pk", "id");

CREATE UNIQUE INDEX "platform_plans_id_key" ON "platform_plans"("id");
CREATE UNIQUE INDEX "platform_plans_name_key" ON "platform_plans"("name");
CREATE UNIQUE INDEX "platform_plans_pk_id_key" ON "platform_plans"("pk", "id");

CREATE UNIQUE INDEX "company_subscriptions_id_key" ON "company_subscriptions"("id");
CREATE UNIQUE INDEX "company_subscriptions_company_pk_key" ON "company_subscriptions"("company_pk");
CREATE UNIQUE INDEX "company_subscriptions_company_id_key" ON "company_subscriptions"("company_id");
CREATE UNIQUE INDEX "company_subscriptions_pk_id_key" ON "company_subscriptions"("pk", "id");
CREATE UNIQUE INDEX "company_subscriptions_company_pk_company_id_key" ON "company_subscriptions"("company_pk", "company_id");

CREATE UNIQUE INDEX "service_packages_id_key" ON "service_packages"("id");
CREATE UNIQUE INDEX "service_packages_pk_id_key" ON "service_packages"("pk", "id");
CREATE UNIQUE INDEX "service_packages_company_pk_name_key" ON "service_packages"("company_pk", "name");

CREATE UNIQUE INDEX "payroll_runs_company_pk_period_key" ON "payroll_runs"("company_pk", "period");
CREATE UNIQUE INDEX "roles_company_pk_name_key" ON "roles"("company_pk", "name");

-- Foreign keys
ALTER TABLE "company_subscriptions" ADD CONSTRAINT "company_subscriptions_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_subscriptions" ADD CONSTRAINT "company_subscriptions_plan_pk_plan_id_fkey" FOREIGN KEY ("plan_pk", "plan_id") REFERENCES "platform_plans"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_subscriptions" ADD CONSTRAINT "client_subscriptions_package_pk_package_id_fkey" FOREIGN KEY ("package_pk", "package_id") REFERENCES "service_packages"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff" ADD CONSTRAINT "staff_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "staff" ADD CONSTRAINT "staff_custom_role_pk_custom_role_id_fkey" FOREIGN KEY ("custom_role_pk", "custom_role_id") REFERENCES "roles"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "guards" ADD CONSTRAINT "guards_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "clients" ADD CONSTRAINT "clients_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "roles" ADD CONSTRAINT "roles_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;
