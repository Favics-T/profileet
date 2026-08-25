-- ============================================================
-- MIGRATION: Merge Designer + DesignerProfile -> ArtisanProfile
-- (corrected — the version of this migration previously in this file
-- referenced tables/columns that don't exist, from a bad find/replace
-- of "Designer" -> "Artisan" done after the file was written, and its
-- final DROP TABLE statements targeted the new tables it had just
-- created. It was never successfully applied anywhere.)
-- ============================================================

-- 0. Add User.name (required by schema.prisma but missing from this
--    database — the baseline migration was marked applied without this
--    column ever actually being created here)
ALTER TABLE "User" ADD COLUMN "name" TEXT;

UPDATE "User" u
SET "name" = d."name"
FROM "Designer" d
WHERE LOWER(u."email") = LOWER(d."email")
  AND u."name" IS NULL;

UPDATE "User" u
SET "name" = TRIM(COALESCE(cp."firstName", '') || ' ' || COALESCE(cp."lastName", ''))
FROM "ClientProfile" cp
WHERE cp."clientId" = u."id"
  AND u."name" IS NULL
  AND TRIM(COALESCE(cp."firstName", '') || ' ' || COALESCE(cp."lastName", '')) != '';

-- anything left (dev/test accounts with no profile data) gets a placeholder from their email
UPDATE "User"
SET "name" = INITCAP(SPLIT_PART("email", '@', 1))
WHERE "name" IS NULL;

ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

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
    "available"         BOOLEAN       NOT NULL DEFAULT true,
    "status"            "ArtisanStatus" NOT NULL DEFAULT 'Pending',
    "joined"            TEXT          NOT NULL DEFAULT '',
    "createdAt"         TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArtisanProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ArtisanProfile_artisanId_key" ON "ArtisanProfile"("artisanId");

-- 3. Backfill User accounts for legacy Designer directory rows that were
--    never linked to a User (matches the seed-artisan-2..6 accounts already
--    documented in prisma/seed.js)
INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::TEXT,
    d."name",
    d."email",
    'seeded-artisan-password',
    'designer',
    d."createdAt",
    d."updatedAt"
FROM "Designer" d
WHERE NOT EXISTS (
    SELECT 1 FROM "User" u WHERE LOWER(u."email") = LOWER(d."email")
);

