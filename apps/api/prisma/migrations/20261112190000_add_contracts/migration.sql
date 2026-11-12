CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Supplier_cnpj_key" ON "Supplier"("cnpj");
CREATE TABLE "ContractRecord" (
    "id" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "objectDescription" TEXT NOT NULL,
    "signedAt" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "value" DECIMAL(14,2) NOT NULL,
    "exercise" INTEGER NOT NULL,
    "contractDocumentUrl" TEXT,
    "amendmentUrls" JSONB NOT NULL,
    "statusState" "GeneralDataStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    CONSTRAINT "ContractRecord_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ContractRecord_supplierName_signedAt_exercise_key" ON "ContractRecord"("supplierName", "signedAt", "exercise");
CREATE INDEX "ContractRecord_statusState_exercise_idx" ON "ContractRecord"("statusState", "exercise");
ALTER TABLE "ContractRecord" ADD CONSTRAINT "ContractRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContractRecord" ADD CONSTRAINT "ContractRecord_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
