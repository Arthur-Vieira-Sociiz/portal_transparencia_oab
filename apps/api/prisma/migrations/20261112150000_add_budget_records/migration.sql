CREATE TABLE "BudgetRecord" (
    "id" TEXT NOT NULL,
    "informationType" TEXT NOT NULL,
    "annualBudget" DECIMAL(14,2) NOT NULL,
    "plannedAmount" DECIMAL(14,2) NOT NULL,
    "executedAmount" DECIMAL(14,2) NOT NULL,
    "exercise" INTEGER NOT NULL,
    "documentTitle" TEXT,
    "documentUrl" TEXT,
    "status" "GeneralDataStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    CONSTRAINT "BudgetRecord_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BudgetRecord_informationType_exercise_key" ON "BudgetRecord"("informationType", "exercise");
CREATE INDEX "BudgetRecord_status_exercise_idx" ON "BudgetRecord"("status", "exercise");
ALTER TABLE "BudgetRecord" ADD CONSTRAINT "BudgetRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BudgetRecord" ADD CONSTRAINT "BudgetRecord_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