-- 4. Populate ArtisanProfile from Designer (+ DesignerProfile where present)
INSERT INTO "ArtisanProfile" (
    "id", "artisanId", "fullName", "initials", "color", "avatar",
    "specialty", "location", "bio", "phone", "yearsOfExperience",
    "styles", "available", "status", "joined",
    "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::TEXT,
    u."id",
    COALESCE(NULLIF(dp."fullName", ''), d."name", ''),
    COALESCE(NULLIF(d."initials", ''), ''),
    COALESCE(NULLIF(d."color", ''), '#422a15'),
    dp."avatar",
    COALESCE(NULLIF(COALESCE(dp."specialty", ''), ''), COALESCE(d."specialty", ''), ''),
    COALESCE(NULLIF(COALESCE(dp."location", ''), ''), COALESCE(d."location", ''), ''),
    COALESCE(NULLIF(COALESCE(dp."bio", ''), ''), COALESCE(d."bio", ''), ''),
    COALESCE(NULLIF(COALESCE(dp."phone", ''), ''), COALESCE(d."phone", ''), ''),
    COALESCE(dp."yearsOfExperience", d."yearsOfExperience", 0),
    COALESCE(d."styles", ARRAY[]::TEXT[]),
    COALESCE(d."available", true),
    d."status",
    COALESCE(d."joined", ''),
    d."createdAt",
    d."updatedAt"
FROM "Designer" d
JOIN "User" u ON LOWER(u."email") = LOWER(d."email")
LEFT JOIN "DesignerProfile" dp ON dp."designerId" = u."id";

-- 5. Populate ArtisanProfile for any DesignerProfile rows with no matching Designer row
INSERT INTO "ArtisanProfile" (
    "id", "artisanId", "fullName", "avatar",
    "specialty", "location", "bio", "phone", "yearsOfExperience",
    "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::TEXT,
    dp."designerId",
    COALESCE(dp."fullName", ''),
    dp."avatar",
    COALESCE(dp."specialty", ''),
    COALESCE(dp."location", ''),
    COALESCE(dp."bio", ''),
    COALESCE(dp."phone", ''),
    COALESCE(dp."yearsOfExperience", 0),
    dp."createdAt",
    dp."updatedAt"
FROM "DesignerProfile" dp
WHERE dp."designerId" NOT IN (SELECT "artisanId" FROM "ArtisanProfile");

-- 6. FK: ArtisanProfile.artisanId -> User.id
ALTER TABLE "ArtisanProfile"
    ADD CONSTRAINT "ArtisanProfile_artisanId_fkey"
    FOREIGN KEY ("artisanId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. Create ArtisanNote table
CREATE TABLE "ArtisanNote" (
    "id"               TEXT NOT NULL,
    "artisanProfileId" TEXT NOT NULL,
    "author"           TEXT NOT NULL,
    "role"             TEXT NOT NULL,
    "content"          TEXT NOT NULL,
    "createdAt"        TEXT NOT NULL,
    CONSTRAINT "ArtisanNote_pkey" PRIMARY KEY ("id")
);

-- 8. Migrate DesignerNote -> ArtisanNote
INSERT INTO "ArtisanNote" ("id", "artisanProfileId", "author", "role", "content", "createdAt")
SELECT
    dn."id",
    ap."id",
    dn."author",
    dn."role",
    dn."content",
    dn."createdAt"
FROM "DesignerNote" dn
JOIN "Designer" d ON d."id" = dn."designerId"
JOIN "User" u ON LOWER(u."email") = LOWER(d."email")
JOIN "ArtisanProfile" ap ON ap."artisanId" = u."id";

-- 9. FK: ArtisanNote.artisanProfileId -> ArtisanProfile.id
ALTER TABLE "ArtisanNote"
    ADD CONSTRAINT "ArtisanNote_artisanProfileId_fkey"
    FOREIGN KEY ("artisanProfileId") REFERENCES "ArtisanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 10. Rename MessageConversation's designer-era display column to its
--     artisan-era name, preserving the existing data
ALTER TABLE "MessageConversation" ADD COLUMN "artisanName" TEXT;
UPDATE "MessageConversation" SET "artisanName" = "designerName";
ALTER TABLE "MessageConversation" ALTER COLUMN "artisanName" SET NOT NULL;
ALTER TABLE "MessageConversation" DROP COLUMN "designerName";

-- 11. Add artisanProfileId to MessageConversation and populate it from the
--     legacy directoryDesignerId pointer
ALTER TABLE "MessageConversation" ADD COLUMN "artisanProfileId" TEXT;

UPDATE "MessageConversation" mc
SET "artisanProfileId" = ap."id"
FROM "Designer" d
JOIN "User" u ON LOWER(u."email") = LOWER(d."email")
JOIN "ArtisanProfile" ap ON ap."artisanId" = u."id"
WHERE mc."directoryDesignerId" = d."id";

-- Safety net for any conversation that somehow didn't match above
UPDATE "MessageConversation"
SET "artisanProfileId" = (SELECT "id" FROM "ArtisanProfile" LIMIT 1)
WHERE "artisanProfileId" IS NULL
  AND EXISTS (SELECT 1 FROM "ArtisanProfile" LIMIT 1);

ALTER TABLE "MessageConversation" ALTER COLUMN "artisanProfileId" SET NOT NULL;
ALTER TABLE "MessageConversation"
    ADD CONSTRAINT "MessageConversation_artisanProfileId_fkey"
    FOREIGN KEY ("artisanProfileId") REFERENCES "ArtisanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 12. Drop the old directoryDesignerId FK (really named "..._designerId_fkey",
--     confirmed by direct inspection) + column
ALTER TABLE "MessageConversation" DROP CONSTRAINT IF EXISTS "MessageConversation_designerId_fkey";
ALTER TABLE "MessageConversation" DROP COLUMN IF EXISTS "directoryDesignerId";

-- 13. Bring the still-current designerId->User FK's name in line with Prisma's
--     naming convention, now that the old same-named constraint above is gone
ALTER TABLE "MessageConversation" RENAME CONSTRAINT "MessageConversation_userDesignerId_fkey" TO "MessageConversation_designerId_fkey";

-- 14. Rename Role enum value designer -> artisan
ALTER TYPE "Role" RENAME VALUE 'designer' TO 'artisan';

-- 15. Drop the now-fully-migrated legacy tables
DROP TABLE IF EXISTS "DesignerNote";
DROP TABLE IF EXISTS "DesignerProfile";
DROP TABLE IF EXISTS "Designer";
