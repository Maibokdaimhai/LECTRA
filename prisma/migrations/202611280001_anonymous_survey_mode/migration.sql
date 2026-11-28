ALTER TYPE "SurveyMode" ADD VALUE 'ANONYMOUS';

-- Check the owning survey before any protected storage row is written.
CREATE FUNCTION check_feedback_storage_mode() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE survey_mode text;
BEGIN
    SELECT mode::text INTO survey_mode
    FROM "Survey" WHERE id = NEW."surveyId" FOR SHARE;
    IF TG_TABLE_NAME = 'ResponseBundle' THEN
        IF (survey_mode = 'ANONYMOUS' AND NEW."identifiedStudentId" IS NOT NULL)
            OR (survey_mode = 'IDENTIFIED' AND NEW."identifiedStudentId" IS NULL) THEN
            RAISE check_violation USING MESSAGE = 'Response bundle identity is inconsistent with survey mode';
        END IF;
    ELSIF survey_mode = 'ANONYMOUS' AND NEW."textValue" IS NOT NULL THEN
        RAISE check_violation USING MESSAGE = 'Anonymous answers may not contain text';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "ResponseBundle_mode_guard"
BEFORE INSERT OR UPDATE OF "surveyId", "identifiedStudentId" ON "ResponseBundle"
FOR EACH ROW EXECUTE FUNCTION check_feedback_storage_mode();

CREATE TRIGGER "Answer_mode_guard"
BEFORE INSERT OR UPDATE OF "surveyId", "textValue" ON "Answer"
FOR EACH ROW EXECUTE FUNCTION check_feedback_storage_mode();

CREATE FUNCTION check_frozen_survey_mode() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.status <> 'DRAFT'
        AND OLD.mode::text IN ('IDENTIFIED', 'ANONYMOUS')
        AND NEW.mode::text IN ('IDENTIFIED', 'ANONYMOUS')
        AND NEW.mode <> OLD.mode THEN
        RAISE check_violation USING MESSAGE = 'Published survey mode is frozen';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "Survey_frozen_mode_guard"
BEFORE UPDATE OF mode ON "Survey"
FOR EACH ROW EXECUTE FUNCTION check_frozen_survey_mode();
