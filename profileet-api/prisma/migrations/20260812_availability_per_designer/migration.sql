-- Make availability truly per-designer instead of date-global

-- Add a new primary key column for existing and future rows
ALTER TABLE "Availability" ADD COLUMN IF NOT EXISTS "id" TEXT;

-- Backfill existing rows with generated ids
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Availability'
      AND column_name = 'id'
  ) THEN
    UPDATE "Availability"
    SET "id" = COALESCE(
      "id",
      'av_' || md5(random()::text || clock_timestamp()::text || "date" || COALESCE("designerId", ''))
    )
    WHERE "id" IS NULL;
  END IF;
END $$;

-- Ensure new rows must always have an id
ALTER TABLE "Availability" ALTER COLUMN "id" SET NOT NULL;

-- Remove the old date primary key
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_pkey";

-- Promote the new id column to primary key
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_pkey" PRIMARY KEY ("id");

-- Enforce one availability row per designer per date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'Availability'
      AND indexname = 'Availability_designerId_date_key'
  ) THEN
    CREATE UNIQUE INDEX "Availability_designerId_date_key"
      ON "Availability" ("designerId", "date");
  END IF;
END $$;
