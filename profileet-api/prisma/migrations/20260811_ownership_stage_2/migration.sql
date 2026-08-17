-- 7) Tighten required owner columns after backfill verification
ALTER TABLE "DesignerProfile" ALTER COLUMN "designerId" SET NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "designerId" SET NOT NULL;
ALTER TABLE "Inquiry" ALTER COLUMN "designerId" SET NOT NULL;
ALTER TABLE "Availability" ALTER COLUMN "designerId" SET NOT NULL;
ALTER TABLE "PortfolioItem" ALTER COLUMN "designerId" SET NOT NULL;
ALTER TABLE "Review" ALTER COLUMN "designerId" SET NOT NULL;
ALTER TABLE "MessageConversation" ALTER COLUMN "designerId" SET NOT NULL;
ALTER TABLE "ClientProfile" ALTER COLUMN "clientId" SET NOT NULL;

-- Add unique constraints only after the backfill has cleared all NULLs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DesignerProfile_designerId_key'
  ) THEN
    ALTER TABLE "DesignerProfile"
      ADD CONSTRAINT "DesignerProfile_designerId_key" UNIQUE ("designerId");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ClientProfile_clientId_key'
  ) THEN
    ALTER TABLE "ClientProfile"
      ADD CONSTRAINT "ClientProfile_clientId_key" UNIQUE ("clientId");
  END IF;
END $$;
