import { prisma } from "@/lib/prisma";

export async function logAudit({
    userId,
    action,
    patientId,
    details,
    ipAddress,
}: {
    userId: string;
    action: string;
    patientId?: string;
    details?: any; // object that will be stringified for structured storage
    ipAddress?: string;
}) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                patientId,
                details: details ? JSON.stringify(details) : null,
                ipAddress,
            },
        });
    } catch (error) {
        // We log the error but avoid crashing the main execution flow if audit logging fails
        console.error("Failed to write to AuditLog (critical for HDS compliance):", error);
    }
}
