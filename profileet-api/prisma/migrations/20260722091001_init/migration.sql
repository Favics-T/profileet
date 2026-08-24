-- CreateTable
CREATE TABLE "DesignerProfile" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL DEFAULT '',
    "specialty" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "yearsOfExperience" INTEGER NOT NULL DEFAULT 0,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "clientColor" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL DEFAULT '',
    "service" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "deliveryDate" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "receivedAt" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "depositAmount" DOUBLE PRECISION NOT NULL,
    "designNotes" TEXT NOT NULL DEFAULT '',
    "fabrics" TEXT[],
    "colors" TEXT[],
    "inspirationRef" TEXT NOT NULL DEFAULT '',
    "measurements" JSONB NOT NULL DEFAULT '{}',
    "consultation" JSONB NOT NULL DEFAULT '{"requested":false,"status":"none"}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'designer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
