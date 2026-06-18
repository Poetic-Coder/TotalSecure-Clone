-- CreateEnum
CREATE TYPE "AgentSetupStage" AS ENUM ('OTP_VERIFICATION', 'BVN_VERIFICATION', 'FACE_VERIFICATION', 'PIN_SETUP', 'PROFILE_SETUP', 'OWNER_ID_VERIFICATION', 'AGENT_ID_VERIFICATION', 'COMPLETED');

-- AlterTable
ALTER TABLE "agent_kyc" ADD COLUMN     "iataIdRawData" JSONB,
ADD COLUMN     "iata_image_url" TEXT,
ADD COLUMN     "iata_verified" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
ADD COLUMN     "nantaRawData" JSONB,
ADD COLUMN     "nanta_image_url" TEXT,
ADD COLUMN     "nanta_verified" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
ADD COLUMN     "ncaaIdRawData" JSONB,
ADD COLUMN     "ncaa_image_url" TEXT,
ADD COLUMN     "ncaa_verified" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
ADD COLUMN     "reg_stage" "AgentSetupStage" NOT NULL DEFAULT 'OTP_VERIFICATION';
