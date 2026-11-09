BEGIN;
CREATE TYPE "Role" AS ENUM ('OWNER', 'RESPONDENT');
CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" VARCHAR(254) NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "displayName" VARCHAR(120) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "User_email_normalized" CHECK ("email" = lower(btrim("email")) AND char_length("email") > 0),
  CONSTRAINT "User_displayName_length" CHECK (char_length("displayName") BETWEEN 1 AND 120)
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
-- connect-pg-simple compatible; deliberately JSON and timestamp without time zone.
CREATE TABLE "auth_session" (
  "sid" VARCHAR NOT NULL,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "auth_session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX "auth_session_expire_idx" ON "auth_session"("expire");
COMMIT;
