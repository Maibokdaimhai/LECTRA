BEGIN;
CREATE TYPE "SurveyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
CREATE TYPE "SurveyMode" AS ENUM ('IDENTIFIED');
CREATE TYPE "QuestionType" AS ENUM ('RATING', 'TEXT');
CREATE TABLE "Survey" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "lectureId" UUID NOT NULL, "ownerId" UUID NOT NULL,
  "title" VARCHAR(120) NOT NULL DEFAULT '', "status" "SurveyStatus" NOT NULL DEFAULT 'DRAFT',
  "mode" "SurveyMode" NOT NULL DEFAULT 'IDENTIFIED', "definitionRevision" INTEGER NOT NULL DEFAULT 1,
  "publishedAt" TIMESTAMPTZ(3), "closedAt" TIMESTAMPTZ(3),
  CONSTRAINT "Survey_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Survey_revision_positive" CHECK ("definitionRevision" > 0),
  CONSTRAINT "Survey_state_timestamps" CHECK (
    ("status" = 'DRAFT' AND "publishedAt" IS NULL AND "closedAt" IS NULL) OR
    ("status" = 'PUBLISHED' AND "publishedAt" IS NOT NULL AND "closedAt" IS NULL) OR
    ("status" = 'CLOSED' AND "publishedAt" IS NOT NULL AND "closedAt" IS NOT NULL)),
  CONSTRAINT "Survey_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "Survey_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX "Survey_lectureId_key" ON "Survey"("lectureId");
CREATE INDEX "Survey_status_idx" ON "Survey"("status");
CREATE TABLE "Question" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "surveyId" UUID NOT NULL, "position" INTEGER NOT NULL,
  "prompt" VARCHAR(500) NOT NULL, "type" "QuestionType" NOT NULL, "required" BOOLEAN NOT NULL,
  "ratingMin" INTEGER, "ratingMax" INTEGER, "ratingMinLabel" VARCHAR(120), "ratingMaxLabel" VARCHAR(120), "scaleInterpretation" VARCHAR(500),
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Question_position_positive" CHECK ("position" > 0),
  CONSTRAINT "Question_rating_shape" CHECK (
    ("type" = 'TEXT' AND "ratingMin" IS NULL AND "ratingMax" IS NULL AND "ratingMinLabel" IS NULL AND "ratingMaxLabel" IS NULL AND "scaleInterpretation" IS NULL) OR
    ("type" = 'RATING' AND "ratingMin" IS NOT NULL AND "ratingMax" IS NOT NULL AND "ratingMin" = 1 AND "ratingMax" = 5 AND "ratingMinLabel" IS NOT NULL AND "ratingMaxLabel" IS NOT NULL AND "scaleInterpretation" IS NOT NULL)),
  CONSTRAINT "Question_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX "Question_surveyId_position_key" ON "Question"("surveyId", "position");
CREATE UNIQUE INDEX "Question_surveyId_id_key" ON "Question"("surveyId", "id");
CREATE TABLE "SurveyEligibility" (
  "surveyId" UUID NOT NULL, "studentId" UUID NOT NULL,
  CONSTRAINT "SurveyEligibility_pkey" PRIMARY KEY ("surveyId", "studentId"),
  CONSTRAINT "SurveyEligibility_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "SurveyEligibility_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX "SurveyEligibility_studentId_surveyId_idx" ON "SurveyEligibility"("studentId", "surveyId");
CREATE TABLE "Participation" (
  "surveyId" UUID NOT NULL, "studentId" UUID NOT NULL,
  CONSTRAINT "Participation_pkey" PRIMARY KEY ("surveyId", "studentId"),
  CONSTRAINT "Participation_surveyId_studentId_fkey" FOREIGN KEY ("surveyId", "studentId") REFERENCES "SurveyEligibility"("surveyId", "studentId") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE TABLE "ResponseBundle" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "surveyId" UUID NOT NULL, "identifiedStudentId" UUID,
  CONSTRAINT "ResponseBundle_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ResponseBundle_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "ResponseBundle_surveyId_identifiedStudentId_fkey" FOREIGN KEY ("surveyId", "identifiedStudentId") REFERENCES "SurveyEligibility"("surveyId", "studentId") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX "ResponseBundle_surveyId_identifiedStudentId_key" ON "ResponseBundle"("surveyId", "identifiedStudentId");
CREATE UNIQUE INDEX "ResponseBundle_surveyId_id_key" ON "ResponseBundle"("surveyId", "id");
CREATE TABLE "Answer" (
  "bundleId" UUID NOT NULL, "questionId" UUID NOT NULL, "surveyId" UUID NOT NULL, "ratingValue" INTEGER, "textValue" TEXT,
  CONSTRAINT "Answer_pkey" PRIMARY KEY ("bundleId", "questionId"),
  CONSTRAINT "Answer_one_typed_value" CHECK (("ratingValue" IS NOT NULL)::integer + ("textValue" IS NOT NULL)::integer = 1),
  CONSTRAINT "Answer_rating_range" CHECK ("ratingValue" IS NULL OR "ratingValue" BETWEEN 1 AND 5),
  CONSTRAINT "Answer_text_length" CHECK ("textValue" IS NULL OR char_length("textValue") <= 2000),
  CONSTRAINT "Answer_surveyId_bundleId_fkey" FOREIGN KEY ("surveyId", "bundleId") REFERENCES "ResponseBundle"("surveyId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "Answer_surveyId_questionId_fkey" FOREIGN KEY ("surveyId", "questionId") REFERENCES "Question"("surveyId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX "Answer_surveyId_questionId_idx" ON "Answer"("surveyId", "questionId");
COMMIT;
