-- CreateEnum
CREATE TYPE "StatutAd" AS ENUM ('ACTIF', 'PAUSE', 'TERMINE');

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "partenaire" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "lienClick" TEXT,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "prixParJour" DOUBLE PRECISION NOT NULL,
    "prixTotal" DOUBLE PRECISION NOT NULL,
    "statut" "StatutAd" NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);
