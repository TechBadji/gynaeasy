import { PrismaClient, Role, Civilite, StatutPaiement, ModePaiement, RDVSource } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Lancement du script de peuplement des données...");

    // 1. Création des médecins
    const hashedPassword = await bcrypt.hash("gynaeasy2026", 10);

    // Dr Anna Badji (Gynécologue)
    const doctorAnna = await prisma.user.upsert({
        where: { email: "anna.badji@gynaeasy.com" },
        update: {
            password: hashedPassword,
            specialite: "Gynécologue Obstétricienne",
            enabledModules: ["AGENDA", "PATIENTS", "IMAGERIE"]
        },
        create: {
            email: "anna.badji@gynaeasy.com",
            name: "Anna Badji",
            password: hashedPassword,
            role: Role.MEDECIN,
            specialite: "Gynécologue Obstétricienne",
            enabledModules: ["AGENDA", "PATIENTS", "IMAGERIE"],
        },
    });

    // Dr Moussa Diop (Échographiste)
    const doctorMoussa = await prisma.user.upsert({
        where: { email: "moussa.diop@gynaeasy.com" },
        update: {
            password: hashedPassword,
            specialite: "Radiologue / Échographiste",
            enabledModules: ["AGENDA", "PATIENTS", "IMAGERIE"]
        },
        create: {
            email: "moussa.diop@gynaeasy.com",
            name: "Moussa Diop",
            password: hashedPassword,
            role: Role.MEDECIN,
            specialite: "Radiologue / Échographiste",
            enabledModules: ["AGENDA", "PATIENTS", "IMAGERIE"],
        },
    });

    // Dr Fatou Sow (Sage-femme Major)
    const doctorFatou = await prisma.user.upsert({
        where: { email: "fatou.sow@gynaeasy.com" },
        update: { password: hashedPassword, specialite: "Sage-femme d'État" },
        create: {
            email: "fatou.sow@gynaeasy.com",
            name: "Fatou Sow",
            password: hashedPassword,
            role: Role.MEDECIN,
            specialite: "Sage-femme d'État",
        },
    });

    // Dr Ibrahima Fall (Anesthésiste)
    const doctorIbrahima = await prisma.user.upsert({
        where: { email: "ibrahima.fall@gynaeasy.com" },
        update: { password: hashedPassword, specialite: "Anesthésiste - Réanimateur" },
        create: {
            email: "ibrahima.fall@gynaeasy.com",
            name: "Ibrahima Fall",
            password: hashedPassword,
            role: Role.MEDECIN,
            specialite: "Anesthésiste - Réanimateur",
        },
    });

    // Secrétariat Gynaeasy
    const secretary = await prisma.user.upsert({
        where: { email: "secretariat@gynaeasy.com" },
        update: { password: hashedPassword },
        create: {
            email: "secretariat@gynaeasy.com",
            name: "Secrétariat Gynaeasy",
            password: hashedPassword,
            role: Role.SECRETAIRE,
            enabledModules: ["AGENDA", "PATIENTS"],
        },
    });

    // Super Admin
    await prisma.user.upsert({
        where: { email: "supadmin@gynaeasy.com" },
        update: { password: hashedPassword },
        create: {
            email: "supadmin@gynaeasy.com",
            name: "Super Admin",
            password: hashedPassword,
            role: Role.ADMIN,
        },
    });

    console.log(`✅ Cabinet constitué : ${doctorAnna.name}, ${doctorMoussa.name}, ${doctorFatou.name}, ${doctorIbrahima.name}, ${secretary.name} et Super Admin`);

    // 2. Définition des patients sénégalais
    const patientsData = [
        {
            codePatient: "77101",
            civilite: Civilite.MME,
            nom: "NDIAYE",
            prenom: "Aminata",
            dateNaissance: new Date("1985-05-12"),
            telephone: "776345122",
            email: "aminata.ndiaye@example.sn",
            adresse: "Dakar, Plateau",
            isPublic: true,
            antecedentsMedicaux: { texte: "Hypertension gestationnelle lors de la précédente grossesse." }
        },
        {
            codePatient: "77102",
            civilite: Civilite.MLLE,
            nom: "DIOP",
            prenom: "Fatou Binetou",
            dateNaissance: new Date("1998-11-20"),
            telephone: "701239988",
            email: "fatou.diop@example.sn",
            adresse: "Saly Portudal",
            isPublic: false,
            antecedentsMedicaux: { texte: "Asthme allergique, allergie à la pénicilline." }
        },
        {
            codePatient: "77103",
            civilite: Civilite.MME,
            nom: "SOW",
            prenom: "Khady",
            dateNaissance: new Date("1992-03-15"),
            telephone: "771112233",
            email: "khady.sow@example.sn",
            adresse: "Thiès, Cité Lamy",
            isPublic: true,
            antecedentsMedicaux: { texte: "Dossier public pour suivi multidisciplinaire." }
        },
        {
            codePatient: "77104",
            civilite: Civilite.MME,
            nom: "FALL",
            prenom: "Astou",
            dateNaissance: new Date("1988-09-08"),
            telephone: "784445566",
            email: "astou.fall@example.sn",
            adresse: "Saint-Louis, Sor",
            isPublic: false,
            antecedentsMedicaux: { texte: "Diabète de type 2, suivi rigoureux nécessaire." }
        }
    ];

    // 3. Ajouter des codes CCAM de base
    console.log("⏳ Importation des codes CCAM...");
    const ccamCodes = [
        { code: "JQMD001", libelle: "Échographie de dépistage du 1er trimestre", tarif: 35000, chapitre: "Obstétrique" },
        { code: "JQMD002", libelle: "Échographie morphologique du 2ème trimestre", tarif: 45000, chapitre: "Obstétrique" },
        { code: "JQMD003", libelle: "Échographie de surveillance du 3ème trimestre", tarif: 45000, chapitre: "Obstétrique" },
        { code: "YYLP001", libelle: "Consultation de gynécologie médicale", tarif: 20000, chapitre: "Consultation" },
        { code: "JNMD001", libelle: "Frottis cervico-utérin", tarif: 15000, chapitre: "Dépistage" },
    ];

    for (const c of ccamCodes) {
        await prisma.acteCCAM.upsert({
            where: { code: c.code },
            update: { tarif: c.tarif, libelle: c.libelle, chapitre: c.chapitre },
            create: c
        });
    }

    console.log("⏳ Création des patients...");
    for (const p of patientsData) {
        const createdPatient = await prisma.patient.upsert({
            where: { codePatient: p.codePatient },
            update: {},
            create: {
                ...p,
                treatingDoctorId: doctorAnna.id,
                userId: doctorAnna.id,
            }
        });

        // 4. Ajouter des rendez-vous futurs dans la semaine pour chaque patient
        const today = new Date();
        const daysAhead = Math.floor(Math.random() * 6) + 1; // 1 à 6 jours plus tard
        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() + daysAhead);
        appointmentDate.setHours(9 + Math.floor(Math.random() * 7), 0, 0, 0); // Entre 9h et 16h

        const consultation = await prisma.consultation.create({
            data: {
                patientId: createdPatient.id,
                userId: doctorAnna.id,
                dateHeure: appointmentDate,
                type: p.codePatient === "77101" ? "ECHOGRAPHIE" : "CONSULTATION",
                motif: "Suivi régulier",
                source: Math.random() > 0.5 ? RDVSource.ONLINE : RDVSource.PHONE,
            }
        });

        // Créer une facture pour Aminata Ndiaye (déjà passée)
        if (p.codePatient === "77101") {
            const pastDate = new Date();
            pastDate.setHours(pastDate.getHours() - 2);

            const pastConsultation = await prisma.consultation.create({
                data: {
                    patientId: createdPatient.id,
                    userId: doctorAnna.id,
                    dateHeure: pastDate,
                    type: "ECHOGRAPHIE",
                    motif: "Écho T1",
                    honoraire: 35000,
                }
            });

            await prisma.reglement.create({
                data: {
                    consultationId: pastConsultation.id,
                    montant: 35000,
                    mode: ModePaiement.ESPECES,
                    statut: StatutPaiement.PAYE,
                    dateReglement: pastDate
                }
            });
        }
        // 4. Ajouter des clichés d'imagerie pour certains patients
        if (p.codePatient === "77101") {
            await prisma.document.create({
                data: {
                    patientId: createdPatient.id,
                    nom: "Échographie obstétricale T1",
                    type: "ECHOGRAPHIE",
                    url: "/demo-echo-1.png"
                }
            });
        }
        if (p.codePatient === "77102") {
            await prisma.document.create({
                data: {
                    patientId: createdPatient.id,
                    nom: "Contrôle pelvien post-op",
                    type: "ECHOGRAPHIE",
                    url: "/demo-echo-2.png"
                }
            });
        }

        console.log(`📅 RDV créé pour ${p.prenom} ${p.nom} le ${appointmentDate.toLocaleDateString()}`);
    }

    // 6. Inventaire initial
    console.log("📦 Initialisation de l'inventaire...");
    await prisma.stockItem.upsert({
        where: { id: "gel-echo-1" },
        update: {},
        create: {
            id: "gel-echo-1",
            nom: "Gel Échographie (Flacon 250ml)",
            quantite: 3, // Stock bas volontaire pour test alerte
            unite: "FLACON",
            seuilAlerte: 5,
            categorie: "Imagerie"
        }
    });

    await prisma.stockItem.upsert({
        where: { id: "papier-echo-1" },
        update: {},
        create: {
            id: "papier-echo-1",
            nom: "Papier Imprimante Thermique",
            quantite: 12,
            unite: "ROULEAU",
            seuilAlerte: 4,
            categorie: "Imagerie"
        }
    });

    await prisma.stockItem.upsert({
        where: { id: "gants-1" },
        update: {},
        create: {
            id: "gants-1",
            nom: "Gants Nitrile Taille M",
            quantite: 200,
            unite: "PAIRE",
            seuilAlerte: 50,
            categorie: "Médical"
        }
    });

    // 7. Paramètres du cabinet
    console.log("🏥 Initialisation des paramètres du cabinet...");
    await prisma.clinicSettings.upsert({
        where: { id: "singleton" },
        update: {},
        create: {
            id: "singleton",
            nom: "Gynaeasy Clinic",
            adresse: "Dakar, Sénégal",
            telephone: "+221 33 000 00 00",
            email: "contact@gynaeasy.com",
            slogan: "Votre santé, notre priorité"
        }
    });

    console.log("✨ Opération terminée avec succès !");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
