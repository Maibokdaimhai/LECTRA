ALTER TYPE "QuestionType" ADD VALUE 'SINGLE_CHOICE';

ALTER TABLE "Question" DROP CONSTRAINT "Question_rating_shape",
    ADD CONSTRAINT "Question_rating_shape" CHECK (
        (type::text IN ('TEXT', 'SINGLE_CHOICE') AND "ratingMin" IS NULL AND "ratingMax" IS NULL
         AND "ratingMinLabel" IS NULL AND "ratingMaxLabel" IS NULL AND "scaleInterpretation" IS NULL) OR
        (type::text = 'RATING' AND "ratingMin" IS NOT NULL AND "ratingMax" IS NOT NULL
         AND "ratingMin" = 1 AND "ratingMax" = 5 AND "ratingMinLabel" IS NOT NULL
         AND "ratingMaxLabel" IS NOT NULL AND "scaleInterpretation" IS NOT NULL)
    );

CREATE TABLE "QuestionOption" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "surveyId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    position INTEGER NOT NULL CHECK (position > 0),
    label VARCHAR(120) NOT NULL CHECK (length(btrim(label)) > 0),
    CONSTRAINT "QuestionOption_surveyId_questionId_fkey" FOREIGN KEY ("surveyId", "questionId")
      REFERENCES "Question"("surveyId", id) ON DELETE CASCADE ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX "QuestionOption_surveyId_questionId_id_key" ON "QuestionOption"("surveyId", "questionId", id);
CREATE UNIQUE INDEX "QuestionOption_questionId_position_key" ON "QuestionOption"("questionId", position);

ALTER TABLE "Answer" ADD COLUMN "optionId" UUID,
    DROP CONSTRAINT "Answer_one_typed_value",
    ADD CONSTRAINT "Answer_one_typed_value" CHECK (
        ("ratingValue" IS NOT NULL)::int + ("textValue" IS NOT NULL)::int + ("optionId" IS NOT NULL)::int = 1
    ),
    ADD CONSTRAINT "Answer_surveyId_questionId_optionId_fkey" FOREIGN KEY ("surveyId", "questionId", "optionId")
      REFERENCES "QuestionOption"("surveyId", "questionId", id) ON DELETE RESTRICT ON UPDATE RESTRICT;
