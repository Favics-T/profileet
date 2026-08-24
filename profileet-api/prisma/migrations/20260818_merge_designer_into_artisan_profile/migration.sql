-- ============================================================
-- MIGRATION: Merge DesignerProfile + Designer -> ArtisanProfile
-- ============================================================

-- 1. Rename DesignerStatus enum type -> ArtisanStatus
ALTER TYPE "DesignerStatus" RENAME TO "ArtisanStatus";

-- 2. Create ArtisanProfile table
CREATE TABLE "ArtisanProfile" (
    "id"                TEXT          NOT NULL,
    "artisanId"         TEXT          NOT NULL,
    "fullName"          TEXT          NOT NULL DEFAULT '',
    "initials"          TEXT          NOT NULL DEFAULT '',
    "color"             TEXT          NOT NULL DEFAULT '#422a15',
    "avatar"            TEXT,
    "specialty"         TEXT          NOT NULL DEFAULT '',
    "location"          TEXT          NOT NULL DEFAULT '',
    "bio"               TEXT          NOT NULL DEFAULT '',
    "phone"             TEXT          NOT NULL DEFAULT '',
    "yearsOfExperience" INTEGER       NOT NULL DEFAULT 0,
    "styles"            TEXT[]        NOT NULL DEFAULT ARRAY[]::TEXT[],
    "startingPrice"     INTEGER       NOT NULL DEFAULT 0,
    "available"         BOOLEAN       NOT NULL DEFAULT true,
    "status"            "ArtisanStatus" NOT NULL DEFAULT 'Pending',
    "joined"            TEXT          NOT NULL DEFAULT '',
    "createdAt"         TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArtisanProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ArtisanProfile_artisanId_key" ON "ArtisanProfile"("artisanId");

-- 3. Populate ArtisanProfile — artisans who have an Artisan record (with optional ArtisanProfile merge)
INSERT INTO "ArtisanProfile" (
    "id", "artisanId", "fullName", "initials", "color", "avatar",
    "specialty", "location", "bio", "phone", "yearsOfExperience",
    "styles", "startingPrice", "available", "status", "joined",
    "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::TEXT,
    d."userId",
    COALESCE(NULLIF(dp."fullName", ''), ''),
    COALESCE(NULLIF(d."initials", ''), ''),
    COALESCE(NULLIF(d."color", ''), '#422a15'),
    dp."avatar",
    COALESCE(NULLIF(COALESCE(dp."specialty", ''), ''), COALESCE(d."specialty", ''), ''),
    COALESCE(NULLIF(COALESCE(dp."location", ''), ''), COALESCE(d."location", ''), ''),
    COALESCE(NULLIF(COALESCE(dp."bio", ''), ''), COALESCE(d."bio", ''), ''),
    COALESCE(NULLIF(COALESCE(dp."phone", ''), ''), COALESCE(d."phone", ''), ''),
    COALESCE(dp."yearsOfExperience", d."yearsOfExperience", 0),
    COALESCE(d."styles", ARRAY[]::TEXT[]),
    COALESCE(d."startingPrice", 0),
    COALESCE(d."available", true),
    d."status",
    COALESCE(d."joined", ''),
    d."createdAt",
    d."updatedAt"
FROM "artisan" d
LEFT JOIN "ArtisanProfile" dp ON dp."artisanId" = d."userId";

-- 4. Populate ArtisanProfile — artisans with ArtisanProfile but NO artisan record
INSERT INTO "ArtisanProfile" (
    "id", "artisanId", "fullName", "avatar",
    "specialty", "location", "bio", "phone", "yearsOfExperience",
    "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::TEXT,
    dp."artisanId",
    COALESCE(dp."fullName", ''),
    dp."avatar",
    COALESCE(dp."specialty", ''),
    COALESCE(dp."location", ''),
    COALESCE(dp."bio", ''),
    COALESCE(dp."phone", ''),
    COALESCE(dp."yearsOfExperience", 0),
    dp."createdAt",
    dp."updatedAt"
FROM "ArtisanProfile" dp
WHERE dp."artisanId" NOT IN (SELECT "userId" FROM "artisan");

-- 5. Add FK on ArtisanProfile.artisanId → User.id
ALTER TABLE "ArtisanProfile"
    ADD CONSTRAINT "ArtisanProfile_artisanId_fkey"
    FOREIGN KEY ("artisanId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. Create ArtisanNote table
CREATE TABLE "ArtisanNote" (
    "id"               TEXT NOT NULL,
    "artisanProfileId" TEXT NOT NULL,
    "author"           TEXT NOT NULL,
    "role"             TEXT NOT NULL,
    "content"          TEXT NOT NULL,
    "createdAt"        TEXT NOT NULL,
    CONSTRAINT "ArtisanNote_pkey" PRIMARY KEY ("id")
);

-- 7. Migrate ArtisanNote → ArtisanNote
INSERT INTO "ArtisanNote" ("id", "artisanProfileId", "author", "role", "content", "createdAt")
SELECT
    dn."id",
    ap."id",
    dn."author",
    dn."role",
    dn."content",
    dn."createdAt"
FROM "ArtisanNote" dn
JOIN "artisan" d  ON d."id"       = dn."artisanId"
JOIN "ArtisanProfile" ap ON ap."artisanId" = d."userId";

-- 8. Add FK on ArtisanNote
ALTER TABLE "ArtisanNote"
    ADD CONSTRAINT "ArtisanNote_artisanProfileId_fkey"
    FOREIGN KEY ("artisanProfileId") REFERENCES "ArtisanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. Add artisanProfileId to MessageConversation and populate it
ALTER TABLE "MessageConversation" ADD COLUMN "artisanProfileId" TEXT;

UPDATE "MessageConversation" mc
SET "artisanProfileId" = ap."id"
FROM "artisan" d
JOIN "ArtisanProfile" ap ON ap."artisanId" = d."userId"
WHERE mc."directoryDesignerId" = d."id";

-- Handle orphaned conversations (safety net)
UPDATE "MessageConversation"
SET "artisanProfileId" = (SELECT "id" FROM "ArtisanProfile" LIMIT 1)
WHERE "artisanProfileId" IS NULL
  AND EXISTS (SELECT 1 FROM "ArtisanProfile" LIMIT 1);

ALTER TABLE "MessageConversation" ALTER COLUMN "artisanProfileId" SET NOT NULL;
ALTER TABLE "MessageConversation"
    ADD CONSTRAINT "MessageConversation_artisanProfileId_fkey"
    FOREIGN KEY ("artisanProfileId") REFERENCES "ArtisanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 10. Drop old directoryDesignerId FK + column
ALTER TABLE "MessageConversation" DROP CONSTRAINT IF EXISTS "MessageConversation_directoryDesignerId_fkey";
ALTER TABLE "MessageConversation" DROP COLUMN IF EXISTS "directoryDesignerId";

-- 11. Rename Role enum value artisan → artisan
ALTER TYPE "Role" RENAME VALUE 'artisan' TO 'artisan';

-- 12. Drop old tables (order: notes first, then parent tables)
DROP TABLE IF EXISTS "ArtisanNote";
DROP TABLE IF EXISTS "ArtisanProfile";
DROP TABLE IF EXISTS "artisan";


