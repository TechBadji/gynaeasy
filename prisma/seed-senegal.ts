
import { PrismaClient, Role, Civilite, StatutPaiement, ModePaiement, RDVSource, TypeRDV } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🇸🇳 Lancement du script de peuplement Gynaeasy Sénégal...");

    const hashedPassword = await bcrypt.hash("gynaeasy2026", 10);

    // 1. UTILISATEURS (Médecins & Secrétaires)
    const users = [
        {
            email: "dr.keita@gynaeasy.com",
            name: "Dr. Abdoulaye Keita",
            role: Role.MEDECIN,
            specialite: "Chirurgien Gynécologue",
            enabledModules: ["AGENDA", "PATIENTS", "FACTURATION", "CONSULTATION", "IMAGERIE"]
        },
        {
            email: "dr.sy@gynaeasy.com",
            name: "Dr. Mariama Sy",
            role: Role.MEDECIN,
            specialite: "Gynécologue-Obstétricienne",
            enabledModules: ["AGENDA", "PATIENTS", "FACTURATION", "CONSULTATION", "IMAGERIE"]
        },
        {
            email: "marieme.fall@gynaeasy.com",
            name: "Marième Fall",
            role: Role.SECRETAIRE,
            enabledModules: ["AGENDA", "PATIENTS", "FACTURATION"]
        }
    ];

    const createdUsers = [];
    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: { password: hashedPassword },
            create: {
                ...u,
                password: hashedPassword,
            },
        });

        // Abonnement par défaut
        await prisma.abonnement.upsert({
            where: { stripeId: `sub_${user.id}` }, // Fake stripe ID for uniqueness in seed
            update: {},
            create: {
                userId: user.id,
                stripeId: `sub_${user.id}`,
                plan: u.role === Role.MEDECIN ? "PREMIUM" : "PRO",
                statut: "ACTIF",
                dateDebut: new Date(),
            }
        });

        createdUsers.push(user);
    }

    const docKeita = createdUsers[0];
    const docSy = createdUsers[1];

    // 2. PATIENTS (Noms et adresses sénégalaises)
    const patientsData = [
        {
            codePatient: "22101",
            civilite: Civilite.MME,
            nom: "GUEYE",
            prenom: "Fatoumata",
            dateNaissance: new Date("1990-04-12"),
            telephone: "775432100",
            email: "fatou.gueye@example.sn",
            adresse: "Pikine, Tally Iba Maguèye",
            isPublic: true,
            treatingDoctorId: docKeita.id,
            userId: docKeita.id,
        },
        {
            codePatient: "22102",
            civilite: Civilite.MME,
            nom: "DIALLO",
            prenom: "Aïssatou",
            dateNaissance: new Date("1982-08-25"),
            telephone: "781234567",
            email: "aissatou.diallo@example.sn",
            adresse: "Guédiawaye, Hamo 4",
            isPublic: false,
            treatingDoctorId: docSy.id,
            userId: docSy.id,
        },
        {
            codePatient: "22103",
            civilite: Civilite.MLLE,
            nom: "SANE",
            prenom: "Marie-Louise",
            dateNaissance: new Date("2000-01-05"),
            telephone: "709876543",
            email: "ml.sane@example.sn",
            adresse: "Ziguinchor, Escale",
            isPublic: true,
            treatingDoctorId: docKeita.id,
            userId: docKeita.id,
        },
        {
            codePatient: "22104",
            civilite: Civilite.MME,
            nom: "THIAM",
            prenom: "Penda",
            dateNaissance: new Date("1995-12-30"),
            telephone: "765554433",
            email: "penda.thiam@example.sn",
            adresse: "Rufisque, Arafat",
            isPublic: false,
            treatingDoctorId: docSy.id,
            userId: docSy.id,
        },
        {
            codePatient: "22105",
            civilite: Civilite.MME,
            nom: "FAYE",
            prenom: "Khady Noël",
            dateNaissance: new Date("1987-06-18"),
            telephone: "773332211",
            email: "khady.faye@example.sn",
            adresse: "Mermoz, Dakar",
            isPublic: true,
            treatingDoctorId: docKeita.id,
            userId: docKeita.id,
        }
    ];

    console.log("⏳ Création des patients et de l'historique...");
    for (const p of patientsData) {
        const patient = await prisma.patient.upsert({
            where: { codePatient: p.codePatient },
            update: {},
            create: p
        });

        // 3. CONSULTATIONS & FACTURES (Passées - 30 derniers jours)
        const doctor = Math.random() > 0.5 ? docKeita : docSy;

        for (let i = 0; i < 3; i++) {
            const pastDays = Math.floor(Math.random() * 30) + 1;
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - pastDays);
            pastDate.setHours(10 + i, 0, 0, 0);

            const montant = [15000, 25000, 35000, 45000][Math.floor(Math.random() * 4)];
            const types = [TypeRDV.CONSULTATION, TypeRDV.ECHOGRAPHIE, TypeRDV.SUIVI_GROSSESSE];

            const consultation = await prisma.consultation.create({
                data: {
                    patientId: patient.id,
                    userId: doctor.id,
                    dateHeure: pastDate,
                    type: types[Math.floor(Math.random() * types.length)],
                    motif: "Consultation de suivi",
                    honoraire: montant,
                }
            });

            await prisma.reglement.create({
                data: {
                    consultationId: consultation.id,
                    montant: montant,
                    mode: [ModePaiement.WAVE, ModePaiement.ORANGE_MONEY, ModePaiement.ESPECES][Math.floor(Math.random() * 3)],
                    statut: StatutPaiement.PAYE,
                    dateReglement: pastDate
                }
            });
        }

        // 4. RENDEZ-VOUS FUTURS (Semaine prochaine)
        const futureDays = Math.floor(Math.random() * 7) + 1;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + futureDays);
        futureDate.setHours(9 + futureDays, 30, 0, 0);

        await prisma.consultation.create({
            data: {
                patientId: patient.id,
                userId: doctor.id,
                dateHeure: futureDate,
                type: TypeRDV.CONSULTATION,
                motif: "Visite de contrôle",
                source: RDVSource.PHONE,
            }
        });
    }

    console.log("🇸🇳 Population terminée avec succès !");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
