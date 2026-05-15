# Gynaeasy — Contexte Projet pour Claude

## Stack technique
- **Next.js 14** App Router + Server Actions (`"use server"`)
- **Prisma ORM** + PostgreSQL (Supabase)
- **NextAuth.js** session auth
- **Orange Developer API** (OneAPI SMS) pour Sénégal
- **Vercel** pour le déploiement
- **AES-256-GCM** (`lib/encryption.ts`) pour données sensibles

## Utilisateur
- GitHub: `techbadji` — plan **Pro**
- Projet Vercel lié: `gynaeasy`
- Langue de travail: **français** (réponses en français ou anglais selon la question)

---

## Orange SMS API

### Configuration actuelle (`.env` / Vercel)
| Variable | Description |
|---|---|
| `ORANGE_SMS_CLIENT_ID` | Client ID Orange Developer |
| `ORANGE_SMS_CLIENT_SECRET` | Client Secret Orange Developer |
| `ORANGE_SMS_SENDER_NUMBER` | Expéditeur (ex: `+221326742` short code ou `+221XXXXXXXXX`) |
| `ORANGE_SMS_SENDER_NAME` | Optionnel — nom affiché si validé par Orange |

### Format des requêtes (OneAPI)
```
POST https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B{sender}/requests
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "outboundSMSMessageRequest": {
    "address": "tel:+221XXXXXXXXX",        // string, pas tableau
    "senderAddress": "tel:+221XXXXXXXXX",  // long number
    // OU "tel:326742" pour short code (sans + ni indicatif pays)
    "outboundSMSTextMessage": { "message": "..." }
  }
}
```

### Problèmes résolus
- `address` doit être une **string**, pas un tableau `[]` — Orange renvoie 201 mais n'envoie rien si c'est un tableau
- Short code : format `tel:326742` (avec `tel:`, sans `+`, sans indicatif pays)
- Long number : format `tel:+221XXXXXXXXX`
- Normalisation numéros : `lib/sms.ts` → `normalizePhoneNumber()` gère `+221`, `00221`, `0XX`, local

### Problème restant (non-code)
Les credentials actuels sont en **mode sandbox Orange** (`backend.dck.cloud.orange`). L'API accepte les requêtes (201 OK, unités consommées) mais **ne délivre pas les SMS** sur un vrai téléphone.

**Action requise par le client** :
1. Aller sur [https://developer.orange.com](https://developer.orange.com)
2. Mon App → SMS Messaging API → **Demander l'accès production**
3. Mettre à jour `ORANGE_SMS_CLIENT_ID` et `ORANGE_SMS_CLIENT_SECRET` sur Vercel avec les credentials production
4. **Aucun changement de code nécessaire**

### Stats SMS (Super Admin)
- Dashboard : `components/admin/super/app-settings.tsx`
- Action : `app/actions/reminders.ts` → `getOrangeSMSStats()`
- L'API Orange retourne les contrats comme **tableau direct** `[{...}]` (pas imbriqué)
- `availableUnits` = somme des contrats ACTIVE
- Exemple réponse : `[{ id, type: "SELFSERVICE", country: "SEN", availableUnits: 100, status: "ACTIVE", expirationDate: "2026-05-02T23:59:59.000Z" }]`

---

## Fixes de sécurité appliqués (session précédente)

| Fichier | Fix |
|---|---|
| `app/actions/settings.ts` | SQL injection → `Prisma.sql` + whitelist de clés |
| `app/actions/user.ts` | SQL injection → `prisma.user.update()` + whitelist |
| `app/api/reminders/sms/route.ts` | Ajout auth guard (`getServerSession`) |
| `app/api/documents/ordonnance/route.ts` | Remplacement données hardcodées par fetch DB réel |
| `lib/encryption.ts` | Erreur au démarrage si `ENCRYPTION_KEY` manquante/invalide |
| `app/actions/consultation.ts` | Validation Zod (`z.record(z.string(), z.unknown())`) |
| `app/actions/onboarding.ts` | Erreurs email remontées au lieu d'être silencieuses |
| `lib/auth.ts` | Suppression `console.log("DEBUG PASS:", ...)` |
| `app/actions/subscription.ts` | Suppression `console.log("DEBUG UPGRADE:", ...)` |
| `components/billing/billing-dashboard.tsx` | Suppression console.log debug |
| `components/subscription/pricing-cards.tsx` | `window.location.reload()` → `router.refresh()` |

---

## Architecture rappels SMS
- `lib/sms.ts` — service bas niveau (auth token + envoi)
- `app/actions/reminders.ts` — actions serveur (rappels quotidiens, test SMS, stats)
- `components/admin/super/app-settings.tsx` — UI Super Admin (test + solde)
- `app/api/reminders/sms/route.ts` — endpoint API (cron ou appel externe)

## Schéma Prisma notable
- `Consultation` a un champ `smsReminded: Boolean` pour éviter les doublons
- `Consultation` a un champ `donneesMedicales: Json` (données médicales libres)
- Patients ont `telephone` nullable

---

## Déploiement Vercel
- Branche `main` → déploiement automatique
- Variables d'environnement à configurer : `ORANGE_SMS_*`, `ENCRYPTION_KEY` (64 hex chars), `DATABASE_URL`, `NEXTAUTH_*`
- `ENCRYPTION_KEY` invalide = crash au démarrage (voulu — fail fast)
