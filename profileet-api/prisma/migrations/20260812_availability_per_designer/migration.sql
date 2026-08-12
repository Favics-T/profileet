-- Make availability truly per-designer instead of date-global

-- Add a new primary key column for existing and future rows
ALTER TABLE "Availability" ADD COLUMN "id" TEXT;

-- Backfill existing rows with generated ids
UPDATE "Availability"
SET "id" = 'av_' || md5(random()::text || clock_timestamp()::text || "date" || "designerId")
WHERE "id" IS NULL;

-- Ensure new rows must always have an id
ALTER TABLE "Availability" ALTER COLUMN "id" SET NOT NULL;

-- Remove the old date primary key
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_pkey";

-- Promote the new id column to primary key
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_pkey" PRIMARY KEY ("id");

-- Enforce one availability row per designer per date
CREATE UNIQUE INDEX "Availability_designerId_date_key"
  ON "Availability" ("designerId", "date");
