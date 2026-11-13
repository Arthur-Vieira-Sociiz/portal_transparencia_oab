ALTER TABLE "User"
ADD COLUMN "blockedUntil" TIMESTAMP(3);

CREATE TABLE "RateLimitCounter" (
    "key" TEXT NOT NULL,
    "hits" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitCounter_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimitCounter_resetAt_idx"
ON "RateLimitCounter"("resetAt");
