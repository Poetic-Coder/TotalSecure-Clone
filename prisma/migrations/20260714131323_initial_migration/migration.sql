-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_VERIFIED', 'PENDING', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "IdentificationCardType" AS ENUM ('DRIVERS_LICENSE', 'INTERNATIONAL_PASSPORT', 'NATIONAL_ID', 'VOTERS_CARD');

-- CreateEnum
CREATE TYPE "GuardStatus" AS ENUM ('RECRUITED', 'BACKGROUND_CHECK', 'TRAINING', 'READY', 'DEPLOYED', 'SUSPENDED', 'RETIRED');

-- CreateEnum
CREATE TYPE "BackgroundCheckStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'REQUIRES_REVIEW');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('ENROLLED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'WAIVED');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('ACTIVE', 'ENDED', 'SUSPENDED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "DeploymentEndReason" AS ENUM ('CONTRACT_LOST', 'CONTRACT_ENDED', 'GUARD_REQUEST', 'CLIENT_REQUEST', 'DISCIPLINARY', 'ROTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('ORGANIZATION', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "IndividualAccountType" AS ENUM ('ESTATE', 'RESIDENCE', 'SMALL_FACILITY', 'FARM', 'OTHER');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CHURNED');

-- CreateEnum
CREATE TYPE "OnboardingMethod" AS ENUM ('SELF_SIGNUP', 'STAFF_ONBOARDED');

-- CreateEnum
CREATE TYPE "SiteClassification" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'GOVERNMENT', 'EDUCATIONAL', 'HEALTHCARE', 'MIXED_USE');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('SUPER_ADMIN', 'HR_MANAGER', 'OPERATIONS_MANAGER', 'SECURITY_SUPERVISOR', 'CONTROL_ROOM_OPERATOR', 'FINANCE_OFFICER', 'ACCOUNT_MANAGER');

-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('DAY', 'NIGHT', 'ROTATIONAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AttendanceMethod" AS ENUM ('GPS', 'QR_CODE', 'BIOMETRIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'SICK', 'EMERGENCY', 'MATERNITY', 'PATERNITY', 'UNPAID');

-- CreateEnum
CREATE TYPE "OvertimeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('THEFT', 'TRESPASSING', 'VANDALISM', 'FIRE', 'MEDICAL_EMERGENCY', 'ASSAULT', 'SUSPICIOUS_ACTIVITY', 'PROPERTY_DAMAGE', 'ACCESS_VIOLATION', 'OTHER');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('REPORTED', 'UNDER_REVIEW', 'ESCALATED', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "EscalationLevel" AS ENUM ('SUPERVISOR', 'OPERATIONS_MANAGER', 'MANAGEMENT', 'EMERGENCY_SERVICES');

-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('PENDING', 'CHECKED_IN', 'CHECKED_OUT', 'REJECTED');

-- CreateEnum
CREATE TYPE "AccessApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('INSIDE', 'OUTSIDE', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "CameraStatus" AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "RecordingType" AS ENUM ('CONTINUOUS', 'MOTION_BASED', 'EVENT_BASED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('CAMERA_OFFLINE', 'MOTION_DETECTED', 'INTRUSION', 'TAMPERING', 'FIRE', 'PANIC', 'ACCESS_DENIED');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_ALARM');

-- CreateEnum
CREATE TYPE "PatrolStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'ABORTED');

