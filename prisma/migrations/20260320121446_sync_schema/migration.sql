-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'URGENT');

-- CreateEnum
CREATE TYPE "StatutFacture" AS ENUM ('EN_ATTENTE', 'PAYEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEDECIN', 'SECRETAIRE', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'PENDING_APPROVAL', 'ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "Civilite" AS ENUM ('MME', 'MLLE', 'M');

-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('PENDING', 'GRANTED', 'DENIED');

-- CreateEnum
CREATE TYPE "StatutGrossesse" AS ENUM ('EN_COURS', 'TERMINEE', 'ARRETEE');

-- CreateEnum
CREATE TYPE "TypeRDV" AS ENUM ('CONSULTATION', 'ECHOGRAPHIE', 'URGENCE', 'SUIVI_GROSSESSE', 'TELECONSULTATION');

-- CreateEnum
CREATE TYPE "RDVSource" AS ENUM ('ONLINE', 'PHONE');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('ESPECES', 'CHEQUE', 'CB', 'VIREMENT', 'SANTE', 'WAVE', 'ORANGE_MONEY');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('EN_ATTENTE', 'PAYE', 'ANNULE', 'REMBOURSE');

-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('ORDONNANCE', 'CERTIFICAT', 'COURRIER', 'RESULTAT_LABO', 'ECHOGRAPHIE', 'FEUILLE_SOIN', 'AUTRE');

-- CreateEnum
CREATE TYPE "ReductionType" AS ENUM ('POURCENTAGE', 'MONTANT_FIXE');

-- CreateEnum
CREATE TYPE "PlanAbonnement" AS ENUM ('SOLO', 'PRO', 'CLINIQUE');

-- CreateEnum
CREATE TYPE "StatutAbonnement" AS ENUM ('ACTIF', 'ANNULE', 'EXPIRE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEDECIN',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "specialite" TEXT,
    "enabledModules" TEXT[] DEFAULT ARRAY['AGENDA', 'PATIENTS']::TEXT[],
    "clinicName" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "verificationToken" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "planId" TEXT,
    "subscriptionStatus" "StatutAbonnement",
    "isEmergencyAvailable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL DEFAULT 'INFO',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "codePatient" TEXT NOT NULL,
    "civilite" "Civilite" NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "groupeSanguin" TEXT,
    "rhesus" TEXT,
    "antecedentsMedicaux" JSONB,
    "traitementsEnCours" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "treatingDoctorId" TEXT NOT NULL,
    "consentementRGPD" BOOLEAN NOT NULL DEFAULT false,
    "consentementDate" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "status" "AccessStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grossesse" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "ddr" TIMESTAMP(3),
    "dpa" TIMESTAMP(3),
    "statut" "StatutGrossesse" NOT NULL DEFAULT 'EN_COURS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grossesse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActeCCAM" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "description" TEXT,
    "tarif" DOUBLE PRECISION NOT NULL,
    "coeff" DOUBLE PRECISION,
    "chapitre" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActeCCAM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateHeure" TIMESTAMP(3) NOT NULL,
    "duree" INTEGER NOT NULL DEFAULT 30,
    "type" "TypeRDV" NOT NULL,
    "motif" TEXT,
    "diagnostique" TEXT,
    "notes" TEXT,
    "donneesMedicales" JSONB,
    "honoraire" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "source" "RDVSource" NOT NULL DEFAULT 'PHONE',
    "smsReminded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationActe" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "acteId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "tarifApplique" DOUBLE PRECISION NOT NULL,
    "coefficient" DOUBLE PRECISION,
    "remboursement" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationActe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reglement" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "mode" "ModePaiement" NOT NULL,
    "statut" "StatutPaiement" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateReglement" TIMESTAMP(3),
    "reference" TEXT,
    "feuilleSoinsUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reglement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeDocument" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModeleDocument" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeDocument" NOT NULL,
    "contenu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModeleDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "patientId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Abonnement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeId" TEXT,
    "plan" "PlanAbonnement" NOT NULL,
    "statut" "StatutAbonnement" NOT NULL DEFAULT 'ACTIF',
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" TIMESTAMP(3),
    "reductionType" "ReductionType",
    "reductionValeur" DOUBLE PRECISION,
    "notesPromo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Abonnement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactureHote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "periodeDebut" TIMESTAMP(3) NOT NULL,
    "periodeFin" TIMESTAMP(3) NOT NULL,
    "montantHT" DOUBLE PRECISION NOT NULL,
    "montantTVA" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "montantTTC" DOUBLE PRECISION NOT NULL,
    "statut" "StatutFacture" NOT NULL DEFAULT 'PAYEE',
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FactureHote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanConfig" (
    "id" TEXT NOT NULL,
    "plan" "PlanAbonnement" NOT NULL,
    "prixMensuel" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "features" JSONB,
    "isPromotional" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "ReductionType" NOT NULL,
    "valeur" DOUBLE PRECISION NOT NULL,
    "validUntil" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" TEXT,
    "quantite" INTEGER NOT NULL DEFAULT 0,
    "unite" TEXT NOT NULL DEFAULT 'UNITE',
    "seuilAlerte" INTEGER NOT NULL DEFAULT 5,
    "derniereModif" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "nom" TEXT NOT NULL DEFAULT 'Gynaeasy Clinic',
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "slogan" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logo" TEXT,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClinicSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_codePatient_key" ON "Patient"("codePatient");

-- CreateIndex
CREATE INDEX "Grossesse_patientId_idx" ON "Grossesse"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "ActeCCAM_code_key" ON "ActeCCAM"("code");

-- CreateIndex
CREATE INDEX "Consultation_patientId_idx" ON "Consultation"("patientId");

-- CreateIndex
CREATE INDEX "Consultation_userId_idx" ON "Consultation"("userId");

-- CreateIndex
CREATE INDEX "Consultation_dateHeure_idx" ON "Consultation"("dateHeure");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationActe_consultationId_acteId_key" ON "ConsultationActe"("consultationId", "acteId");

-- CreateIndex
CREATE UNIQUE INDEX "Reglement_consultationId_key" ON "Reglement"("consultationId");

-- CreateIndex
CREATE INDEX "Document_patientId_idx" ON "Document"("patientId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_patientId_idx" ON "AuditLog"("patientId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Abonnement_stripeId_key" ON "Abonnement"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "FactureHote_numero_key" ON "FactureHote"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "PlanConfig_plan_key" ON "PlanConfig"("plan");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_treatingDoctorId_fkey" FOREIGN KEY ("treatingDoctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grossesse" ADD CONSTRAINT "Grossesse_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationActe" ADD CONSTRAINT "ConsultationActe_acteId_fkey" FOREIGN KEY ("acteId") REFERENCES "ActeCCAM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationActe" ADD CONSTRAINT "ConsultationActe_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reglement" ADD CONSTRAINT "Reglement_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abonnement" ADD CONSTRAINT "Abonnement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactureHote" ADD CONSTRAINT "FactureHote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
