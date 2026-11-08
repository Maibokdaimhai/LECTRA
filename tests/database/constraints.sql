-- Supplemental storage checks only. Run exclusively on an opted-in disposable DB
-- after the real migrations. Everything below, including temporary helpers, rolls back.
BEGIN;
CREATE TEMP TABLE issue16_checks(label text) ON COMMIT DROP;
CREATE FUNCTION pg_temp.expect_failure(command text, expected_state text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    EXECUTE command;
  EXCEPTION WHEN OTHERS THEN
    IF SQLSTATE = ANY(string_to_array(expected_state, '|')) THEN RETURN; END IF;
    RAISE EXCEPTION 'Unexpected SQLSTATE %, expected %', SQLSTATE, expected_state;
  END;
  RAISE EXCEPTION 'Expected SQLSTATE % but command succeeded', expected_state;
END $$;

-- These hashes are deliberately NOT authentication fixtures: only storage is tested.
INSERT INTO "User" ("id","email","passwordHash","role","displayName") VALUES
 ('16990000-0000-4000-8000-000000000001','storage.owner.a@example.test','not-an-auth-fixture','OWNER','Storage A'),
 ('16990000-0000-4000-8000-000000000002','storage.owner.b@example.test','not-an-auth-fixture','OWNER','Storage B'),
 ('16990000-0000-4000-8000-000000000011','storage.student@example.test','not-an-auth-fixture','RESPONDENT','Storage R');
SELECT pg_temp.expect_failure($q$INSERT INTO "User" ("email","passwordHash","role","displayName") VALUES ('UPPER@example.test','x','OWNER','X')$q$, '23514');
SELECT pg_temp.expect_failure($q$INSERT INTO "User" ("email","passwordHash","role","displayName") VALUES ('storage.owner.a@example.test','x','OWNER','X')$q$, '23505');
INSERT INTO issue16_checks VALUES ('normalized unique users');

INSERT INTO "Course" ("id","code","title") VALUES ('16990000-0000-4000-8000-000000000101','STORAGE-16','Storage course');
INSERT INTO "Section" ("id","courseId","term","sectionCode","ownerId") VALUES
 ('16990000-0000-4000-8000-000000000201','16990000-0000-4000-8000-000000000101','Test','A','16990000-0000-4000-8000-000000000001'),
 ('16990000-0000-4000-8000-000000000202','16990000-0000-4000-8000-000000000101','Test','B','16990000-0000-4000-8000-000000000002');
DO $$ BEGIN
 IF (SELECT count(DISTINCT "ownerId") FROM "Section" WHERE "courseId"='16990000-0000-4000-8000-000000000101') <> 2 THEN RAISE EXCEPTION 'Invalid same-course ownership fixture'; END IF;
END $$;
SELECT pg_temp.expect_failure($q$INSERT INTO "Membership" VALUES ('16990000-0000-4000-8000-000000000299','16990000-0000-4000-8000-000000000011')$q$, '23503');
INSERT INTO "Membership" VALUES ('16990000-0000-4000-8000-000000000201','16990000-0000-4000-8000-000000000011');
SELECT pg_temp.expect_failure($q$INSERT INTO "Membership" VALUES ('16990000-0000-4000-8000-000000000201','16990000-0000-4000-8000-000000000011')$q$, '23505');
INSERT INTO issue16_checks VALUES ('context ownership and membership FK/uniqueness');

INSERT INTO "Lecture" ("id","sectionId","title","lectureDate","sequence") VALUES
 ('16990000-0000-4000-8000-000000000301','16990000-0000-4000-8000-000000000201','A','2026-11-08',1),
 ('16990000-0000-4000-8000-000000000302','16990000-0000-4000-8000-000000000202','B','2026-11-08',1);
SELECT pg_temp.expect_failure($q$INSERT INTO "Lecture" ("sectionId","title","lectureDate","sequence") VALUES ('16990000-0000-4000-8000-000000000201','Duplicate','2026-11-08',1)$q$, '23505');
INSERT INTO "Survey" ("id","lectureId","ownerId") VALUES
 ('16990000-0000-4000-8000-000000000401','16990000-0000-4000-8000-000000000301','16990000-0000-4000-8000-000000000001'),
 ('16990000-0000-4000-8000-000000000402','16990000-0000-4000-8000-000000000302','16990000-0000-4000-8000-000000000002');
SELECT pg_temp.expect_failure($q$INSERT INTO "Survey" ("lectureId","ownerId") VALUES ('16990000-0000-4000-8000-000000000301','16990000-0000-4000-8000-000000000001')$q$, '23505');
SELECT pg_temp.expect_failure($q$UPDATE "Survey" SET "status"='PUBLISHED' WHERE "id"='16990000-0000-4000-8000-000000000401'$q$, '23514');
SELECT pg_temp.expect_failure($q$UPDATE "Survey" SET "definitionRevision"=0 WHERE "id"='16990000-0000-4000-8000-000000000401'$q$, '23514');
INSERT INTO issue16_checks VALUES ('lecture/survey uniqueness and local lifecycle fields');

INSERT INTO "Question" ("id","surveyId","position","prompt","type","required","ratingMin","ratingMax","ratingMinLabel","ratingMaxLabel","scaleInterpretation") VALUES
 ('16990000-0000-4000-8000-000000000501','16990000-0000-4000-8000-000000000401',1,'','RATING',true,1,5,'','',''),
 ('16990000-0000-4000-8000-000000000502','16990000-0000-4000-8000-000000000402',1,'','RATING',true,1,5,'','','');
INSERT INTO "Question" ("id","surveyId","position","prompt","type","required") VALUES
 ('16990000-0000-4000-8000-000000000503','16990000-0000-4000-8000-000000000401',2,'Suggestions','TEXT',false);
SELECT pg_temp.expect_failure($q$UPDATE "Question" SET "ratingMax"=6 WHERE "id"='16990000-0000-4000-8000-000000000501'$q$, '23514');
SELECT pg_temp.expect_failure($q$UPDATE "Question" SET "ratingMin"=NULL WHERE "id"='16990000-0000-4000-8000-000000000501'$q$, '23514');
UPDATE "Question" SET "position"="position"+10 WHERE "surveyId"='16990000-0000-4000-8000-000000000401';
UPDATE "Question" SET "position"=CASE "position" WHEN 11 THEN 2 ELSE 1 END WHERE "surveyId"='16990000-0000-4000-8000-000000000401';
INSERT INTO issue16_checks VALUES ('Draft blanks, explicit scale and atomic reorder staging');

UPDATE "Survey" SET "title"='Storage fixture',"status"='PUBLISHED',"publishedAt"=now() WHERE "id" IN ('16990000-0000-4000-8000-000000000401','16990000-0000-4000-8000-000000000402');
INSERT INTO "SurveyEligibility" VALUES
 ('16990000-0000-4000-8000-000000000401','16990000-0000-4000-8000-000000000011'),
 ('16990000-0000-4000-8000-000000000402','16990000-0000-4000-8000-000000000011');
SELECT pg_temp.expect_failure($q$INSERT INTO "SurveyEligibility" VALUES ('16990000-0000-4000-8000-000000000401','16990000-0000-4000-8000-000000000011')$q$, '23505');
DELETE FROM "Membership" WHERE "sectionId"='16990000-0000-4000-8000-000000000201';
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM "SurveyEligibility" WHERE "surveyId"='16990000-0000-4000-8000-000000000401') THEN RAISE EXCEPTION 'Membership removal revoked eligibility'; END IF;
END $$;
SELECT pg_temp.expect_failure($q$INSERT INTO "Participation" VALUES ('16990000-0000-4000-8000-000000000401','16990000-0000-4000-8000-000000000001')$q$, '23503');
INSERT INTO "Participation" VALUES ('16990000-0000-4000-8000-000000000401','16990000-0000-4000-8000-000000000011');
SELECT pg_temp.expect_failure($q$INSERT INTO "Participation" VALUES ('16990000-0000-4000-8000-000000000401','16990000-0000-4000-8000-000000000011')$q$, '23505');
INSERT INTO "ResponseBundle" ("id","surveyId","identifiedStudentId") VALUES
 ('16990000-0000-4000-8000-000000000601','16990000-0000-4000-8000-000000000401','16990000-0000-4000-8000-000000000011');
