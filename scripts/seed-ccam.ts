import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const actes = [
  // Consultations courantes (Base ou avec majoration)
  { code: "CS", libelle: "Consultation Spécialiste", tarif: 25000, chapitre: "Consultation" },
  { code: "C", libelle: "Consultation Généraliste", tarif: 15000, chapitre: "Consultation" },
  { code: "APC", libelle: "Avis ponctuel de consultant", tarif: 30000, chapitre: "Consultation" },
  { code: "TC", libelle: "Téléconsultation", tarif: 15000, chapitre: "Consultation" },
  { code: "VN", libelle: "Visite de nuit", tarif: 35000, chapitre: "Consultation Urgence" },

  // Gynécologie & Suivi grossesse
  { code: "CQFD001", libelle: "Échographie de datation de la grossesse", tarif: 35000, chapitre: "Imagerie Gynéco-Obstétrique" },
  { code: "CGQM002", libelle: "Échographie obstétricale T1 (1er trimestre)", tarif: 45000, chapitre: "Imagerie Gynéco-Obstétrique" },
  { code: "CGQM003", libelle: "Échographie obstétricale T2 (2ème trimestre)", tarif: 56000, chapitre: "Imagerie Gynéco-Obstétrique" },
  { code: "CGQM004", libelle: "Échographie obstétricale T3 (3ème trimestre)", tarif: 56000, chapitre: "Imagerie Gynéco-Obstétrique" },
  { code: "FCVD001", libelle: "Frottis cervico-vaginal (Prélèvement)", tarif: 5000, chapitre: "Gynécologie" },
  { code: "JHQM001", libelle: "Colposcopie avec biopsie", tarif: 45000, chapitre: "Gynécologie" },
  { code: "JNFM001", libelle: "Pose d'un dispositif intra-utérin (DIU/Sterilet)", tarif: 30000, chapitre: "Gynécologie" },
  { code: "JNQM001", libelle: "Ablation d'un dispositif intra-utérin (DIU/Sterilet)", tarif: 15000, chapitre: "Gynécologie" },
  { code: "JLQM001", libelle: "Pose d'implant contraceptif sous-cutané", tarif: 25000, chapitre: "Gynécologie" },
  { code: "JLQM002", libelle: "Retrait d'implant contraceptif sous-cutané", tarif: 25000, chapitre: "Gynécologie" },
  { code: "JQGA001", libelle: "Échographie pelvienne par voie vaginale", tarif: 40000, chapitre: "Imagerie Gynéco-Obstétrique" },
  { code: "JQGA002", libelle: "Échographie pelvienne par voie abdominale", tarif: 35000, chapitre: "Imagerie Gynéco-Obstétrique" },

  // Urgences & Gestes rapides
  { code: "JNFD001", libelle: "Ablation de polype du col de l'utérus", tarif: 45000, chapitre: "Chirurgie mineure" },
  { code: "JMHM001", libelle: "Incision d'abcès de la glande de Bartholin", tarif: 50000, chapitre: "Chirurgie mineure" },
  { code: "DZQM006", libelle: "Monitorage fœtal (cardiotocographie)", tarif: 15000, chapitre: "Gynéco-Obstétrique" },

  // Pédiatrie (au cas où, utile pour suivi post-partum)
  { code: "COE", libelle: "Consultation obligatoire de l'enfant", tarif: 20000, chapitre: "Pédiatrie" },

  // Actes divers & Généralistes
  { code: "AHPA001", libelle: "Examen clinique complet et bilan de santé", tarif: 30000, chapitre: "Examen Général" },
  { code: "ECG", libelle: "Électrocardiogramme au repos", tarif: 15000, chapitre: "Cardiologie" },
  { code: "INJ", libelle: "Injection intra-musculaire ou sous-cutanée", tarif: 2000, chapitre: "Soins Infirmiers" },
  { code: "VAC", libelle: "Vaccination", tarif: 3000, chapitre: "Prévention" },

  // Accouchement
  { code: "JQGD012", libelle: "Accouchement par voie naturelle", tarif: 150000, chapitre: "Obstétrique" },
  { code: "JQGD013", libelle: "Césarienne programmée", tarif: 350000, chapitre: "Obstétrique" },
  { code: "JQGD014", libelle: "Césarienne en urgence", tarif: 450000, chapitre: "Obstétrique" },
  { code: "JNGD001", libelle: "Révision utérine post-partum", tarif: 60000, chapitre: "Obstétrique" },
  
  // Imagerie Mammographie
  { code: "ZCQM001", libelle: "Mammographie bilatérale de dépistage", tarif: 45000, chapitre: "Imagerie Sénologie" },
  { code: "ZCQM002", libelle: "Échographie mammaire bilatérale", tarif: 35000, chapitre: "Imagerie Sénologie" },
  { code: "ZCFM001", libelle: "Microbiopsie mammaire écho-guidée", tarif: 80000, chapitre: "Imagerie Sénologie" }
];

async function main() {
    console.log("Début du peuplement de la table ActeCCAM...");

    let count = 0;
    for (const acte of actes) {
        // Upsert pour éviter les doublons si le script est lancé plusieurs fois
        await prisma.acteCCAM.upsert({
            where: { code: acte.code },
            update: {
                libelle: acte.libelle,
                tarif: acte.tarif,
                chapitre: acte.chapitre
            },
            create: {
                code: acte.code,
                libelle: acte.libelle,
                tarif: acte.tarif,
                chapitre: acte.chapitre
            }
        });
        count++;
        console.log(`[${count}/${actes.length}] Ajout/Mise à jour de l'acte : ${acte.code} - ${acte.libelle}`);
    }

    console.log(`Succès : ${count} actes ajoutés au catalogue CCAM.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
