-- Restore database-side autoincrement for DesignerProfile.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relkind = 'S'
      AND relname = 'DesignerProfile_id_seq'
  ) THEN
    CREATE SEQUENCE "DesignerProfile_id_seq";
  END IF;
END $$;

ALTER TABLE "DesignerProfile"
  ALTER COLUMN "id" SET DEFAULT nextval('"DesignerProfile_id_seq"'::regclass);

ALTER SEQUENCE "DesignerProfile_id_seq"
  OWNED BY "DesignerProfile"."id";

SELECT setval(
  '"DesignerProfile_id_seq"',
  COALESCE((SELECT MAX("id") FROM "DesignerProfile"), 0) + 1,
  false
);
