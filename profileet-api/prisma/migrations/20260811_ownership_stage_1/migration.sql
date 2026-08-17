-- 1) Rename the existing public-directory ownership link on conversations
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MessageConversation'
      AND column_name = 'designerId'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MessageConversation'
      AND column_name = 'directoryDesignerId'
  ) THEN
    EXECUTE 'ALTER TABLE "MessageConversation" RENAME COLUMN "designerId" TO "directoryDesignerId"';
  END IF;
END $$;

-- 2) Add new nullable ownership columns
ALTER TABLE "DesignerProfile" ADD COLUMN IF NOT EXISTS "designerId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "designerId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "clientId" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "designerId" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "clientId" TEXT;
ALTER TABLE "Availability" ADD COLUMN IF NOT EXISTS "designerId" TEXT;
ALTER TABLE "PortfolioItem" ADD COLUMN IF NOT EXISTS "designerId" TEXT;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "designerId" TEXT;
ALTER TABLE "MessageConversation" ADD COLUMN IF NOT EXISTS "designerId" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "clientId" TEXT;

-- 3) Add FK constraints to the nullable ownership columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DesignerProfile_designerId_fkey'
  ) THEN
    ALTER TABLE "DesignerProfile"
      ADD CONSTRAINT "DesignerProfile_designerId_fkey"
      FOREIGN KEY ("designerId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Booking_designerId_fkey'
  ) THEN
    ALTER TABLE "Booking"
      ADD CONSTRAINT "Booking_designerId_fkey"
      FOREIGN KEY ("designerId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Booking_clientId_fkey'
  ) THEN
    ALTER TABLE "Booking"
      ADD CONSTRAINT "Booking_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Inquiry_designerId_fkey'
  ) THEN
    ALTER TABLE "Inquiry"
      ADD CONSTRAINT "Inquiry_designerId_fkey"
      FOREIGN KEY ("designerId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Inquiry_clientId_fkey'
  ) THEN
    ALTER TABLE "Inquiry"
      ADD CONSTRAINT "Inquiry_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Availability_designerId_fkey'
  ) THEN
    ALTER TABLE "Availability"
      ADD CONSTRAINT "Availability_designerId_fkey"
      FOREIGN KEY ("designerId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PortfolioItem_designerId_fkey'
  ) THEN
    ALTER TABLE "PortfolioItem"
      ADD CONSTRAINT "PortfolioItem_designerId_fkey"
      FOREIGN KEY ("designerId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Review_designerId_fkey'
  ) THEN
    ALTER TABLE "Review"
      ADD CONSTRAINT "Review_designerId_fkey"
      FOREIGN KEY ("designerId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'MessageConversation_userDesignerId_fkey'
  ) THEN
    ALTER TABLE "MessageConversation"
      ADD CONSTRAINT "MessageConversation_userDesignerId_fkey"
      FOREIGN KEY ("designerId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ClientProfile_clientId_fkey'
  ) THEN
    ALTER TABLE "ClientProfile"
      ADD CONSTRAINT "ClientProfile_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
