/*
  Warnings:

  - You are about to drop the column `flightNumber` on the `trips` table. All the data in the column will be lost.
  - Added the required column `destination_code` to the `trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flight_number` to the `trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin_code` to the `trips` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "group_bookings_approved_by_pk_approved_by_id_key";

-- DropIndex
DROP INDEX "group_bookings_requested_by_pk_requested_by_id_key";

-- DropIndex
DROP INDEX "group_bookings_reviewed_by_pk_reviewed_by_id_key";

-- DropIndex
DROP INDEX "group_bookings_trip_pk_trip_id_key";

-- DropIndex
DROP INDEX "trips_flightNumber_key";

-- AlterTable
ALTER TABLE "group_bookings" ADD COLUMN     "application_letter_url" TEXT;

-- AlterTable
ALTER TABLE "trips" DROP COLUMN "flightNumber",
ADD COLUMN     "destination_code" TEXT NOT NULL,
ADD COLUMN     "flight_number" TEXT NOT NULL,
ADD COLUMN     "origin_code" TEXT NOT NULL,
ALTER COLUMN "arrival_date" DROP NOT NULL;
