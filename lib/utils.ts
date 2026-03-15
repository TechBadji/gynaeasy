import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formate un nombre en Franc CFA (FCFA)
 * @param amount Montant à formater
 * @returns Chaîne formatée (ex: "50 000 FCFA")
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount) + " FCFA";
}
