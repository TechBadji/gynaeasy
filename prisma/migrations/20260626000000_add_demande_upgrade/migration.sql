-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REFUSE');

-- CreateTable
CREATE TABLE "DemandeUpgrade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planActuel" "PlanAbonnement" NOT NULL,
    "planDemande" "PlanAbonnement" NOT NULL,
    "statut" "StatutDemande" NOT NULL DEFAULT 'EN_ATTENTE',
    "message" TEXT,
    "noteAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandeUpgrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DemandeUpgrade_userId_idx" ON "DemandeUpgrade"("userId");

-- CreateIndex
CREATE INDEX "DemandeUpgrade_statut_idx" ON "DemandeUpgrade"("statut");

-- AddForeignKey
ALTER TABLE "DemandeUpgrade" ADD CONSTRAINT "DemandeUpgrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
