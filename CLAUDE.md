# Gynaeasy — Contexte Projet pour Claude

## Stack technique
- **Next.js 14** App Router + Server Actions (`"use server"`)
- **Prisma ORM** + PostgreSQL (Supabase)
- **NextAuth.js** session auth (JWT strategy)
- **Orange Developer API** (OneAPI SMS) pour Sénégal
- **Coolify** self-hosted sur Hetzner (162.55.162.230) — app UUID `gi7hqgqn9mbaauvn33nv5uf5`
- **AES-256-GCM** (`lib/encryption.ts`) pour données sensibles
- **react-big-calendar** pour l'agenda
- **Zustand** pour les drafts consultation (localStorage)

## Utilisateur
- GitHub: `techbadji` — plan **Pro**
- Langue de travail: **français** (réponses en français ou anglais selon la question)

---

## Thème couleur

Le thème principal est **violet** (`violet-600` / `#7c3aed`).  
Le rose (`pink-600`) ne doit plus apparaître dans l'UI applicative.  
`indigo` ne doit pas non plus apparaître dans l'UI — toujours remplacer par `violet`.  
Exceptions acceptées : gradient décoratif `from-violet-600 to-pink-600` sur le bouton Super Admin uniquement.

---

## Orange SMS API

### Configuration actuelle (Coolify env)

| Variable | Description |
|---|---|
| `ORANGE_SMS_CLIENT_ID` | Client ID Orange Developer |
| `ORANGE_SMS_CLIENT_SECRET` | Client Secret Orange Developer |
| `ORANGE_SMS_SENDER_NUMBER` | Expéditeur (ex: `+221XXXXXXXXX` long number ou `326742` short code) |
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

Les credentials actuels sont en **mode sandbox Orange**. L'API accepte les requêtes (201 OK) mais **ne délivre pas les SMS** sur un vrai téléphone.

**Action requise** :

1. Aller sur [https://developer.orange.com](https://developer.orange.com)
2. Mon App → SMS Messaging API → **Demander l'accès production**
3. Mettre à jour `ORANGE_SMS_CLIENT_ID` et `ORANGE_SMS_CLIENT_SECRET` sur Coolify
4. **Aucun changement de code nécessaire**

### Stats SMS (Super Admin)

- Dashboard : `components/admin/super/app-settings.tsx`
- Action : `app/actions/reminders.ts` → `getOrangeSMSStats()`
- L'API Orange retourne les contrats comme **tableau direct** `[{...}]` (pas imbriqué)
- `availableUnits` = somme des contrats ACTIVE

---

## Architecture rappels SMS & Communications

- `lib/sms.ts` — service bas niveau (auth token Orange + envoi)
- `lib/whatsapp.ts` — service WhatsApp Business API (simulation si non configuré)
- `app/actions/reminders.ts` — rappels RDV, broadcast SMS/WhatsApp, stats Orange, liste par date
- `app/(protected)/sms/page.tsx` — page Communications SMS (médecin + secrétaire)
- `components/sms/sms-broadcast.tsx` — rappels + broadcast + templates + envoi direct 1:1
- `app/api/reminders/cron/route.ts` — endpoint cron sécurisé par `CRON_SECRET`
- `components/admin/super/app-settings.tsx` — test SMS + solde (Super Admin)

---

## Ownership patients — règle critique

Le lien médecin ↔ patient passe par **`Patient.treatingDoctorId`** (pas `Patient.userId`).  
Toujours filtrer par `treatingDoctorId: userId` pour les requêtes patient d'un médecin.  
`Patient.userId` est un champ secondaire (créateur initial), ne pas l'utiliser pour le filtrage métier.

---

## Fixes de sécurité appliqués

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
| `app/actions/reminders.ts` | Filtre `treatingDoctorId` (corrige leak inter-médecins) |
| `middleware.ts` | Route `/offline` exclue du guard d'auth (PWA fallback) |

---

## Schéma Prisma notable

- `Consultation.smsReminded: Boolean` — évite les doublons de rappel SMS
- `Consultation.donneesMedicales: Json` — données médicales libres (constantes, écho, etc.)
- `Patient.treatingDoctorId` — médecin traitant principal (relation "TreatingDoctor")
- `Patient.telephone` — nullable (requis pour SMS)
- `Promotion` + `PromoUsage` — codes promo avec tracking par utilisateur
- `Advertisement` — campagnes pub partenaires (clicks + impressions trackés)
- `PlanConfig` — config tarifaire éditable par le Super Admin (prixMensuel + prixAnnuel)

---

## Déploiement Coolify

### Variables d'environnement obligatoires

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL avec `?sslmode=require` |
| `ENCRYPTION_KEY` | 64 chars hex — crash au démarrage si invalide |
| `NEXTAUTH_URL` | URL publique (ex: `https://gynaeasy.digitalmatis.com`) |
| `NEXTAUTH_SECRET` | Secret JWT (min 32 chars) |
| `NEXT_PUBLIC_APP_URL` | Même valeur que NEXTAUTH_URL |

### Variables optionnelles mais importantes

| Variable | Description |
| --- | --- |
| `ORANGE_SMS_CLIENT_ID/SECRET` | SMS réels (sandbox OK sans) |
| `SMTP_HOST/USER/PASS` | Emails réels (simulation logs si absent) |
| `CRON_SECRET` | Sécurisation endpoint `/api/reminders/cron` |
| `WHATSAPP_API_TOKEN` | WhatsApp Business (simulation si absent) |

- Branche `main` → déploiement automatique sur Coolify
- App UUID Coolify : `gi7hqgqn9mbaauvn33nv5uf5`
- Build : `NODE_OPTIONS='--max-old-space-size=3072'` (Hetzner ~4 Go RAM)
