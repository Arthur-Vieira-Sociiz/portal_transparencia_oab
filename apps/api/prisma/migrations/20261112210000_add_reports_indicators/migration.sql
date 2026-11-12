CREATE TABLE "ReportsIndicator" (
    "id" TEXT NOT NULL,
    "exercise" INTEGER NOT NULL,
    "totalRevenue" DECIMAL(14,2) NOT NULL,
    "totalExpense" DECIMAL(14,2) NOT NULL,
    "exerciseResult" DECIMAL(14,2) NOT NULL,
    "plannedBudget" DECIMAL(14,2) NOT NULL,
    "executedBudget" DECIMAL(14,2) NOT NULL,
    "executionPercentage" DECIMAL(5,2) NOT NULL,
    "activeLawyers" INTEGER NOT NULL,
    "interns" INTEGER NOT NULL,
    "registeredSocieties" INTEGER NOT NULL,
    "appointments" INTEGER NOT NULL,
    "protocols" INTEGER NOT NULL,
    "certificates" INTEGER NOT NULL,
    "ombudsmanRequests" INTEGER NOT NULL,
    "activeContracts" INTEGER NOT NULL,
    "totalContractValue" DECIMAL(14,2) NOT NULL,
    "newBids" INTEGER NOT NULL,
    "closedContracts" INTEGER NOT NULL,
    "employees" INTEGER NOT NULL,
    "status" "GeneralDataStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    CONSTRAINT "ReportsIndicator_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReportsIndicator_exercise_key" ON "ReportsIndicator"("exercise");
CREATE INDEX "ReportsIndicator_status_exercise_idx" ON "ReportsIndicator"("status", "exercise");
ALTER TABLE "ReportsIndicator" ADD CONSTRAINT "ReportsIndicator_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReportsIndicator" ADD CONSTRAINT "ReportsIndicator_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
