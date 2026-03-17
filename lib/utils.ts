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
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
}
