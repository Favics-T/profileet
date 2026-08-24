-- CreateTable
CREATE TABLE "ArtisanPricing" (
    "id" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "startingPrice" INTEGER NOT NULL DEFAULT 0,
    "hourlyRate" INTEGER NOT NULL DEFAULT 0,
    "consultationFee" INTEGER NOT NULL DEFAULT 0,
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "minimumBudget" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtisanPricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtisanPricing_artisanId_key" ON "ArtisanPricing"("artisanId");

-- AddForeignKey
ALTER TABLE "ArtisanPricing"
ADD CONSTRAINT "ArtisanPricing_artisanId_fkey"
FOREIGN KEY ("artisanId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
