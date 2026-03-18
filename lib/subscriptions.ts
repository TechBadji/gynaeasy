import { SUBSCRIPTION_PLANS } from "@/config/plans";

/**
 * Utilitaires pour la gestion des fonctionnalités par plan
 */

export type FeatureKey = 
  | "Agenda complet & Dossier Patient HDS"
  | "100 SMS de rappel inclus / mois"
  | "300 SMS de rappel inclus / mois"
  | "1000 SMS de rappel inclus / mois"
  | "Ordonnances & Certificats numériques"
  | "Accès Secrétariat"
  | "Accès Secrétariat dédié"
  | "Gestion de caisse (Wave/Orange Money)"
  | "Suivi des encaissements (Wave/OM/Espèces)"
  | "Statistiques d'activité mensuelles"
  | "Jusqu'à 5 comptes Médecins"
  | "Gestion du stock & Pharmacie"
  | "Support prioritaire & Formation sur site"
  | "Marque blanche (Logo Clinique)";

/**
 * Vérifie si le plan actuel de l'utilisateur autorise une fonctionnalité
 * @param featureText Le texte exact de la fonctionnalité dans plans.ts
 * @param userPlanId L'ID du plan ('solo', 'pro', 'clinique')
 */
export function checkPlanFeature(featureText: string, userPlanId: string | null | undefined): boolean {
  if (!userPlanId) return false;

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === userPlanId.toLowerCase());
  if (!plan) return false;

  // On vérifie si la feature est explicitement marquée comme incluse
  const feature = plan.features.find(f => f.text === featureText);
  
  if (feature) return feature.included;

  // Logique d'héritage (le pack PRO inclut tout le pack SOLO)
  if (userPlanId.toLowerCase() === "pro" || userPlanId.toLowerCase() === "clinique") {
      const soloPlan = SUBSCRIPTION_PLANS.find(p => p.id === "solo");
      const inheritedFeature = soloPlan?.features.find(f => f.text === featureText);
      if (inheritedFeature?.included) return true;
  }

  return false;
}

/**
 * Formate un prix en FCFA proprement (Sénégal)
 */
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF", // Code ISO pour le Franc CFA
    maximumFractionDigits: 0,
  }).format(amount).replace("XOF", "FCFA");
}
