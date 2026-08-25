-- Drop the stray default added while migrating ArtisanProfile data --
-- schema.prisma's @updatedAt is Client-managed, not a DB default.
ALTER TABLE "ArtisanProfile" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Back the autoincrement id columns with real sequences (they were
-- missing one, so the app has always had to supply ids manually).
CREATE SEQUENCE clientprofile_id_seq;
ALTER TABLE "ClientProfile" ALTER COLUMN "id" SET DEFAULT nextval('clientprofile_id_seq');
ALTER SEQUENCE clientprofile_id_seq OWNED BY "ClientProfile"."id";

CREATE SEQUENCE message_id_seq;
ALTER TABLE "Message" ALTER COLUMN "id" SET DEFAULT nextval('message_id_seq');
ALTER SEQUENCE message_id_seq OWNED BY "Message"."id";

CREATE SEQUENCE messageconversation_id_seq;
ALTER TABLE "MessageConversation" ALTER COLUMN "id" SET DEFAULT nextval('messageconversation_id_seq');
ALTER SEQUENCE messageconversation_id_seq OWNED BY "MessageConversation"."id";
