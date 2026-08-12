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
ALTER TABLE "DesignerProfile"
  ADD CONSTRAINT "DesignerProfile_designerId_key" UNIQUE ("designerId");

ALTER TABLE "ClientProfile"
  ADD CONSTRAINT "ClientProfile_clientId_key" UNIQUE ("clientId");
