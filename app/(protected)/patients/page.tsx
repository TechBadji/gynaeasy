import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PatientsListClient from "@/components/patients/patients-list-client";

export default async function PatientsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/api/auth/signin");

    const userId = (session.user as any).id;

    const patients = await prisma.patient.findMany({
        where: { treatingDoctorId: userId },
        select: {
            id: true,
            codePatient: true,
            civilite: true,
            nom: true,
            prenom: true,
            dateNaissance: true,
            telephone: true,
            email: true,
            groupeSanguin: true,
            rhesus: true,
        },
        orderBy: { nom: "asc" },
    });

    return <PatientsListClient patients={patients} />;
}
