"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/mail";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

export async function requestPasswordReset(email: string) {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    // Silent fail on rate limit — prevents brute-force enumeration of rate limit status
    if (!checkRateLimit(`reset:${ip}`, 5, 60 * 60 * 1000)) return { success: true };

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always return success to avoid email enumeration
    if (!user) return { success: true };

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await (prisma.user as any).update({
        where: { id: user.id },
        data: { resetPasswordToken: token, resetPasswordExpires: expires },
    });

    await sendResetPasswordEmail(user.email!, user.name || "Docteur", token);

    return { success: true };
}

export async function resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword || newPassword.length < 8) {
        return { success: false, error: "Données invalides." };
    }

    const user = await (prisma.user as any).findUnique({
        where: { resetPasswordToken: token },
        select: { id: true, resetPasswordExpires: true },
    });

    if (!user) return { success: false, error: "Lien invalide ou déjà utilisé." };

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        return { success: false, error: "Ce lien a expiré. Faites une nouvelle demande." };
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await (prisma.user as any).update({
        where: { id: user.id },
        data: {
            password: hashed,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            mustChangePassword: false,
        },
    });

    return { success: true };
}
