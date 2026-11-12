-- CreateEnum
CREATE TYPE "GeneralDataStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "GeneralData" (
    "id" TEXT NOT NULL,
    "exercise" INTEGER NOT NULL,
    "totalExpenses" DECIMAL(14,2) NOT NULL,
    "totalRevenue" DECIMAL(14,2) NOT NULL,
    "budget" DECIMAL(14,2) NOT NULL,
    "patrimony" DECIMAL(14,2) NOT NULL,
    "activeLawyers" INTEGER NOT NULL,
    "activeSocieties" INTEGER NOT NULL,
    "supportRooms" INTEGER NOT NULL,
    "registeredMembers" INTEGER NOT NULL,
    "status" "GeneralDataStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "GeneralData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeneralData_exercise_key" ON "GeneralData"("exercise");
CREATE INDEX "GeneralData_status_exercise_idx" ON "GeneralData"("status", "exercise");
CREATE INDEX "GeneralData_createdById_idx" ON "GeneralData"("createdById");
CREATE INDEX "GeneralData_updatedById_idx" ON "GeneralData"("updatedById");

-- AddForeignKey
ALTER TABLE "GeneralData" ADD CONSTRAINT "GeneralData_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GeneralData" ADD CONSTRAINT "GeneralData_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