SELECT pg_temp.expect_failure($q$INSERT INTO "ResponseBundle" ("surveyId","identifiedStudentId") VALUES ('16990000-0000-4000-8000-000000000401','16990000-0000-4000-8000-000000000011')$q$, '23505');
INSERT INTO issue16_checks VALUES ('frozen eligibility and unique eligible participation/bundle');

SELECT pg_temp.expect_failure($q$INSERT INTO "Answer" VALUES ('16990000-0000-4000-8000-000000000601','16990000-0000-4000-8000-000000000502','16990000-0000-4000-8000-000000000401',3,NULL)$q$, '23503');
SELECT pg_temp.expect_failure($q$INSERT INTO "Answer" VALUES ('16990000-0000-4000-8000-000000000601','16990000-0000-4000-8000-000000000501','16990000-0000-4000-8000-000000000402',3,NULL)$q$, '23503');
SELECT pg_temp.expect_failure($q$INSERT INTO "Answer" VALUES ('16990000-0000-4000-8000-000000000601','16990000-0000-4000-8000-000000000501','16990000-0000-4000-8000-000000000401',0,NULL)$q$, '23514');
SELECT pg_temp.expect_failure($q$INSERT INTO "Answer" VALUES ('16990000-0000-4000-8000-000000000601','16990000-0000-4000-8000-000000000501','16990000-0000-4000-8000-000000000401',6,NULL)$q$, '23514');
SELECT pg_temp.expect_failure($q$INSERT INTO "Answer" VALUES ('16990000-0000-4000-8000-000000000601','16990000-0000-4000-8000-000000000501','16990000-0000-4000-8000-000000000401',1,'both')$q$, '23514');
SELECT pg_temp.expect_failure($q$INSERT INTO "Answer" VALUES ('16990000-0000-4000-8000-000000000601','16990000-0000-4000-8000-000000000501','16990000-0000-4000-8000-000000000401',NULL,NULL)$q$, '23514');
INSERT INTO "Answer" VALUES ('16990000-0000-4000-8000-000000000601','16990000-0000-4000-8000-000000000501','16990000-0000-4000-8000-000000000401',1,NULL);
UPDATE "Answer" SET "ratingValue"=5 WHERE "bundleId"='16990000-0000-4000-8000-000000000601';
SELECT pg_temp.expect_failure($q$INSERT INTO "Answer" VALUES ('16990000-0000-4000-8000-000000000601','16990000-0000-4000-8000-000000000501','16990000-0000-4000-8000-000000000401',3,NULL)$q$, '23505');
INSERT INTO "Answer" VALUES ('16990000-0000-4000-8000-000000000601','16990000-0000-4000-8000-000000000503','16990000-0000-4000-8000-000000000401',NULL,repeat(chr(128512),2000));
SELECT pg_temp.expect_failure($q$UPDATE "Answer" SET "textValue"=repeat(chr(128512),2001) WHERE "questionId"='16990000-0000-4000-8000-000000000503'$q$, '23514');
-- PostgreSQL reports FK NO ACTION as 23503 and may report RESTRICT as 23001.
-- Both must reject deletion; successful deletion or any other error still fails.
SELECT pg_temp.expect_failure($q$DELETE FROM "Question" WHERE "id"='16990000-0000-4000-8000-000000000501'$q$, '23503|23001');
SELECT pg_temp.expect_failure($q$DELETE FROM "Survey" WHERE "id"='16990000-0000-4000-8000-000000000401'$q$, '23503|23001');
INSERT INTO issue16_checks VALUES ('same-survey FKs, rating endpoints, typed values, Unicode bounds and restrictive deletion');

SAVEPOINT partial_response;
DELETE FROM "Answer" WHERE "bundleId"='16990000-0000-4000-8000-000000000601';
ROLLBACK TO SAVEPOINT partial_response;
DO $$ BEGIN
 IF (SELECT count(*) FROM "Answer" WHERE "bundleId"='16990000-0000-4000-8000-000000000601') <> 2 THEN RAISE EXCEPTION 'Rollback lost answers'; END IF;
END $$;
INSERT INTO issue16_checks VALUES ('savepoint rollback preserves submitted associations');
INSERT INTO auth_session VALUES ('issue16-storage-fixture','{"cookie":{"httpOnly":true}}',now() AT TIME ZONE 'UTC');
DO $$ BEGIN
 IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='auth_session' AND column_name='sess') <> 'json' THEN RAISE EXCEPTION 'Session payload type changed'; END IF;
 IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='auth_session' AND column_name='expire') <> 'timestamp without time zone' THEN RAISE EXCEPTION 'Session expiry type changed'; END IF;
END $$;
INSERT INTO issue16_checks VALUES ('session storage shape');
SELECT label FROM issue16_checks ORDER BY label;
ROLLBACK;
