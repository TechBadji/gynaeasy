import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "MEDECIN" | "SECRETAIRE" | "ADMIN";
            mustChangePassword?: boolean;
            twoFactorSetupRequired?: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: "MEDECIN" | "SECRETAIRE" | "ADMIN";
        mustChangePassword?: boolean;
        twoFactorSetupRequired?: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "MEDECIN" | "SECRETAIRE" | "ADMIN";
        mustChangePassword?: boolean;
        twoFactorSetupRequired?: boolean;
    }
}
