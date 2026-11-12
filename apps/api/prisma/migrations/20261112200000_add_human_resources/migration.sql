CREATE TABLE "HumanResourcesRecord" (
    "id" TEXT NOT NULL,
    "exercise" INTEGER NOT NULL,
    "locality" TEXT NOT NULL,
    "months" JSONB NOT NULL,
    "status" "GeneralDataStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    CONSTRAINT "HumanResourcesRecord_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HumanResourcesRecord_exercise_locality_key" ON "HumanResourcesRecord"("exercise", "locality");
CREATE INDEX "HumanResourcesRecord_status_exercise_idx" ON "HumanResourcesRecord"("status", "exercise");
ALTER TABLE "HumanResourcesRecord" ADD CONSTRAINT "HumanResourcesRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HumanResourcesRecord" ADD CONSTRAINT "HumanResourcesRecord_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
