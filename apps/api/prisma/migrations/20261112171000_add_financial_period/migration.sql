ALTER TABLE "FinancialDocument" ADD COLUMN "period" TEXT NOT NULL DEFAULT '1º trimestre';
DROP INDEX "FinancialDocument_informationType_exercise_key";
CREATE UNIQUE INDEX "FinancialDocument_informationType_period_exercise_key" ON "FinancialDocument"("informationType", "period", "exercise");
