# Gynaeasy — Contexte Projet pour Claude

## Stack technique
- **Next.js 14** App Router + Server Actions (`"use server"`)
- **Prisma ORM** + PostgreSQL (Supabase)
- **NextAuth.js** session auth (JWT strategy)
- **Africa's Talking API** (SMS Sénégal — tous opérateurs)
- **Coolify** self-hosted sur Hetzner (162.55.162.230) — app UUID `gi7hqgqn9mbaauvn33nv5uf5`
- **AES-256-GCM** (`lib/encryption.ts`) pour données sensibles
- **react-big-calendar** pour l'agenda
- **Zustand** pour les drafts consultation (localStorage)

## Utilisateur
- GitHub: `techbadji` — plan **Pro**
- Compte Africa's Talking : `digitalmatis8@gmail.com`
- Langue de travail: **français** (réponses en français ou anglais selon la question)

---

## Thème couleur

Le thème principal est **violet** (`violet-600` / `#7c3aed`).  
Le rose (`pink-600`) ne doit plus apparaître dans l'UI applicative.  
Exceptions acceptées : gradient décoratif `from-violet-600 to-pink-600` sur le bouton Super Admin uniquement.  
`indigo` ne doit pas non plus apparaître dans l'UI — toujours remplacer par `violet`.

---

## Africa's Talking SMS API

### Variables d'environnement (Coolify)
| Variable | Description |
|---|---|
| `AT_API_KEY` | Clé API — Settings → API Key dans le dashboard AT |
| `AT_USERNAME` | Nom du compte AT (`sandbox` en dev, nom réel en prod) |
| `AT_SENDER_ID` | Optionnel — Sender ID validé par AT (ex: `GynEasy`) |

### Format de la requête
```
POST https://api.africastalking.com/version1/messaging
Headers:
  apiKey: {AT_API_KEY}
  Content-Type: application/x-www-form-urlencoded
  Accept: application/json

Body (x-www-form-urlencoded):
  username={AT_USERNAME}&to=+221XXXXXXXXX&message=...&from={AT_SENDER_ID}
```

### Réponse
```json
{
  "SMSMessageData": {
    "Message": "Sent to 1/1 Total Cost: XOF 30",
    "Recipients": [{
      "statusCode": 101,
      "number": "+221XXXXXXXXX",
      "status": "Success",
      "messageId": "ATXid_...",
      "messageParts": 1
    }]
  }
}
```

### Codes de statut AT
- `100` Processed / `101` Sent / `102` Queued → succès
- `405` Solde insuffisant → recharger le compte AT
- `406` Compte sandbox → enregistrer le numéro de test dans le dashboard AT

### Mode sandbox → production
1. Dashboard AT → Settings → changer `username` de `sandbox` au nom du compte
2. Mettre à jour `AT_USERNAME` sur Coolify
3. Valider un Sender ID si souhaité (délai ~3 jours)
4. **Aucun changement de code nécessaire**

### Numérotation
- `normalizePhoneNumber()` dans `lib/sms.ts` gère `+221`, `00221`, `0XX`, local
- Africa's Talking exige le format E.164 avec `+` : `+221XXXXXXXXX`
- Couvre **tous les opérateurs** : Orange, Free, Expresso

---

## Architecture rappels SMS & Communications

- `lib/sms.ts` — service bas niveau Africa's Talking (simulation auto si clés absentes)
- `lib/whatsapp.ts` — service WhatsApp Business API (simulation si non configuré)
- `app/actions/reminders.ts` — rappels RDV, broadcast SMS/WhatsApp, liste rappels par date
- `app/(protected)/sms/page.tsx` — page Communications SMS (médecin + secrétaire)
- `components/sms/sms-broadcast.tsx` — rappels + broadcast + templates + envoi direct 1:1
- `app/api/reminders/cron/route.ts` — endpoint cron sécurisé par `CRON_SECRET`
- `components/admin/super/app-settings.tsx` — test SMS (Super Admin)

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
| `app/actions/subscription.ts` | Suppression `console.log("DEBUG UPGRADE:", ...")` |
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
| `AT_API_KEY` | SMS réels Africa's Talking (simulation si absent) |
| `AT_USERNAME` | Nom du compte AT (`sandbox` par défaut) |
| `AT_SENDER_ID` | Sender ID validé AT (optionnel) |
| `SMTP_HOST/USER/PASS` | Emails réels (simulation logs si absent) |
| `CRON_SECRET` | Sécurisation endpoint `/api/reminders/cron` |
| `WHATSAPP_API_TOKEN` | WhatsApp Business (simulation si absent) |

- Branche `main` → déploiement automatique sur Coolify
- App UUID Coolify : `gi7hqgqn9mbaauvn33nv5uf5`
