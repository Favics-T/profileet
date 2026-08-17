-- Create PostgreSQL enum types (with all values present in live data)
CREATE TYPE "Role" AS ENUM ('client', 'designer', 'admin');
CREATE TYPE "DesignerStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'Verified', 'Active');

-- User.role: drop default, cast column, restore default
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING "role"::"Role";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'designer'::"Role";

-- Designer.status: drop default, cast column, restore default
ALTER TABLE "Designer" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Designer" ALTER COLUMN "status" TYPE "DesignerStatus" USING "status"::"DesignerStatus";
ALTER TABLE "Designer" ALTER COLUMN "status" SET DEFAULT 'Pending'::"DesignerStatus";