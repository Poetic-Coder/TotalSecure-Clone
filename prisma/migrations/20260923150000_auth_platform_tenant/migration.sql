-- Company / client approval states
ALTER TYPE "CompanyStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
ALTER TYPE "CompanyStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "ClientStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
ALTER TYPE "ClientStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'IMPERSONATE';

-- Company white-label + MFA + rejection
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "domain" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "brand_name" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "primary_color" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "support_email" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "mfa_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "rejected_at" TIMESTAMP(3);
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "reject_reason" TEXT;

UPDATE "companies" SET "domain" = "slug" WHERE "domain" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "companies_domain_key" ON "companies"("domain");
ALTER TABLE "companies" ALTER COLUMN "domain" SET NOT NULL;

-- MFA flags
ALTER TABLE "platform_staff" ADD COLUMN IF NOT EXISTS "mfa_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "mfa_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "guards" ADD COLUMN IF NOT EXISTS "mfa_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "mfa_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "rejected_at" TIMESTAMP(3);
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "reject_reason" TEXT;
ALTER TABLE "client_staff" ADD COLUMN IF NOT EXISTS "mfa_enabled" BOOLEAN NOT NULL DEFAULT false;

-- Platform staff <-> company assignment
CREATE TABLE IF NOT EXISTS "platform_staff_assignments" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "platform_staff_pk" INTEGER NOT NULL,
    "platform_staff_id" UUID NOT NULL,
    "company_pk" INTEGER NOT NULL,
    "company_id" UUID NOT NULL,
    "assigned_by_pk" INTEGER,
    "assigned_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_staff_assignments_pkey" PRIMARY KEY ("pk")
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_staff_assignments_id_key" ON "platform_staff_assignments"("id");
CREATE UNIQUE INDEX IF NOT EXISTS "platform_staff_assignments_platform_staff_pk_company_pk_key" ON "platform_staff_assignments"("platform_staff_pk", "company_pk");
CREATE UNIQUE INDEX IF NOT EXISTS "platform_staff_assignments_pk_id_key" ON "platform_staff_assignments"("pk", "id");

ALTER TABLE "platform_staff_assignments" DROP CONSTRAINT IF EXISTS "platform_staff_assignments_platform_staff_pk_platform_staff_id_fkey";
ALTER TABLE "platform_staff_assignments" ADD CONSTRAINT "platform_staff_assignments_platform_staff_pk_platform_staff_id_fkey" FOREIGN KEY ("platform_staff_pk", "platform_staff_id") REFERENCES "platform_staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "platform_staff_assignments" DROP CONSTRAINT IF EXISTS "platform_staff_assignments_company_pk_company_id_fkey";
ALTER TABLE "platform_staff_assignments" ADD CONSTRAINT "platform_staff_assignments_company_pk_company_id_fkey" FOREIGN KEY ("company_pk", "company_id") REFERENCES "companies"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Refresh tokens
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "account_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "impersonated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("pk")
);

CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_id_key" ON "refresh_tokens"("id");
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_pk_id_key" ON "refresh_tokens"("pk", "id");
CREATE INDEX IF NOT EXISTS "refresh_tokens_account_type_account_id_idx" ON "refresh_tokens"("account_type", "account_id");
