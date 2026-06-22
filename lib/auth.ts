import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { logAudit } from "@/lib/audit";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" },
                twoFactorCode: { label: "Code 2FA (si activé)", type: "text" },
                rememberMe: { label: "Se souvenir de moi", type: "text" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email et mot de passe requis");
                }

                const user = await (prisma.user as any).findUnique({
                    where: { email: credentials.email.toLowerCase() },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        password: true,
                        status: true,
                        role: true,
                        twoFactorEnabled: true,
                        twoFactorSecret: true,
                        twoFactorRequired: true,
                        mustChangePassword: true,
                    }
                });

                // Use IP for audit logging
                const ipAddress = (req?.headers as any)?.["x-forwarded-for"] as string || "unknown";

                if (!user || !user.password) {
                    throw new Error("Identifiants incorrects");
                }

                if (user.status === "BLOCKED") {
                    throw new Error("Votre compte a été suspendu par l'administration.");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    // Log failed login attempt
                    await logAudit({
                        userId: user.id,
                        action: "CONNEXION_ECHOUEE",
                        details: { reason: "Mot de passe incorrect" },
                        ipAddress,
                    });
                    throw new Error("Identifiants incorrects");
                }

                if (user.twoFactorEnabled) {
                    if (!credentials.twoFactorCode) {
                        throw new Error("Code 2FA requis");
                    }

                    const isValidToken = authenticator.verify({
                        token: credentials.twoFactorCode,
                        secret: user.twoFactorSecret!,
                    });

                    if (!isValidToken) {
                        await logAudit({
                            userId: user.id,
                            action: "CONNEXION_ECHOUEE_2FA",
                            details: { reason: "Code 2FA invalide" },
                            ipAddress,
                        });
                        throw new Error("Code 2FA invalide");
                    }
                }

                // Check if 2FA setup is required but not yet enabled
                let twoFactorSetupRequired = false;
                if (!user.twoFactorEnabled) {
                    if (user.twoFactorRequired) {
                        twoFactorSetupRequired = true;
                    } else {
                        const globalSettings = await prisma.clinicSettings.findUnique({
                            where: { id: "singleton" },
                            select: { require2FAForAll: true },
                        });
                        if (globalSettings?.require2FAForAll) {
                            twoFactorSetupRequired = true;
                        }
                    }
                }

                // Log successful login
                await logAudit({
                    userId: user.id,
                    action: "CONNEXION_REUSSIE",
                    ipAddress,
                });

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    mustChangePassword: user.mustChangePassword,
                    twoFactorSetupRequired,
                    rememberMe: credentials.rememberMe === "true",
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.mustChangePassword = (user as any).mustChangePassword;
                token.twoFactorSetupRequired = (user as any).twoFactorSetupRequired;
                if (!(user as any).rememberMe) {
                    // Session expires in 8 hours if "remember me" is not checked
                    token.exp = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
                }
            }
            // Update token when mustChangePassword or twoFactorSetupRequired changes
            if (trigger === "update") {
                if (session?.mustChangePassword === false) token.mustChangePassword = false;
                if (session?.twoFactorSetupRequired === false) token.twoFactorSetupRequired = false;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).role = token.role as string;
                (session.user as any).mustChangePassword = token.mustChangePassword as boolean;
                (session.user as any).twoFactorSetupRequired = token.twoFactorSetupRequired as boolean;
            }
            return session;
        },
    },
};
