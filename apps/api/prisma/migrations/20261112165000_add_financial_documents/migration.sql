CREATE TABLE "FinancialDocument" (
    "id" TEXT NOT NULL,
    "informationType" TEXT NOT NULL,
    "exercise" INTEGER NOT NULL,
    "documentTitle" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "status" "GeneralDataStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    CONSTRAINT "FinancialDocument_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FinancialDocument_informationType_exercise_key" ON "FinancialDocument"("informationType", "exercise");
CREATE INDEX "FinancialDocument_status_exercise_idx" ON "FinancialDocument"("status", "exercise");
ALTER TABLE "FinancialDocument" ADD CONSTRAINT "FinancialDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialDocument" ADD CONSTRAINT "FinancialDocument_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
