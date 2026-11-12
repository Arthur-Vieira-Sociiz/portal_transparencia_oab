ALTER TABLE "FinancialDocument" ALTER COLUMN "documentUrl" DROP NOT NULL;
ALTER TABLE "FinancialDocument" ADD COLUMN "pdfUrl" TEXT;
ALTER TABLE "FinancialDocument" ADD COLUMN "csvUrl" TEXT;
