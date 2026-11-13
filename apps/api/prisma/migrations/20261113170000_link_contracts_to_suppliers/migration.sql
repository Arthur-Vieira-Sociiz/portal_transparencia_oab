ALTER TABLE "ContractRecord" ADD COLUMN "supplierId" TEXT;

-- Garante um fornecedor para contratos legados antes de criar a chave estrangeira.
INSERT INTO "Supplier" ("id", "name", "cnpj", "createdAt", "updatedAt")
SELECT
  'legacy_' || md5(contract."cnpj"),
  MIN(contract."supplierName"),
  contract."cnpj",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "ContractRecord" AS contract
WHERE NOT EXISTS (
  SELECT 1 FROM "Supplier" AS supplier WHERE supplier."cnpj" = contract."cnpj"
)
GROUP BY contract."cnpj";

UPDATE "ContractRecord" AS contract
SET "supplierId" = supplier."id"
FROM "Supplier" AS supplier
WHERE supplier."cnpj" = contract."cnpj";

ALTER TABLE "ContractRecord" ALTER COLUMN "supplierId" SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "ContractRecord"
    GROUP BY "supplierId", "signedAt", "exercise"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Existem contratos duplicados por fornecedor, data e exercício; consolide-os antes de aplicar esta migration.';
  END IF;
END $$;

DROP INDEX "ContractRecord_supplierName_signedAt_exercise_key";
CREATE UNIQUE INDEX "ContractRecord_supplierId_signedAt_exercise_key"
ON "ContractRecord"("supplierId", "signedAt", "exercise");

ALTER TABLE "ContractRecord"
ADD CONSTRAINT "ContractRecord_supplierId_fkey"
FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "User_name_id_idx" ON "User"("name", "id");
CREATE INDEX "Supplier_name_id_idx" ON "Supplier"("name", "id");
CREATE INDEX "ContractRecord_exercise_supplierName_id_idx"
ON "ContractRecord"("exercise", "supplierName", "id");

DROP INDEX "FinancialDocument_status_exercise_idx";
CREATE INDEX "FinancialDocument_status_exercise_informationType_period_idx"
ON "FinancialDocument"("status", "exercise", "informationType", "period");

DROP INDEX "HumanResourcesRecord_status_exercise_idx";
CREATE INDEX "HumanResourcesRecord_status_exercise_locality_idx"
ON "HumanResourcesRecord"("status", "exercise", "locality");

DROP INDEX "PatrimonialAsset_statusState_exercise_idx";
CREATE INDEX "PatrimonialAsset_statusState_exercise_informationType_idx"
ON "PatrimonialAsset"("statusState", "exercise", "informationType");

DROP INDEX "ContractRecord_statusState_exercise_idx";
CREATE INDEX "ContractRecord_statusState_exercise_supplierName_idx"
ON "ContractRecord"("statusState", "exercise", "supplierName");
