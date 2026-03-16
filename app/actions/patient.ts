"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendSMS } from "@/lib/sms";

// Schéma de validation Zod pour la création d'un patient
const PatientSchema = z.object({
    civilite: z.enum(["MME", "MLLE", "M"]),
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    dateNaissance: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Date de naissance invalide",
    }),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    telephone: z.string().optional().or(z.literal("")),
    isPublic: z.coerce.boolean().default(false),
    groupeSanguin: z.enum(["A", "B", "AB", "O", ""]).optional(),
    rhesus: z.enum(["+", "-", ""]).optional(),
    antecedentsMedicaux: z.string().optional().or(z.literal("")),
});

async function generateUniqueCodePatient() {
    let code = "";
    let exists = true;
    while (exists) {
        // Génère un nombre entre 10000 et 99999
        code = Math.floor(10000 + Math.random() * 90000).toString();
        const patient = await prisma.patient.findUnique({ where: { codePatient: code } });
        if (!patient) exists = false;
    }
    return code;
}

export type PatientFormState = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
};

export async function createPatient(
    formData: FormData
): Promise<PatientFormState> {
    // Vérification de la session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { success: false, message: "Non authentifié" };
    }

    // Extraction et validation des données
    const raw = {
        civilite: formData.get("civilite"),
        nom: formData.get("nom"),
        prenom: formData.get("prenom"),
        dateNaissance: formData.get("dateNaissance"),
        email: formData.get("email"),
        telephone: formData.get("telephone"),
        isPublic: formData.get("isPublic") === "true",
        groupeSanguin: formData.get("groupeSanguin"),
        rhesus: formData.get("rhesus"),
        antecedentsMedicaux: formData.get("antecedentsMedicaux"),
    };

    const validatedFields = PatientSchema.safeParse(raw);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Erreur de validation",
            errors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    const data = validatedFields.data;

    try {
        const userId = (session.user as any).id;
        if (!userId) {
            return { success: false, message: "Session invalide : ID utilisateur manquant. Reconnectez-vous." };
        }

        const codePatient = await generateUniqueCodePatient();

        await prisma.patient.create({
            data: {
                codePatient,
                civilite: data.civilite,
                nom: data.nom,
                prenom: data.prenom,
                dateNaissance: new Date(data.dateNaissance),
                email: data.email || null,
                telephone: data.telephone || null,
                isPublic: data.isPublic,
                treatingDoctorId: userId, // Le médecin créateur devient le médecin traitant par défaut
                groupeSanguin: (data.groupeSanguin as any) || null,
                rhesus: data.rhesus || null,
                antecedentsMedicaux: data.antecedentsMedicaux ? { texte: data.antecedentsMedicaux } : undefined,
                userId,
            },
        });

        // Invalider le cache de la page patients
        revalidatePath("/patients");

        return { success: true, message: "Patient créé avec succès" };
    } catch (error: any) {
        console.error("Erreur création patient:", error);
        return { success: false, message: `Erreur : ${error?.message || "Erreur inconnue"}` };
    }
}

export async function declareGrossesse(patientId: string, ddrStr: string | null) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Non autorisé");

    let ddr = null;
    let dpa = null;

    if (ddrStr) {
        ddr = new Date(ddrStr);
        // Calcul simple de DPA: DDR + 280 jours (40 SA)
        dpa = new Date(ddr.getTime() + 280 * 24 * 60 * 60 * 1000);
    }

    try {
        await prisma.grossesse.create({
            data: {
                patientId,
                ddr,
                dpa,
                statut: "EN_COURS"
            }
        });
        revalidatePath(`/patients/${patientId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Erreur déclaration grossesse:", e);
        return { success: false, message: e.message };
    }
}

export async function requestAccess(patientId: string) {
    const session = await getServerSession(authOptions);
    const doctorId = (session?.user as any).id;
    if (!doctorId) throw new Error("Non autorisé");

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { treatingDoctor: true }
    });

    if (!patient) throw new Error("Patient non trouvé");

    try {
        const request = await prisma.accessRequest.create({
            data: {
                patientId,
                doctorId,
                status: "PENDING"
            }
        });

        // NOTIFICATION EMAIL ou SYSTEME au médecin traitant
        // TODO: Implémenter la notification système car 'telephone' n'est pas sur User
        /*
        if (patient.treatingDoctor.email) {
            const message = `Gynaeasy: Le Dr ${(session.user as any).name} demande l'accès au dossier...`;
            // sendEmail(patient.treatingDoctor.email, message);
        }
        */

        revalidatePath(`/patients/${patientId}`);
        return { success: true, requestId: request.id };
    } catch (e: any) {
        console.error("Error requesting access:", e);
        return { success: false, message: e.message };
    }
}

export async function handleAccessRequest(requestId: string, approve: boolean) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any).id;

    const request = await prisma.accessRequest.findUnique({
        where: { id: requestId },
        include: { patient: true }
    });

    if (!request || request.patient.treatingDoctorId !== userId) {
        throw new Error("Seul le médecin traitant peut valider cette demande.");
    }

    try {
        await prisma.accessRequest.update({
            where: { id: requestId },
            data: {
                status: approve ? "GRANTED" : "DENIED",
                expiresAt: approve ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null // Accès 24h par défaut
            }
        });

        revalidatePath(`/patients/${request.patientId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function searchPatients(query: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];

    if (!query || query.length < 2) return [];

    return await prisma.patient.findMany({
        where: {
            OR: [
                { nom: { contains: query, mode: "insensitive" } },
                { prenom: { contains: query, mode: "insensitive" } },
                { codePatient: { contains: query } },
            ],
        },
        select: {
            id: true,
            nom: true,
            prenom: true,
            codePatient: true,
            civilite: true,
        },
        take: 5,
    });
}
