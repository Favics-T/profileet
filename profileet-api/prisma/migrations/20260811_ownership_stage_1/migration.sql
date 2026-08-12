-- 1) Rename the existing public-directory ownership link on conversations
ALTER TABLE "MessageConversation"
RENAME COLUMN "designerId" TO "directoryDesignerId";

-- 2) Add new nullable ownership columns
ALTER TABLE "DesignerProfile" ADD COLUMN "designerId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "designerId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "clientId" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "designerId" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "clientId" TEXT;
ALTER TABLE "Availability" ADD COLUMN "designerId" TEXT;
ALTER TABLE "PortfolioItem" ADD COLUMN "designerId" TEXT;
ALTER TABLE "Review" ADD COLUMN "designerId" TEXT;
ALTER TABLE "MessageConversation" ADD COLUMN "designerId" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN "clientId" TEXT;

-- 3) Add FK constraints to the nullable ownership columns
ALTER TABLE "DesignerProfile"
  ADD CONSTRAINT "DesignerProfile_designerId_fkey"
  FOREIGN KEY ("designerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_designerId_fkey"
  FOREIGN KEY ("designerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Inquiry"
  ADD CONSTRAINT "Inquiry_designerId_fkey"
  FOREIGN KEY ("designerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Inquiry"
  ADD CONSTRAINT "Inquiry_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Availability"
  ADD CONSTRAINT "Availability_designerId_fkey"
  FOREIGN KEY ("designerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PortfolioItem"
  ADD CONSTRAINT "PortfolioItem_designerId_fkey"
  FOREIGN KEY ("designerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_designerId_fkey"
  FOREIGN KEY ("designerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MessageConversation"
  ADD CONSTRAINT "MessageConversation_userDesignerId_fkey"
  FOREIGN KEY ("designerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClientProfile"
  ADD CONSTRAINT "ClientProfile_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
