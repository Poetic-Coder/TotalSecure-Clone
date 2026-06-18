-- DropIndex
DROP INDEX "trips_aircraft_pk_aircraft_id_key";

-- DropIndex
DROP INDEX "trips_destination_pk_destination_id_key";

-- DropIndex
DROP INDEX "trips_origin_pk_origin_id_key";

-- AlterTable
ALTER TABLE "group_bookings" ALTER COLUMN "request_deadline" DROP NOT NULL;

-- AlterTable
ALTER TABLE "trips" ALTER COLUMN "origin_pk" DROP NOT NULL,
ALTER COLUMN "origin_id" DROP NOT NULL,
ALTER COLUMN "destination_pk" DROP NOT NULL,
ALTER COLUMN "destination_id" DROP NOT NULL,
ALTER COLUMN "aircraft_pk" DROP NOT NULL,
ALTER COLUMN "aircraft_id" DROP NOT NULL,
ALTER COLUMN "economy_price" DROP NOT NULL,
ALTER COLUMN "business_price" DROP NOT NULL,
ALTER COLUMN "first_class_price" DROP NOT NULL,
ALTER COLUMN "available_economy_seats" DROP NOT NULL,
ALTER COLUMN "available_business_seats" DROP NOT NULL,
ALTER COLUMN "available_first_class_seats" DROP NOT NULL;