-- CreateEnum
CREATE TYPE "CheckpointStatus" AS ENUM ('PENDING', 'SCANNED', 'SKIPPED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('RADIO', 'BODY_CAMERA', 'MOBILE_DEVICE', 'UNIFORM', 'HANDCUFF', 'FIREARM', 'TORCH', 'FIRST_AID_KIT', 'OTHER');

-- CreateEnum
CREATE TYPE "EquipmentCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "PayrollRunStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollLineStatus" AS ENUM ('INCLUDED', 'EXCLUDED', 'ADJUSTED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "InvoiceLineType" AS ENUM ('GUARD_SERVICE', 'OVERTIME', 'EQUIPMENT_FEE', 'MANAGEMENT_FEE', 'PENALTY', 'DISCOUNT', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CASH', 'CHEQUE', 'ONLINE');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INCIDENT_REPORTED', 'INCIDENT_ESCALATED', 'PATROL_MISSED', 'GUARD_ABSENT', 'VISITOR_ARRIVAL', 'CAMERA_OFFLINE', 'ALERT_TRIGGERED', 'LEAVE_REQUEST', 'OVERTIME_REQUEST', 'PAYROLL_GENERATED', 'INVOICE_DUE', 'DEPLOYMENT_ENDED', 'GUARD_READY', 'SYSTEM_ALERT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'PERMISSION_CHANGE', 'EXPORT', 'APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('INCIDENT', 'PATROL', 'ATTENDANCE', 'VISITOR', 'VEHICLE', 'KPI', 'COMPLIANCE', 'RISK', 'PAYROLL', 'DEPLOYMENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'EXCEL', 'CSV');

-- CreateTable
CREATE TABLE "subscription_plans" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "for_client_type" "ClientType",
    "description" TEXT,
    "monthly_price" DOUBLE PRECISION NOT NULL,
    "quarterly_price" DOUBLE PRECISION,
    "annual_price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
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
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "staff" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "employee_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "active" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "manager_pk" INTEGER,
    "manager_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "staff_profiles" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "photo" TEXT,
    "dob" TIMESTAMP(3),
    "first_name" TEXT,
    "last_name" TEXT,
    "middle_name" TEXT,
    "gender" "Gender",
    "nationality" TEXT,
    "home_address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "id_type" "IdentificationCardType",
    "id_number" TEXT,
    "id_verified" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "id_document" TEXT,
    "staff_pk" INTEGER NOT NULL,
    "staff_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "guards" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "employee_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "status" "GuardStatus" NOT NULL DEFAULT 'RECRUITED',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "recruited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retired_at" TIMESTAMP(3),
    "base_salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "salary_bank_name" TEXT,
    "salary_account_number" TEXT,
    "salary_account_name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guards_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "guard_profiles" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "photo" TEXT,
    "dob" TIMESTAMP(3),
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "gender" "Gender",
    "nationality" TEXT,
    "home_address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "id_type" "IdentificationCardType",
    "id_number" TEXT,
    "id_verified" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "id_document" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "emergency_contact_relation" TEXT,
    "guard_pk" INTEGER NOT NULL,
    "guard_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guard_profiles_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "guard_background_checks" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "status" "BackgroundCheckStatus" NOT NULL DEFAULT 'PENDING',
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "provider" TEXT,
    "reference_number" TEXT,
    "notes" TEXT,
    "document_url" TEXT,
    "passed_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "fail_reason" TEXT,
    "guard_pk" INTEGER NOT NULL,
    "guard_id" UUID NOT NULL,
    "conducted_by_pk" INTEGER,
    "conducted_by_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guard_background_checks_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "guard_trainings" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "TrainingStatus" NOT NULL DEFAULT 'ENROLLED',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "completed_at" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "certificate_url" TEXT,
    "notes" TEXT,
    "guard_pk" INTEGER NOT NULL,
    "guard_id" UUID NOT NULL,
    "conducted_by_pk" INTEGER,
    "conducted_by_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guard_trainings_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "guard_certifications" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "issuing_body" TEXT NOT NULL,
    "certificate_number" TEXT,
    "document_url" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "is_expired" BOOLEAN NOT NULL DEFAULT false,
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "guard_pk" INTEGER NOT NULL,
    "guard_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guard_certifications_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "guard_kpi_scores" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "attendance_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "patrol_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "incident_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overall_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "guard_pk" INTEGER NOT NULL,
    "guard_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guard_kpi_scores_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "clients" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "client_type" "ClientType" NOT NULL,
    "onboarding_method" "OnboardingMethod" NOT NULL DEFAULT 'SELF_SIGNUP',
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "industry" TEXT,
    "registration_number" TEXT,
    "tax_id" TEXT,
    "individual_type" "IndividualAccountType",
    "owner_first_name" TEXT,
    "owner_last_name" TEXT,
    "owner_id_type" "IdentificationCardType",
    "owner_id_number" TEXT,
    "owner_id_document" TEXT,
    "owner_id_verified" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "default_guard_payout_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
    "invoice_due_days" INTEGER NOT NULL DEFAULT 30,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "account_manager_pk" INTEGER,
    "account_manager_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "client_subscriptions" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "trial_ends_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "external_ref" TEXT,
    "client_pk" INTEGER NOT NULL,
    "client_id" UUID NOT NULL,
    "plan_pk" INTEGER NOT NULL,
    "plan_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_subscriptions_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "client_branches" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "client_pk" INTEGER NOT NULL,
    "client_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_branches_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "client_staff" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "client_pk" INTEGER NOT NULL,
    "client_id" UUID NOT NULL,
    "branch_pk" INTEGER,
    "branch_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_staff_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "client_staff_profiles" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "photo" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "gender" "Gender",
    "id_type" "IdentificationCardType",
    "id_number" TEXT,
    "id_verified" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "id_document" TEXT,
    "client_staff_pk" INTEGER NOT NULL,
    "client_staff_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_staff_profiles_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "sites" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "classification" "SiteClassification" NOT NULL DEFAULT 'COMMERCIAL',
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geofence_radius" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "map_image_url" TEXT,
    "description" TEXT,
    "client_pk" INTEGER NOT NULL,
    "client_id" UUID NOT NULL,
    "branch_pk" INTEGER,
    "branch_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "guard_deployments" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "end_reason" "DeploymentEndReason",
    "end_notes" TEXT,
    "client_rate" DOUBLE PRECISION NOT NULL,
    "guard_pay_rate" DOUBLE PRECISION NOT NULL,
    "guard_payout_pct" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "guard_pk" INTEGER NOT NULL,
    "guard_id" UUID NOT NULL,
    "client_pk" INTEGER NOT NULL,
    "client_id" UUID NOT NULL,
    "site_pk" INTEGER NOT NULL,
    "site_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guard_deployments_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "shifts" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ShiftType" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "days_of_week" INTEGER[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "site_pk" INTEGER NOT NULL,
    "site_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "guard_shifts" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "PatrolStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "shift_pk" INTEGER NOT NULL,
    "shift_id" UUID NOT NULL,
    "deployment_pk" INTEGER NOT NULL,
    "deployment_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guard_shifts_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "check_in_time" TIMESTAMP(3),
    "check_out_time" TIMESTAMP(3),
    "check_in_method" "AttendanceMethod",
    "check_out_method" "AttendanceMethod",
    "check_in_latitude" DOUBLE PRECISION,
    "check_in_longitude" DOUBLE PRECISION,
    "check_out_latitude" DOUBLE PRECISION,
    "check_out_longitude" DOUBLE PRECISION,
    "check_in_qr_code" TEXT,
    "hours_worked" DOUBLE PRECISION,
    "is_late" BOOLEAN NOT NULL DEFAULT false,
    "is_absent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "deployment_pk" INTEGER NOT NULL,
    "deployment_id" UUID NOT NULL,
    "guard_shift_pk" INTEGER,
    "guard_shift_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "type" "LeaveType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_days" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "document_url" TEXT,
    "guard_pk" INTEGER NOT NULL,
    "guard_id" UUID NOT NULL,
    "approver_pk" INTEGER,
    "approver_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "overtime_requests" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" "OvertimeStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "guard_pk" INTEGER NOT NULL,
    "guard_id" UUID NOT NULL,
    "approver_pk" INTEGER,
    "approver_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "overtime_requests_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "payroll_runs" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "status" "PayrollRunStatus" NOT NULL DEFAULT 'DRAFT',
    "total_gross" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_net" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "approved_by_pk" INTEGER,
    "approved_by_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_runs_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "payroll_lines" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "status" "PayrollLineStatus" NOT NULL DEFAULT 'INCLUDED',
    "days_worked" DOUBLE PRECISION NOT NULL,
    "hours_worked" DOUBLE PRECISION NOT NULL,
    "gross_amount" DOUBLE PRECISION NOT NULL,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net_amount" DOUBLE PRECISION NOT NULL,
    "overtime_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adjustment_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adjustment_reason" TEXT,
    "notes" TEXT,
    "snapshot_client_rate" DOUBLE PRECISION NOT NULL,
    "snapshot_guard_pay_rate" DOUBLE PRECISION NOT NULL,
    "snapshot_payout_pct" DOUBLE PRECISION NOT NULL,
    "payroll_run_pk" INTEGER NOT NULL,
    "payroll_run_id" UUID NOT NULL,
    "guard_pk" INTEGER NOT NULL,
    "guard_id" UUID NOT NULL,
    "deployment_pk" INTEGER NOT NULL,
    "deployment_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_lines_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "invoices" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount_paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount_due" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "due_date" DATE NOT NULL,
    "sent_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "pdf_url" TEXT,
    "client_pk" INTEGER NOT NULL,
    "client_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "type" "InvoiceLineType" NOT NULL DEFAULT 'GUARD_SERVICE',
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "invoice_pk" INTEGER NOT NULL,
    "invoice_id" UUID NOT NULL,
    "deployment_pk" INTEGER,
    "deployment_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "invoice_payments" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "invoice_pk" INTEGER NOT NULL,
    "invoice_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "equipment" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "serial_number" TEXT,
    "type" "EquipmentType" NOT NULL,
    "condition" "EquipmentCondition" NOT NULL DEFAULT 'GOOD',
    "is_assigned" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "equipment_assignments" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "condition_on_return" "EquipmentCondition",
    "notes" TEXT,
    "equipment_pk" INTEGER NOT NULL,
    "equipment_id" UUID NOT NULL,
    "guard_pk" INTEGER NOT NULL,
    "guard_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_assignments_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "checkpoints" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "qr_code" TEXT,
    "rfid_tag" TEXT,
    "nfc_tag" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL,
    "site_pk" INTEGER NOT NULL,
    "site_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkpoints_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "patrols" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "scheduled_start" TIMESTAMP(3) NOT NULL,
    "scheduled_end" TIMESTAMP(3) NOT NULL,
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "status" "PatrolStatus" NOT NULL DEFAULT 'SCHEDULED',
    "completion_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "report_url" TEXT,
    "deployment_pk" INTEGER NOT NULL,
    "deployment_id" UUID NOT NULL,
    "site_pk" INTEGER NOT NULL,
    "site_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patrols_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "patrol_checkpoints" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "status" "CheckpointStatus" NOT NULL DEFAULT 'PENDING',
    "scanned_at" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "notes" TEXT,
    "photo_url" TEXT,
    "patrol_pk" INTEGER NOT NULL,
    "patrol_id" UUID NOT NULL,
    "checkpoint_pk" INTEGER NOT NULL,
    "checkpoint_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patrol_checkpoints_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "incidents" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "reference_number" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "IncidentStatus" NOT NULL DEFAULT 'REPORTED',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "is_escalated" BOOLEAN NOT NULL DEFAULT false,
    "escalation_level" "EscalationLevel",
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "closure_notes" TEXT,
    "client_pk" INTEGER,
    "client_id" UUID,
    "site_pk" INTEGER,
    "site_id" UUID,
    "assignee_pk" INTEGER,
    "assignee_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "incident_evidence" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "is_video_evidence" BOOLEAN NOT NULL DEFAULT false,
    "captured_at" TIMESTAMP(3),
    "incident_pk" INTEGER NOT NULL,
    "incident_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_evidence_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "incident_escalations" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "level" "EscalationLevel" NOT NULL,
    "notes" TEXT,
    "escalated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "escalated_by_pk" INTEGER,
    "escalated_by_id" UUID,
    "incident_pk" INTEGER NOT NULL,
    "incident_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_escalations_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "incident_investigations" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "summary" TEXT,
    "root_cause" TEXT,
    "witness_statements" JSONB,
    "findings" TEXT,
    "completed_at" TIMESTAMP(3),
    "incident_pk" INTEGER NOT NULL,
    "incident_id" UUID NOT NULL,
    "investigator_pk" INTEGER,
    "investigator_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_investigations_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "corrective_actions" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "due_date" DATE,
    "completed_at" TIMESTAMP(3),
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "incident_pk" INTEGER NOT NULL,
    "incident_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corrective_actions_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "visitors" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "photo" TEXT,
    "id_type" "IdentificationCardType",
    "id_number" TEXT,
    "id_document" TEXT,
    "company" TEXT,
    "is_blacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklist_reason" TEXT,
    "blacklisted_at" TIMESTAMP(3),
    "client_pk" INTEGER,
    "client_id" UUID,
    "site_pk" INTEGER,
    "site_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "visitor_visits" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "purpose" TEXT,
    "host_name" TEXT,
    "host_department" TEXT,
    "host_phone" TEXT,
    "status" "VisitorStatus" NOT NULL DEFAULT 'PENDING',
    "approval_status" "AccessApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "badge_number" TEXT,
    "badge_printed_at" TIMESTAMP(3),
    "pre_registered_at" TIMESTAMP(3),
    "check_in_time" TIMESTAMP(3),
    "check_out_time" TIMESTAMP(3),
    "scheduled_at" TIMESTAMP(3),
    "notes" TEXT,
    "vehicle_plate" TEXT,
    "visitor_pk" INTEGER NOT NULL,
    "visitor_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitor_visits_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "plate_number" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "color" TEXT,
    "type" TEXT,
    "is_blacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklist_reason" TEXT,
    "blacklisted_at" TIMESTAMP(3),
    "client_pk" INTEGER,
    "client_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "vehicle_drivers" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "license_number" TEXT,
    "photo" TEXT,
    "is_blacklisted" BOOLEAN NOT NULL DEFAULT false,
    "vehicle_pk" INTEGER NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_drivers_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "parking_zones" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "site_pk" INTEGER NOT NULL,
    "site_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_zones_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "vehicle_entries" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "entry_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exit_time" TIMESTAMP(3),
    "purpose" TEXT,
    "approval_status" "AccessApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "status" "VehicleStatus" NOT NULL DEFAULT 'INSIDE',
    "plate_snapshot" TEXT,
    "driver_verified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "vehicle_pk" INTEGER NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "site_pk" INTEGER NOT NULL,
    "site_id" UUID NOT NULL,
    "parking_zone_pk" INTEGER,
    "parking_zone_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_entries_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "cameras" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "serial_number" TEXT,
    "ip_address" TEXT,
    "rtsp_url" TEXT,
    "stream_url" TEXT,
    "make" TEXT,
    "model" TEXT,
    "resolution" TEXT,
    "status" "CameraStatus" NOT NULL DEFAULT 'ONLINE',
    "recording_type" "RecordingType" NOT NULL DEFAULT 'CONTINUOUS',
    "is_recording" BOOLEAN NOT NULL DEFAULT true,
    "last_heartbeat" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "mount_location" TEXT,
    "view_direction" TEXT,
    "storage_retention_days" INTEGER NOT NULL DEFAULT 30,
    "client_pk" INTEGER,
    "client_id" UUID,
    "site_pk" INTEGER,
    "site_id" UUID,
    "group_pk" INTEGER,
    "group_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cameras_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "camera_groups" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "client_pk" INTEGER,
    "client_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camera_groups_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "video_recordings" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "file_path" TEXT,
    "file_size" BIGINT,
    "duration" INTEGER,
    "type" "RecordingType" NOT NULL,
    "thumbnail_url" TEXT,
    "is_evidence" BOOLEAN NOT NULL DEFAULT false,
    "camera_pk" INTEGER NOT NULL,
    "camera_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_recordings_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "camera_alerts" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "type" "AlertType" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "message" TEXT,
    "snapshot_url" TEXT,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "camera_pk" INTEGER NOT NULL,
    "camera_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camera_alerts_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "roles" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "permissions" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "role_pk" INTEGER NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_pk" INTEGER NOT NULL,
    "permission_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "reports" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "format" "ReportFormat" NOT NULL DEFAULT 'PDF',
    "filters" JSONB,
    "file_url" TEXT,
    "generated_at" TIMESTAMP(3),
    "period_start" DATE,
    "period_end" DATE,
    "is_scheduled" BOOLEAN NOT NULL DEFAULT false,
    "schedule_config" JSONB,
    "client_pk" INTEGER,
    "client_id" UUID,
    "generated_by_pk" INTEGER,
    "generated_by_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "notifications" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "metadata" JSONB,
    "staff_pk" INTEGER,
    "staff_id" UUID,
    "guard_pk" INTEGER,
    "guard_id" UUID,
    "client_staff_pk" INTEGER,
    "client_staff_id" UUID,
    "client_pk" INTEGER,
    "client_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "expires_at" TIMESTAMP(3),
    "last_used" TIMESTAMP(3),
    "rate_limit" INTEGER NOT NULL DEFAULT 1000,
    "request_count" INTEGER NOT NULL DEFAULT 0,
    "reset_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "staff_pk" INTEGER,
    "staff_id" UUID,
    "guard_pk" INTEGER,
    "guard_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "module" TEXT NOT NULL,
    "target_id" TEXT,
    "target_type" TEXT,
    "description" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "staff_pk" INTEGER,
    "staff_id" UUID,
    "client_pk" INTEGER,
    "client_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_id_key" ON "subscription_plans"("id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_pk_id_key" ON "subscription_plans"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_id_key" ON "staff"("id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_employee_id_key" ON "staff"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_phone_key" ON "staff"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "staff_pk_id_key" ON "staff"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_id_key" ON "staff_profiles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_staff_pk_key" ON "staff_profiles"("staff_pk");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_staff_id_key" ON "staff_profiles"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_pk_id_key" ON "staff_profiles"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_staff_pk_staff_id_key" ON "staff_profiles"("staff_pk", "staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "guards_id_key" ON "guards"("id");

-- CreateIndex
CREATE UNIQUE INDEX "guards_employee_id_key" ON "guards"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "guards_email_key" ON "guards"("email");

-- CreateIndex
CREATE UNIQUE INDEX "guards_phone_key" ON "guards"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "guards_pk_id_key" ON "guards"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_profiles_id_key" ON "guard_profiles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_profiles_guard_pk_key" ON "guard_profiles"("guard_pk");

-- CreateIndex
CREATE UNIQUE INDEX "guard_profiles_guard_id_key" ON "guard_profiles"("guard_id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_profiles_pk_id_key" ON "guard_profiles"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_profiles_guard_pk_guard_id_key" ON "guard_profiles"("guard_pk", "guard_id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_background_checks_id_key" ON "guard_background_checks"("id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_background_checks_guard_pk_key" ON "guard_background_checks"("guard_pk");

-- CreateIndex
CREATE UNIQUE INDEX "guard_background_checks_guard_id_key" ON "guard_background_checks"("guard_id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_background_checks_pk_id_key" ON "guard_background_checks"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_background_checks_guard_pk_guard_id_key" ON "guard_background_checks"("guard_pk", "guard_id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_trainings_id_key" ON "guard_trainings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_trainings_pk_id_key" ON "guard_trainings"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_certifications_id_key" ON "guard_certifications"("id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_certifications_pk_id_key" ON "guard_certifications"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_kpi_scores_id_key" ON "guard_kpi_scores"("id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_kpi_scores_guard_pk_period_key" ON "guard_kpi_scores"("guard_pk", "period");

-- CreateIndex
CREATE UNIQUE INDEX "guard_kpi_scores_pk_id_key" ON "guard_kpi_scores"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_id_key" ON "clients"("id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_slug_key" ON "clients"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_phone_key" ON "clients"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "clients_pk_id_key" ON "clients"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "client_subscriptions_id_key" ON "client_subscriptions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "client_subscriptions_client_pk_key" ON "client_subscriptions"("client_pk");

-- CreateIndex
CREATE UNIQUE INDEX "client_subscriptions_client_id_key" ON "client_subscriptions"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_subscriptions_pk_id_key" ON "client_subscriptions"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "client_subscriptions_client_pk_client_id_key" ON "client_subscriptions"("client_pk", "client_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_branches_id_key" ON "client_branches"("id");

-- CreateIndex
CREATE UNIQUE INDEX "client_branches_pk_id_key" ON "client_branches"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "client_staff_id_key" ON "client_staff"("id");

-- CreateIndex
CREATE UNIQUE INDEX "client_staff_email_key" ON "client_staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_staff_phone_key" ON "client_staff"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "client_staff_pk_id_key" ON "client_staff"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "client_staff_profiles_id_key" ON "client_staff_profiles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "client_staff_profiles_client_staff_pk_key" ON "client_staff_profiles"("client_staff_pk");

-- CreateIndex
CREATE UNIQUE INDEX "client_staff_profiles_client_staff_id_key" ON "client_staff_profiles"("client_staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_staff_profiles_pk_id_key" ON "client_staff_profiles"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "client_staff_profiles_client_staff_pk_client_staff_id_key" ON "client_staff_profiles"("client_staff_pk", "client_staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "sites_id_key" ON "sites"("id");

-- CreateIndex
CREATE UNIQUE INDEX "sites_code_key" ON "sites"("code");

-- CreateIndex
CREATE UNIQUE INDEX "sites_pk_id_key" ON "sites"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_deployments_id_key" ON "guard_deployments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_deployments_pk_id_key" ON "guard_deployments"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_id_key" ON "shifts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_pk_id_key" ON "shifts"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_shifts_id_key" ON "guard_shifts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "guard_shifts_pk_id_key" ON "guard_shifts"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_id_key" ON "attendance_records"("id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_guard_shift_pk_key" ON "attendance_records"("guard_shift_pk");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_guard_shift_id_key" ON "attendance_records"("guard_shift_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_pk_id_key" ON "attendance_records"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_guard_shift_pk_guard_shift_id_key" ON "attendance_records"("guard_shift_pk", "guard_shift_id");

-- CreateIndex
CREATE UNIQUE INDEX "leave_requests_id_key" ON "leave_requests"("id");

-- CreateIndex
CREATE UNIQUE INDEX "leave_requests_pk_id_key" ON "leave_requests"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "overtime_requests_id_key" ON "overtime_requests"("id");

-- CreateIndex
CREATE UNIQUE INDEX "overtime_requests_pk_id_key" ON "overtime_requests"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_id_key" ON "payroll_runs"("id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_period_key" ON "payroll_runs"("period");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_pk_id_key" ON "payroll_runs"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_lines_id_key" ON "payroll_lines"("id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_lines_pk_id_key" ON "payroll_lines"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_id_key" ON "invoices"("id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_pk_id_key" ON "invoices"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_line_items_id_key" ON "invoice_line_items"("id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_line_items_pk_id_key" ON "invoice_line_items"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_payments_id_key" ON "invoice_payments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_payments_pk_id_key" ON "invoice_payments"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_id_key" ON "equipment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_serial_number_key" ON "equipment"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_pk_id_key" ON "equipment"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_assignments_id_key" ON "equipment_assignments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_assignments_pk_id_key" ON "equipment_assignments"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoints_id_key" ON "checkpoints"("id");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoints_qr_code_key" ON "checkpoints"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoints_rfid_tag_key" ON "checkpoints"("rfid_tag");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoints_nfc_tag_key" ON "checkpoints"("nfc_tag");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoints_pk_id_key" ON "checkpoints"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "patrols_id_key" ON "patrols"("id");

-- CreateIndex
CREATE UNIQUE INDEX "patrols_pk_id_key" ON "patrols"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "patrol_checkpoints_id_key" ON "patrol_checkpoints"("id");

-- CreateIndex
CREATE UNIQUE INDEX "patrol_checkpoints_pk_id_key" ON "patrol_checkpoints"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_id_key" ON "incidents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_reference_number_key" ON "incidents"("reference_number");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_pk_id_key" ON "incidents"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "incident_evidence_id_key" ON "incident_evidence"("id");

-- CreateIndex
CREATE UNIQUE INDEX "incident_evidence_pk_id_key" ON "incident_evidence"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "incident_escalations_id_key" ON "incident_escalations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "incident_escalations_pk_id_key" ON "incident_escalations"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "incident_investigations_id_key" ON "incident_investigations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "incident_investigations_incident_pk_key" ON "incident_investigations"("incident_pk");

-- CreateIndex
CREATE UNIQUE INDEX "incident_investigations_incident_id_key" ON "incident_investigations"("incident_id");

-- CreateIndex
CREATE UNIQUE INDEX "incident_investigations_pk_id_key" ON "incident_investigations"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "incident_investigations_incident_pk_incident_id_key" ON "incident_investigations"("incident_pk", "incident_id");

-- CreateIndex
CREATE UNIQUE INDEX "corrective_actions_id_key" ON "corrective_actions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "corrective_actions_pk_id_key" ON "corrective_actions"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_id_key" ON "visitors"("id");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_pk_id_key" ON "visitors"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_visits_id_key" ON "visitor_visits"("id");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_visits_badge_number_key" ON "visitor_visits"("badge_number");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_visits_pk_id_key" ON "visitor_visits"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_id_key" ON "vehicles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_pk_id_key" ON "vehicles"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_drivers_id_key" ON "vehicle_drivers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_drivers_license_number_key" ON "vehicle_drivers"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_drivers_vehicle_pk_key" ON "vehicle_drivers"("vehicle_pk");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_drivers_vehicle_id_key" ON "vehicle_drivers"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_drivers_pk_id_key" ON "vehicle_drivers"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_drivers_vehicle_pk_vehicle_id_key" ON "vehicle_drivers"("vehicle_pk", "vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "parking_zones_id_key" ON "parking_zones"("id");

-- CreateIndex
CREATE UNIQUE INDEX "parking_zones_pk_id_key" ON "parking_zones"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_entries_id_key" ON "vehicle_entries"("id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_entries_pk_id_key" ON "vehicle_entries"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "cameras_id_key" ON "cameras"("id");

-- CreateIndex
CREATE UNIQUE INDEX "cameras_serial_number_key" ON "cameras"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "cameras_pk_id_key" ON "cameras"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "camera_groups_id_key" ON "camera_groups"("id");

-- CreateIndex
CREATE UNIQUE INDEX "camera_groups_pk_id_key" ON "camera_groups"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "video_recordings_id_key" ON "video_recordings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "video_recordings_pk_id_key" ON "video_recordings"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "camera_alerts_id_key" ON "camera_alerts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "camera_alerts_pk_id_key" ON "camera_alerts"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_id_key" ON "roles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_pk_id_key" ON "roles"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_id_key" ON "permissions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_pk_id_key" ON "permissions"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_id_key" ON "role_permissions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_pk_permission_pk_key" ON "role_permissions"("role_pk", "permission_pk");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_pk_id_key" ON "role_permissions"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_id_key" ON "reports"("id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_pk_id_key" ON "reports"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_id_key" ON "notifications"("id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_pk_id_key" ON "notifications"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_id_key" ON "api_keys"("id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_staff_pk_staff_id_key" ON "api_keys"("staff_pk", "staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_guard_pk_guard_id_key" ON "api_keys"("guard_pk", "guard_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_pk_id_key" ON "api_keys"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_id_key" ON "audit_logs"("id");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_pk_id_key" ON "audit_logs"("pk", "id");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_manager_pk_manager_id_fkey" FOREIGN KEY ("manager_pk", "manager_id") REFERENCES "staff"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_staff_pk_staff_id_fkey" FOREIGN KEY ("staff_pk", "staff_id") REFERENCES "staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_profiles" ADD CONSTRAINT "guard_profiles_guard_pk_guard_id_fkey" FOREIGN KEY ("guard_pk", "guard_id") REFERENCES "guards"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_background_checks" ADD CONSTRAINT "guard_background_checks_guard_pk_guard_id_fkey" FOREIGN KEY ("guard_pk", "guard_id") REFERENCES "guards"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_background_checks" ADD CONSTRAINT "guard_background_checks_conducted_by_pk_conducted_by_id_fkey" FOREIGN KEY ("conducted_by_pk", "conducted_by_id") REFERENCES "staff"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_trainings" ADD CONSTRAINT "guard_trainings_guard_pk_guard_id_fkey" FOREIGN KEY ("guard_pk", "guard_id") REFERENCES "guards"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_trainings" ADD CONSTRAINT "guard_trainings_conducted_by_pk_conducted_by_id_fkey" FOREIGN KEY ("conducted_by_pk", "conducted_by_id") REFERENCES "staff"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_certifications" ADD CONSTRAINT "guard_certifications_guard_pk_guard_id_fkey" FOREIGN KEY ("guard_pk", "guard_id") REFERENCES "guards"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_kpi_scores" ADD CONSTRAINT "guard_kpi_scores_guard_pk_guard_id_fkey" FOREIGN KEY ("guard_pk", "guard_id") REFERENCES "guards"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_manager_pk_account_manager_id_fkey" FOREIGN KEY ("account_manager_pk", "account_manager_id") REFERENCES "staff"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_subscriptions" ADD CONSTRAINT "client_subscriptions_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_subscriptions" ADD CONSTRAINT "client_subscriptions_plan_pk_plan_id_fkey" FOREIGN KEY ("plan_pk", "plan_id") REFERENCES "subscription_plans"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_branches" ADD CONSTRAINT "client_branches_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_staff" ADD CONSTRAINT "client_staff_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_staff" ADD CONSTRAINT "client_staff_branch_pk_branch_id_fkey" FOREIGN KEY ("branch_pk", "branch_id") REFERENCES "client_branches"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_staff_profiles" ADD CONSTRAINT "client_staff_profiles_client_staff_pk_client_staff_id_fkey" FOREIGN KEY ("client_staff_pk", "client_staff_id") REFERENCES "client_staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_branch_pk_branch_id_fkey" FOREIGN KEY ("branch_pk", "branch_id") REFERENCES "client_branches"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_deployments" ADD CONSTRAINT "guard_deployments_guard_pk_guard_id_fkey" FOREIGN KEY ("guard_pk", "guard_id") REFERENCES "guards"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_deployments" ADD CONSTRAINT "guard_deployments_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_deployments" ADD CONSTRAINT "guard_deployments_site_pk_site_id_fkey" FOREIGN KEY ("site_pk", "site_id") REFERENCES "sites"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_site_pk_site_id_fkey" FOREIGN KEY ("site_pk", "site_id") REFERENCES "sites"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_shifts" ADD CONSTRAINT "guard_shifts_shift_pk_shift_id_fkey" FOREIGN KEY ("shift_pk", "shift_id") REFERENCES "shifts"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard_shifts" ADD CONSTRAINT "guard_shifts_deployment_pk_deployment_id_fkey" FOREIGN KEY ("deployment_pk", "deployment_id") REFERENCES "guard_deployments"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_deployment_pk_deployment_id_fkey" FOREIGN KEY ("deployment_pk", "deployment_id") REFERENCES "guard_deployments"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_guard_shift_pk_guard_shift_id_fkey" FOREIGN KEY ("guard_shift_pk", "guard_shift_id") REFERENCES "guard_shifts"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_guard_pk_guard_id_fkey" FOREIGN KEY ("guard_pk", "guard_id") REFERENCES "guards"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approver_pk_approver_id_fkey" FOREIGN KEY ("approver_pk", "approver_id") REFERENCES "staff"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime_requests" ADD CONSTRAINT "overtime_requests_guard_pk_guard_id_fkey" FOREIGN KEY ("guard_pk", "guard_id") REFERENCES "guards"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime_requests" ADD CONSTRAINT "overtime_requests_approver_pk_approver_id_fkey" FOREIGN KEY ("approver_pk", "approver_id") REFERENCES "staff"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_approved_by_pk_approved_by_id_fkey" FOREIGN KEY ("approved_by_pk", "approved_by_id") REFERENCES "staff"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_payroll_run_pk_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_pk", "payroll_run_id") REFERENCES "payroll_runs"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_guard_pk_guard_id_fkey" FOREIGN KEY ("guard_pk", "guard_id") REFERENCES "guards"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_deployment_pk_deployment_id_fkey" FOREIGN KEY ("deployment_pk", "deployment_id") REFERENCES "guard_deployments"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_pk_invoice_id_fkey" FOREIGN KEY ("invoice_pk", "invoice_id") REFERENCES "invoices"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_deployment_pk_deployment_id_fkey" FOREIGN KEY ("deployment_pk", "deployment_id") REFERENCES "guard_deployments"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_invoice_pk_invoice_id_fkey" FOREIGN KEY ("invoice_pk", "invoice_id") REFERENCES "invoices"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignments" ADD CONSTRAINT "equipment_assignments_equipment_pk_equipment_id_fkey" FOREIGN KEY ("equipment_pk", "equipment_id") REFERENCES "equipment"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignments" ADD CONSTRAINT "equipment_assignments_guard_pk_guard_id_fkey" FOREIGN KEY ("guard_pk", "guard_id") REFERENCES "guards"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkpoints" ADD CONSTRAINT "checkpoints_site_pk_site_id_fkey" FOREIGN KEY ("site_pk", "site_id") REFERENCES "sites"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrols" ADD CONSTRAINT "patrols_deployment_pk_deployment_id_fkey" FOREIGN KEY ("deployment_pk", "deployment_id") REFERENCES "guard_deployments"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrols" ADD CONSTRAINT "patrols_site_pk_site_id_fkey" FOREIGN KEY ("site_pk", "site_id") REFERENCES "sites"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrol_checkpoints" ADD CONSTRAINT "patrol_checkpoints_patrol_pk_patrol_id_fkey" FOREIGN KEY ("patrol_pk", "patrol_id") REFERENCES "patrols"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrol_checkpoints" ADD CONSTRAINT "patrol_checkpoints_checkpoint_pk_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_pk", "checkpoint_id") REFERENCES "checkpoints"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_site_pk_site_id_fkey" FOREIGN KEY ("site_pk", "site_id") REFERENCES "sites"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_assignee_pk_assignee_id_fkey" FOREIGN KEY ("assignee_pk", "assignee_id") REFERENCES "staff"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_evidence" ADD CONSTRAINT "incident_evidence_incident_pk_incident_id_fkey" FOREIGN KEY ("incident_pk", "incident_id") REFERENCES "incidents"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_escalations" ADD CONSTRAINT "incident_escalations_incident_pk_incident_id_fkey" FOREIGN KEY ("incident_pk", "incident_id") REFERENCES "incidents"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_investigations" ADD CONSTRAINT "incident_investigations_incident_pk_incident_id_fkey" FOREIGN KEY ("incident_pk", "incident_id") REFERENCES "incidents"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_investigations" ADD CONSTRAINT "incident_investigations_investigator_pk_investigator_id_fkey" FOREIGN KEY ("investigator_pk", "investigator_id") REFERENCES "staff"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_incident_pk_incident_id_fkey" FOREIGN KEY ("incident_pk", "incident_id") REFERENCES "incidents"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_site_pk_site_id_fkey" FOREIGN KEY ("site_pk", "site_id") REFERENCES "sites"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_visits" ADD CONSTRAINT "visitor_visits_visitor_pk_visitor_id_fkey" FOREIGN KEY ("visitor_pk", "visitor_id") REFERENCES "visitors"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_drivers" ADD CONSTRAINT "vehicle_drivers_vehicle_pk_vehicle_id_fkey" FOREIGN KEY ("vehicle_pk", "vehicle_id") REFERENCES "vehicles"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_zones" ADD CONSTRAINT "parking_zones_site_pk_site_id_fkey" FOREIGN KEY ("site_pk", "site_id") REFERENCES "sites"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_entries" ADD CONSTRAINT "vehicle_entries_vehicle_pk_vehicle_id_fkey" FOREIGN KEY ("vehicle_pk", "vehicle_id") REFERENCES "vehicles"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_entries" ADD CONSTRAINT "vehicle_entries_site_pk_site_id_fkey" FOREIGN KEY ("site_pk", "site_id") REFERENCES "sites"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_entries" ADD CONSTRAINT "vehicle_entries_parking_zone_pk_parking_zone_id_fkey" FOREIGN KEY ("parking_zone_pk", "parking_zone_id") REFERENCES "parking_zones"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cameras" ADD CONSTRAINT "cameras_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cameras" ADD CONSTRAINT "cameras_site_pk_site_id_fkey" FOREIGN KEY ("site_pk", "site_id") REFERENCES "sites"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cameras" ADD CONSTRAINT "cameras_group_pk_group_id_fkey" FOREIGN KEY ("group_pk", "group_id") REFERENCES "camera_groups"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_recordings" ADD CONSTRAINT "video_recordings_camera_pk_camera_id_fkey" FOREIGN KEY ("camera_pk", "camera_id") REFERENCES "cameras"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camera_alerts" ADD CONSTRAINT "camera_alerts_camera_pk_camera_id_fkey" FOREIGN KEY ("camera_pk", "camera_id") REFERENCES "cameras"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_pk_role_id_fkey" FOREIGN KEY ("role_pk", "role_id") REFERENCES "roles"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_pk_permission_id_fkey" FOREIGN KEY ("permission_pk", "permission_id") REFERENCES "permissions"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_pk_generated_by_id_fkey" FOREIGN KEY ("generated_by_pk", "generated_by_id") REFERENCES "staff"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_staff_pk_staff_id_fkey" FOREIGN KEY ("staff_pk", "staff_id") REFERENCES "staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_guard_pk_guard_id_fkey" FOREIGN KEY ("guard_pk", "guard_id") REFERENCES "guards"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_client_staff_pk_client_staff_id_fkey" FOREIGN KEY ("client_staff_pk", "client_staff_id") REFERENCES "client_staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_staff_pk_staff_id_fkey" FOREIGN KEY ("staff_pk", "staff_id") REFERENCES "staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_guard_pk_guard_id_fkey" FOREIGN KEY ("guard_pk", "guard_id") REFERENCES "guards"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_staff_pk_staff_id_fkey" FOREIGN KEY ("staff_pk", "staff_id") REFERENCES "staff"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_client_pk_client_id_fkey" FOREIGN KEY ("client_pk", "client_id") REFERENCES "clients"("pk", "id") ON DELETE SET NULL ON UPDATE CASCADE;
