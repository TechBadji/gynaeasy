"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";

export async function generateTwoFactorSetup() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false as const, error: "Non autorisé" };

    const user = await (prisma.user as any).findUnique({
        where: { email: session.user.email },
        select: { twoFactorEnabled: true },
    });

    if (user?.twoFactorEnabled) {
        return { success: false as const, error: "La 2FA est déjà activée" };
    }

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(session.user.email, "Gynaeasy", secret);
    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

    // Sauvegarder le secret en attente (pas encore activé)
    await (prisma.user as any).update({
        where: { email: session.user.email },
        data: { twoFactorSecret: secret },
    });

    return { success: true as const, qrCodeUrl, secret };
}

export async function enableTwoFactor(code: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false as const, error: "Non autorisé" };

    const user = await (prisma.user as any).findUnique({
        where: { email: session.user.email },
        select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorSecret) {
        return { success: false as const, error: "Aucune configuration 2FA en cours. Relancez la configuration." };
    }
    if (user.twoFactorEnabled) {
        return { success: false as const, error: "La 2FA est déjà activée" };
    }

    const isValid = authenticator.verify({ token: code.replace(/\s/g, ""), secret: user.twoFactorSecret });
    if (!isValid) {
        return { success: false as const, error: "Code invalide. Vérifiez l'heure de votre appareil et réessayez." };
    }

    await (prisma.user as any).update({
        where: { email: session.user.email },
        data: { twoFactorEnabled: true },
    });

    revalidatePath("/parametres");
    revalidatePath("/", "layout");
    return { success: true as const };
}

export async function disableTwoFactor(code: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false as const, error: "Non autorisé" };

    const user = await (prisma.user as any).findUnique({
        where: { email: session.user.email },
        select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled) {
        return { success: false as const, error: "La 2FA n'est pas activée" };
    }
    if (!user.twoFactorSecret) {
        return { success: false as const, error: "Secret 2FA introuvable" };
    }

    const isValid = authenticator.verify({ token: code.replace(/\s/g, ""), secret: user.twoFactorSecret });
    if (!isValid) {
        return { success: false as const, error: "Code invalide" };
    }

    await (prisma.user as any).update({
        where: { email: session.user.email },
        data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    revalidatePath("/parametres");
    revalidatePath("/", "layout");
    return { success: true as const };
}

export async function getTwoFactorStatus() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { enabled: false, required: false };

    const user = await (prisma.user as any).findUnique({
        where: { email: session.user.email },
        select: { twoFactorEnabled: true, twoFactorRequired: true },
    });

    const globalSettings = await prisma.clinicSettings.findUnique({
        where: { id: "singleton" },
        select: { require2FAForAll: true },
    });

    return {
        enabled: user?.twoFactorEnabled ?? false,
        required: user?.twoFactorRequired ?? false,
        globalRequired: globalSettings?.require2FAForAll ?? false,
    };
}
