-- Convert Booking.receivedAt from TEXT to TIMESTAMP
-- Safe because this column is always set via new Date().toISOString() (valid ISO 8601)
ALTER TABLE "Booking" ALTER COLUMN "receivedAt" TYPE TIMESTAMP(3) USING "receivedAt"::TIMESTAMP(3);
ALTER TABLE "Booking" ALTER COLUMN "receivedAt" SET DEFAULT CURRENT_TIMESTAMP;