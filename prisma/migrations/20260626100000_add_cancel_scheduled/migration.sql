-- AlterTable
ALTER TABLE "Abonnement" ADD COLUMN "cancelScheduled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Abonnement" ADD COLUMN "cancelRequestedAt" TIMESTAMP(3);
