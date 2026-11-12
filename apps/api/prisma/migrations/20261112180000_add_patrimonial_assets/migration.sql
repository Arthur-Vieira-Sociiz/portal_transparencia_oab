CREATE TABLE "PatrimonialAsset" (
    "id" TEXT NOT NULL,
    "informationType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "acquisitionValue" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL,
    "exercise" INTEGER NOT NULL,
    "documentTitle" TEXT,
    "documentUrl" TEXT,
    "statusState" "GeneralDataStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    CONSTRAINT "PatrimonialAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PatrimonialAsset_informationType_description_exercise_key"
ON "PatrimonialAsset"("informationType", "description", "exercise");
CREATE INDEX "PatrimonialAsset_statusState_exercise_idx"
ON "PatrimonialAsset"("statusState", "exercise");
ALTER TABLE "PatrimonialAsset" ADD CONSTRAINT "PatrimonialAsset_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PatrimonialAsset" ADD CONSTRAINT "PatrimonialAsset_updatedById_fkey"
FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
