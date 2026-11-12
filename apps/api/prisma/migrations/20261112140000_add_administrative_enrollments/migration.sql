-- CreateTable
CREATE TABLE "AdministrativeEnrollment" (
    "id" TEXT NOT NULL,
    "exercise" INTEGER NOT NULL,
    "subsection" TEXT NOT NULL,
    "lawyers" INTEGER NOT NULL,
    "interns" INTEGER NOT NULL,
    "supplementary" INTEGER NOT NULL,
    "transferringLawyers" INTEGER NOT NULL,
    "status" "GeneralDataStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "AdministrativeEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdministrativeEnrollment_exercise_subsection_key" ON "AdministrativeEnrollment"("exercise", "subsection");
CREATE INDEX "AdministrativeEnrollment_status_exercise_idx" ON "AdministrativeEnrollment"("status", "exercise");
CREATE INDEX "AdministrativeEnrollment_createdById_idx" ON "AdministrativeEnrollment"("createdById");
CREATE INDEX "AdministrativeEnrollment_updatedById_idx" ON "AdministrativeEnrollment"("updatedById");

ALTER TABLE "AdministrativeEnrollment" ADD CONSTRAINT "AdministrativeEnrollment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdministrativeEnrollment" ADD CONSTRAINT "AdministrativeEnrollment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
