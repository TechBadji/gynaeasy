import { prisma } from "@/lib/prisma";

/**
 * Pour une SECRETAIRE : retourne l'ID du médecin lié (pour filtrer les données).
 * Pour MEDECIN / ADMIN : retourne l'ID de l'utilisateur lui-même.
 */
export async function getEffectiveDoctorId(userId: string, role: string): Promise<string> {
    if (role !== "SECRETAIRE") return userId;
    const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { linkedDoctorId: true, linkedDoctor: { select: { id: true, name: true } } },
    });
    return user?.linkedDoctorId ?? userId;
}

/**
 * Retourne le médecin lié si l'utilisateur est une secrétaire, sinon null.
 */
export async function getLinkedDoctor(userId: string, role: string) {
    if (role !== "SECRETAIRE") return null;
    const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { linkedDoctor: { select: { id: true, name: true, specialite: true, clinicName: true } } },
    });
    return user?.linkedDoctor ?? null;
}
