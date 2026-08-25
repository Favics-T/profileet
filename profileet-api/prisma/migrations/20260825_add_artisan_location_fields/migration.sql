-- AddColumn
ALTER TABLE "ArtisanProfile" ADD COLUMN "city" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ArtisanProfile" ADD COLUMN "state" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ArtisanProfile" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'Nigeria';

-- CreateIndex
CREATE INDEX "ArtisanProfile_city_idx" ON "ArtisanProfile"("city");
CREATE INDEX "ArtisanProfile_state_idx" ON "ArtisanProfile"("state");
