ALTER TABLE "Survey"
    ADD COLUMN "definitionSource" JSONB,
    ADD COLUMN "draftStudentIds" JSONB,
    ADD CONSTRAINT "Survey_draftStudentIds_array" CHECK (
        "draftStudentIds" IS NULL OR jsonb_typeof("draftStudentIds") = 'array'
    );

ALTER TABLE "Question"
    ADD COLUMN "templateSource" JSONB,
    ADD COLUMN "metricVersion" TEXT,
    ADD CONSTRAINT "Question_metric_requires_rating" CHECK (
        "metricVersion" IS NULL OR (type = 'RATING' AND "templateSource" IS NOT NULL)
    );
