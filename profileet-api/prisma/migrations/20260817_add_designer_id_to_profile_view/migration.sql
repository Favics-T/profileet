-- Add designerId to ProfileView so each view is scoped to a specific designer
ALTER TABLE "ProfileView" ADD COLUMN "designerId" TEXT NOT NULL DEFAULT '';

-- Remove the temporary default (all existing rows get empty string, which is fine for existing data)
ALTER TABLE "ProfileView" ALTER COLUMN "designerId" DROP DEFAULT;

-- Add foreign key constraint
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_designerId_fkey"
  FOREIGN KEY ("designerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;