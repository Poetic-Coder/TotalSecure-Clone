-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('NGN', 'USD', 'GBP', 'EUR', 'SAR');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_VERIFIED', 'PENDING', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "IdentificationCardType" AS ENUM ('DRIVERS_LICENSE', 'INTERNATIONAL_PASSPORT', 'NATIONAL_ID', 'VOTERS_CARD');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'REFUND', 'TRANSFER', 'BOOKING_PAYMENT', 'COMMISSION_PAYMENT', 'WALLET_FUNDING', 'GROUP_BOOKING_PAYMENT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'ISSUED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('WALLET', 'CARD', 'BANK_TRANSFER', 'CASH');

-- CreateEnum
CREATE TYPE "TripClass" AS ENUM ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST_CLASS');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('INDIVIDUAL', 'GROUP');

-- CreateEnum
CREATE TYPE "GroupBookingStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ISSUED');

-- CreateEnum
CREATE TYPE "StaffDepartment" AS ENUM ('TICKETING', 'CUSTOMER_SERVICE', 'SALES', 'OPERATIONS', 'MANAGEMENT');

-- CreateEnum
CREATE TYPE "AgentLevel" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "AgentKycStatus" AS ENUM ('PROCESSING', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "api_keys" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "staff_pk" INTEGER,
    "staff_id" UUID,
    "agent_pk" INTEGER,
    "agent_id" UUID,
    "customer_pk" INTEGER,
    "customer_id" UUID,
    "description" TEXT,
    "expires_at" TIMESTAMP(3),
    "last_used" TIMESTAMP(3),
    "rate_limit" INTEGER NOT NULL DEFAULT 1000,
    "request_count" INTEGER NOT NULL DEFAULT 0,
    "reset_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "staff" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "employee_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "department" "StaffDepartment" NOT NULL,
    "position" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "manager_pk" INTEGER,
    "manager_id" UUID,
    "can_issue_tickets" BOOLEAN NOT NULL DEFAULT false,
    "can_approve_groups" BOOLEAN NOT NULL DEFAULT false,
    "can_generate_reports" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "agents" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "agent_code" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "agent_level" "AgentLevel" NOT NULL DEFAULT 'BRONZE',
    "commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "customers" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "frequent_flyer_number" TEXT,
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("pk")
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
CREATE TABLE "agent_profiles" (
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
    "agent_pk" INTEGER NOT NULL,
    "agent_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_profiles_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "agent_kyc" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "bvn" TEXT,
    "logo" TEXT,
    "business_name" TEXT,
    "business_description" TEXT,
    "id_type" "IdentificationCardType",
    "id_number" TEXT,
    "id_image_url" TEXT,
    "cac_number" TEXT,
    "cac_image_url" TEXT,
    "cac_verified" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "bvn_verified" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "id_verified" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "face_verified" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "rawBvnData" JSONB,
    "rawIdData" JSONB,
    "rawFaceData" JSONB,
    "rawCacData" JSONB,
    "agent_pk" INTEGER NOT NULL,
    "agent_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "AgentKycStatus" NOT NULL DEFAULT 'PROCESSING',

    CONSTRAINT "agent_kyc_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "customer_profiles" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "photo" TEXT,
    "dob" TIMESTAMP(3),
    "first_name" TEXT,
    "last_name" TEXT,
    "middle_name" TEXT,
    "gender" "Gender",
    "nationality" TEXT,
    "passport_number" TEXT,
    "passport_expiry" TIMESTAMP(3),
    "passport_country" TEXT,
    "home_address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "id_type" "IdentificationCardType",
    "id_number" TEXT,
    "id_verified" "VerificationStatus" DEFAULT 'NOT_VERIFIED',
    "seat_preference" TEXT,
    "meal_preference" TEXT,
    "customer_pk" INTEGER NOT NULL,
    "customer_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "aircraft" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "registration" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "total_seats" INTEGER NOT NULL,
    "economy_seats" INTEGER NOT NULL,
    "business_seats" INTEGER NOT NULL,
    "first_class_seats" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aircraft_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "airports" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "timezone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "airports_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "trips" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "origin_pk" INTEGER NOT NULL,
    "origin_id" UUID NOT NULL,
    "destination_pk" INTEGER NOT NULL,
    "destination_id" UUID NOT NULL,
    "aircraft_pk" INTEGER NOT NULL,
    "aircraft_id" UUID NOT NULL,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "arrival_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3),
    "economy_price" DOUBLE PRECISION NOT NULL,
    "business_price" DOUBLE PRECISION NOT NULL,
    "first_class_price" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'SAR',
    "available_economy_seats" INTEGER NOT NULL,
    "available_business_seats" INTEGER NOT NULL,
    "available_first_class_seats" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "bookings" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "pnr" TEXT NOT NULL,
    "booking_ref" TEXT NOT NULL,
    "bookingType" "BookingType" NOT NULL DEFAULT 'INDIVIDUAL',
    "staff_pk" INTEGER,
    "staff_id" UUID,
    "agent_pk" INTEGER,
    "agent_id" UUID,
    "customer_pk" INTEGER,
    "customer_id" UUID,
    "issued_by_pk" INTEGER,
    "issued_by_id" UUID,
    "trip_pk" INTEGER NOT NULL,
    "trip_id" UUID NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "base_amount" DOUBLE PRECISION NOT NULL,
    "taxes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "booking_source" TEXT,
    "special_requests" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "group_bookings" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "group_ref" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "requested_by_pk" INTEGER NOT NULL,
    "requested_by_id" UUID NOT NULL,
    "trip_pk" INTEGER NOT NULL,
    "trip_id" UUID NOT NULL,
    "passenger_count" INTEGER NOT NULL,
    "requested_class" "TripClass" NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "discount_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "GroupBookingStatus" NOT NULL DEFAULT 'REQUESTED',
    "reviewed_by_pk" INTEGER,
    "reviewed_by_id" UUID,
    "approved_by_pk" INTEGER,
    "approved_by_id" UUID,
    "review_notes" TEXT,
    "approval_notes" TEXT,
    "travel_date" TIMESTAMP(3) NOT NULL,
    "request_deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_bookings_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "passengers" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "booking_pk" INTEGER NOT NULL,
    "booking_id" UUID NOT NULL,
    "title" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "nationality" TEXT NOT NULL,
    "passport_number" TEXT NOT NULL,
    "passport_expiry" TIMESTAMP(3) NOT NULL,
    "passport_country" TEXT NOT NULL,
    "visa_required" BOOLEAN NOT NULL DEFAULT false,
    "class" "TripClass" NOT NULL,
    "seat_number" TEXT,
    "seat_preference" TEXT,
    "meal_preference" TEXT,
    "special_requests" TEXT,
    "frequent_flyer_number" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passengers_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "agent_pk" INTEGER,
    "agent_id" UUID,
    "customer_pk" INTEGER,
    "customer_id" UUID,
    "booking_pk" INTEGER,
    "booking_id" UUID,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance_before" DOUBLE PRECISION NOT NULL,
    "balance_after" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT NOT NULL,
    "description" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'SAR',
    "payment_gateway_ref" TEXT,
    "bank_reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "notifications" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "staff_pk" INTEGER,
    "staff_id" UUID,
    "agent_pk" INTEGER,
    "agent_id" UUID,
    "customer_pk" INTEGER,
    "customer_id" UUID,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "reports" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "reportType" TEXT NOT NULL,
    "reportPeriod" TEXT NOT NULL,
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_refunds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "group_bookings" INTEGER NOT NULL DEFAULT 0,
    "agent_pk" INTEGER,
    "agent_id" UUID,
    "generated_by_pk" INTEGER,
    "generated_by_id" UUID,
    "report_data" JSONB,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "system_config" (
    "pk" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "data_type" TEXT NOT NULL DEFAULT 'STRING',
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_id_key" ON "api_keys"("id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_staff_pk_staff_id_key" ON "api_keys"("staff_pk", "staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_agent_pk_agent_id_key" ON "api_keys"("agent_pk", "agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_customer_pk_customer_id_key" ON "api_keys"("customer_pk", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_pk_id_key" ON "api_keys"("pk", "id");

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
CREATE UNIQUE INDEX "agents_id_key" ON "agents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "agents_agent_code_key" ON "agents"("agent_code");

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_key" ON "agents"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agents_phone_key" ON "agents"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "agents_pk_id_key" ON "agents"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_key" ON "customers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "customers_frequent_flyer_number_key" ON "customers"("frequent_flyer_number");

-- CreateIndex
CREATE UNIQUE INDEX "customers_pk_id_key" ON "customers"("pk", "id");

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
CREATE UNIQUE INDEX "agent_profiles_id_key" ON "agent_profiles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_profiles_agent_pk_key" ON "agent_profiles"("agent_pk");

-- CreateIndex
CREATE UNIQUE INDEX "agent_profiles_agent_id_key" ON "agent_profiles"("agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_profiles_pk_id_key" ON "agent_profiles"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_profiles_agent_pk_agent_id_key" ON "agent_profiles"("agent_pk", "agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_kyc_id_key" ON "agent_kyc"("id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_kyc_pk_id_key" ON "agent_kyc"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_kyc_agent_pk_agent_id_key" ON "agent_kyc"("agent_pk", "agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_id_key" ON "customer_profiles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_customer_pk_key" ON "customer_profiles"("customer_pk");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_customer_id_key" ON "customer_profiles"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_pk_id_key" ON "customer_profiles"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_customer_pk_customer_id_key" ON "customer_profiles"("customer_pk", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "aircraft_id_key" ON "aircraft"("id");

-- CreateIndex
CREATE UNIQUE INDEX "aircraft_registration_key" ON "aircraft"("registration");

-- CreateIndex
CREATE UNIQUE INDEX "aircraft_pk_id_key" ON "aircraft"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "airports_id_key" ON "airports"("id");

-- CreateIndex
CREATE UNIQUE INDEX "airports_code_key" ON "airports"("code");

-- CreateIndex
CREATE UNIQUE INDEX "airports_pk_id_key" ON "airports"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "trips_id_key" ON "trips"("id");

-- CreateIndex
CREATE UNIQUE INDEX "trips_flightNumber_key" ON "trips"("flightNumber");

-- CreateIndex
CREATE UNIQUE INDEX "trips_origin_pk_origin_id_key" ON "trips"("origin_pk", "origin_id");

-- CreateIndex
CREATE UNIQUE INDEX "trips_destination_pk_destination_id_key" ON "trips"("destination_pk", "destination_id");

-- CreateIndex
CREATE UNIQUE INDEX "trips_aircraft_pk_aircraft_id_key" ON "trips"("aircraft_pk", "aircraft_id");

-- CreateIndex
CREATE UNIQUE INDEX "trips_pk_id_key" ON "trips"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_id_key" ON "bookings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_pnr_key" ON "bookings"("pnr");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_ref_key" ON "bookings"("booking_ref");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_staff_pk_staff_id_key" ON "bookings"("staff_pk", "staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_agent_pk_agent_id_key" ON "bookings"("agent_pk", "agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_customer_pk_customer_id_key" ON "bookings"("customer_pk", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_issued_by_pk_issued_by_id_key" ON "bookings"("issued_by_pk", "issued_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_trip_pk_trip_id_key" ON "bookings"("trip_pk", "trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_pk_id_key" ON "bookings"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "group_bookings_id_key" ON "group_bookings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "group_bookings_group_ref_key" ON "group_bookings"("group_ref");

-- CreateIndex
CREATE UNIQUE INDEX "group_bookings_requested_by_pk_requested_by_id_key" ON "group_bookings"("requested_by_pk", "requested_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_bookings_trip_pk_trip_id_key" ON "group_bookings"("trip_pk", "trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_bookings_reviewed_by_pk_reviewed_by_id_key" ON "group_bookings"("reviewed_by_pk", "reviewed_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_bookings_approved_by_pk_approved_by_id_key" ON "group_bookings"("approved_by_pk", "approved_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_bookings_pk_id_key" ON "group_bookings"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "passengers_id_key" ON "passengers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "passengers_booking_pk_booking_id_key" ON "passengers"("booking_pk", "booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "passengers_pk_id_key" ON "passengers"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_id_key" ON "wallet_transactions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_reference_key" ON "wallet_transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_agent_pk_agent_id_key" ON "wallet_transactions"("agent_pk", "agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_customer_pk_customer_id_key" ON "wallet_transactions"("customer_pk", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_booking_pk_booking_id_key" ON "wallet_transactions"("booking_pk", "booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_pk_id_key" ON "wallet_transactions"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_id_key" ON "notifications"("id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_staff_pk_staff_id_key" ON "notifications"("staff_pk", "staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_agent_pk_agent_id_key" ON "notifications"("agent_pk", "agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_customer_pk_customer_id_key" ON "notifications"("customer_pk", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_pk_id_key" ON "notifications"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_id_key" ON "reports"("id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_agent_pk_agent_id_key" ON "reports"("agent_pk", "agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_generated_by_pk_generated_by_id_key" ON "reports"("generated_by_pk", "generated_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_pk_id_key" ON "reports"("pk", "id");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_id_key" ON "system_config"("id");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_pk_id_key" ON "system_config"("pk", "id");

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_staff_pk_staff_id_fkey" FOREIGN KEY ("staff_pk", "staff_id") REFERENCES "staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_agent_pk_agent_id_fkey" FOREIGN KEY ("agent_pk", "agent_id") REFERENCES "agents"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_customer_pk_customer_id_fkey" FOREIGN KEY ("customer_pk", "customer_id") REFERENCES "customers"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_manager_pk_manager_id_fkey" FOREIGN KEY ("manager_pk", "manager_id") REFERENCES "staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_staff_pk_staff_id_fkey" FOREIGN KEY ("staff_pk", "staff_id") REFERENCES "staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_profiles" ADD CONSTRAINT "agent_profiles_agent_pk_agent_id_fkey" FOREIGN KEY ("agent_pk", "agent_id") REFERENCES "agents"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_kyc" ADD CONSTRAINT "agent_kyc_agent_pk_agent_id_fkey" FOREIGN KEY ("agent_pk", "agent_id") REFERENCES "agents"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_customer_pk_customer_id_fkey" FOREIGN KEY ("customer_pk", "customer_id") REFERENCES "customers"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_origin_pk_origin_id_fkey" FOREIGN KEY ("origin_pk", "origin_id") REFERENCES "airports"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_destination_pk_destination_id_fkey" FOREIGN KEY ("destination_pk", "destination_id") REFERENCES "airports"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_aircraft_pk_aircraft_id_fkey" FOREIGN KEY ("aircraft_pk", "aircraft_id") REFERENCES "aircraft"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_staff_pk_staff_id_fkey" FOREIGN KEY ("staff_pk", "staff_id") REFERENCES "staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_agent_pk_agent_id_fkey" FOREIGN KEY ("agent_pk", "agent_id") REFERENCES "agents"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_pk_customer_id_fkey" FOREIGN KEY ("customer_pk", "customer_id") REFERENCES "customers"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_issued_by_pk_issued_by_id_fkey" FOREIGN KEY ("issued_by_pk", "issued_by_id") REFERENCES "staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_trip_pk_trip_id_fkey" FOREIGN KEY ("trip_pk", "trip_id") REFERENCES "trips"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_bookings" ADD CONSTRAINT "group_bookings_requested_by_pk_requested_by_id_fkey" FOREIGN KEY ("requested_by_pk", "requested_by_id") REFERENCES "agents"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_bookings" ADD CONSTRAINT "group_bookings_trip_pk_trip_id_fkey" FOREIGN KEY ("trip_pk", "trip_id") REFERENCES "trips"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_booking_pk_booking_id_fkey" FOREIGN KEY ("booking_pk", "booking_id") REFERENCES "bookings"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_agent_pk_agent_id_fkey" FOREIGN KEY ("agent_pk", "agent_id") REFERENCES "agents"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_customer_pk_customer_id_fkey" FOREIGN KEY ("customer_pk", "customer_id") REFERENCES "customers"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_booking_pk_booking_id_fkey" FOREIGN KEY ("booking_pk", "booking_id") REFERENCES "bookings"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_staff_pk_staff_id_fkey" FOREIGN KEY ("staff_pk", "staff_id") REFERENCES "staff"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_agent_pk_agent_id_fkey" FOREIGN KEY ("agent_pk", "agent_id") REFERENCES "agents"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_customer_pk_customer_id_fkey" FOREIGN KEY ("customer_pk", "customer_id") REFERENCES "customers"("pk", "id") ON DELETE CASCADE ON UPDATE CASCADE;
