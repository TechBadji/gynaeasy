-- AlterTable: PlanConfig — ajouter prixAnnuel
ALTER TABLE "PlanConfig" ADD COLUMN IF NOT EXISTS "prixAnnuel" DOUBLE PRECISION;

-- AlterTable: Promotion — ajouter colonnes manquantes
ALTER TABLE "Promotion" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Promotion" ADD COLUMN IF NOT EXISTS "usagePerUser" INTEGER;
ALTER TABLE "Promotion" ADD COLUMN IF NOT EXISTS "applicableTo" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable: PromoUsage
CREATE TABLE IF NOT EXISTS "PromoUsage" (
    "id" TEXT NOT NULL,
    "promoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoUsage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: PromoUsage
ALTER TABLE "PromoUsage" ADD CONSTRAINT "PromoUsage_promoId_fkey"
    FOREIGN KEY ("promoId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PromoUsage" ADD CONSTRAINT "PromoUsage_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: ClinicSettings — ajouter require2FAForAll
ALTER TABLE "ClinicSettings" ADD COLUMN IF NOT EXISTS "require2FAForAll" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Advertisement — ajouter colonnes manquantes
ALTER TABLE "Advertisement" ADD COLUMN IF NOT EXISTS "couleur" TEXT;
ALTER TABLE "Advertisement" ADD COLUMN IF NOT EXISTS "formatCible" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Advertisement" ADD COLUMN IF NOT EXISTS "clickCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Advertisement" ADD COLUMN IF NOT EXISTS "impressionCount" INTEGER NOT NULL DEFAULT 0;
