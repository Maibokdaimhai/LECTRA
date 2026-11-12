BEGIN;
CREATE TABLE "Course" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "code" TEXT NOT NULL, "title" TEXT NOT NULL,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");
CREATE TABLE "Section" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "courseId" UUID NOT NULL,
  "term" TEXT NOT NULL, "sectionCode" TEXT NOT NULL, "ownerId" UUID NOT NULL,
  CONSTRAINT "Section_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "Section_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX "Section_courseId_term_sectionCode_key" ON "Section"("courseId", "term", "sectionCode");
CREATE INDEX "Section_ownerId_courseId_idx" ON "Section"("ownerId", "courseId");
CREATE TABLE "Membership" (
  "sectionId" UUID NOT NULL, "studentId" UUID NOT NULL,
  CONSTRAINT "Membership_pkey" PRIMARY KEY ("sectionId", "studentId"),
  CONSTRAINT "Membership_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "Membership_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX "Membership_studentId_sectionId_idx" ON "Membership"("studentId", "sectionId");
CREATE TABLE "Lecture" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "sectionId" UUID NOT NULL,
  "title" TEXT NOT NULL, "lectureDate" DATE NOT NULL, "sequence" INTEGER NOT NULL,
  CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Lecture_sequence_positive" CHECK ("sequence" > 0),
  CONSTRAINT "Lecture_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX "Lecture_sectionId_sequence_key" ON "Lecture"("sectionId", "sequence");
CREATE INDEX "Lecture_sectionId_lectureDate_idx" ON "Lecture"("sectionId", "lectureDate");
COMMIT;
