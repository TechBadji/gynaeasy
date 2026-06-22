# Gynaeasy — Documentation complète des fonctionnalités

> Logiciel de gestion pour cabinets de gynécologie et de maternité — HDS Sénégal
> Stack : Next.js 14 · Prisma · PostgreSQL · NextAuth · Orange SMS · Meta WhatsApp API

---

## Dernières améliorations (Juin 2026)

### Tableau de bord — refonte complète

- **Salutation personnalisée** avec heure du jour et rôle (Dr. / Secrétaire)
- **4 KPI cards** avec tendances vs hier : Patients, RDV aujourd'hui, Grossesses, CA du jour
- **NextAppointmentCard** : prochain patient en gradient violet, countdown dynamique (Dans X min / En cours)
- **GrossessesProches** : widget termes <30j avec code couleur (rouge ≤7j, amber ≤14j, bleu ≤30j)
- **AlertsList** redesignée en client component : mark as read individuel, "Tout lu", icônes par type
- **UpcomingAppointments** : code couleur par type, badge règlement (Réglé/En attente), source online/phone
- **Vue Secrétaire** : section dédiée avec QuickRdvSearch + SmsRemindersCard + raccourcis rapides
- Toutes les queries en `Promise.all` pour performances maximales

### Agenda — refonte complète

- **Navigation custom** (barre propre, views en pills : Jour/Semaine/Mois/Planning)
- **Pré-remplissage automatique** date + heure au clic sur un créneau du calendrier
- **Sélecteur de type visuel** : pills colorées par type (Consultation/Échographie/Suivi/Urgence/Téléconsult)
- **Durée en pills** (15/30/45/60/90 min)
- **Modal détail enrichi** : en-tête coloré par type, source, date/heure/durée, motif, lien dossier patient
- **Annulation 2 étapes** inline (plus de `window.confirm()`)
- **Légende** en bas du calendrier + aide contextuelle
- **Stats header** : RDV aujourd'hui, cette semaine, prochain RDV countdown
- **Correction critique** : les RDV n'étaient pas filtrés par médecin → tous les médecins voyaient tout

### Communications SMS — nouvelle page `/sms`

- **Onglet Rappels RDV** : sélecteur de date, compteur de rappels en attente, envoi en masse
- **Onglet Broadcast** : sélection multiple patients avec checkbox, recherche, masquage téléphone
- **Multi-canal** : SMS Orange + WhatsApp en parallèle ou séparément
- **Liens WhatsApp directs** par patient (sans API)
- **Confirmation 2 étapes** avant envoi groupé
- **Endpoint cron** `/api/reminders/cron` sécurisé par `CRON_SECRET`

### Super Administration — améliorations

- **Gestion codes promo** : types POURCENTAGE/MONTANT_FIXE, limite usage, date expiration, ciblage par plan, tracking usages
- **Campagnes publicitaires** : 6 thèmes de couleur, prévisualisation live, métriques CTR/impressions/clics, ciblage par plan
- **Tarification** : prix mensuel + annuel avec % remise auto, features éditables par plan, stats CA/abonnés
- **Codes promo côté médecin** : saisie promo dans la page abonnement avec feedback immédiat

### Bugs corrigés (session Juin 2026)

| Fichier | Bug | Fix |
| --- | --- | --- |
| `app/actions/reminders.ts` | `userId` utilisé au lieu de `treatingDoctorId` (leak inter-médecins) | Corrigé |
| `app/actions/reminders.ts` | `(prisma.consultation as any)` inutile depuis migration schema | Supprimé |
| `app/(protected)/agenda/page.tsx` | Toutes les consultations chargées sans filtre médecin | Corrigé |
| `middleware.ts` | Route `/offline` bloquée par l'auth guard (PWA cassée) | Ajout exclusion |
| `app/(protected)/sms/page.tsx` | Double padding `p-6` (layout + page) | Supprimé |
| `app/layout.tsx` · `manifest.json` | `themeColor` rose au lieu de violet | Corrigé |
| `sidebar-nav.tsx` · `sms-broadcast.tsx` | Couleurs `pink-*` résiduelles | Migrées en `violet-*` |
| `app/(protected)/layout.tsx` | 7 imports lucide inutilisés | Nettoyés |

---

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Rôles et permissions](#2-rôles-et-permissions)
3. [Authentification & Sécurité](#3-authentification--sécurité)
4. [Tableau de bord](#4-tableau-de-bord)
5. [Gestion des patients](#5-gestion-des-patients)
6. [Agenda & Rendez-vous](#6-agenda--rendez-vous)
7. [Consultations & Actes médicaux](#7-consultations--actes-médicaux)
8. [Grossesses](#8-grossesses)
9. [Documents médicaux](#9-documents-médicaux)
10. [Facturation & Paiements](#10-facturation--paiements)
11. [Imagerie médicale](#11-imagerie-médicale)
12. [Stocks & Inventaire](#12-stocks--inventaire)
13. [Communications SMS & WhatsApp](#13-communications-sms--whatsapp)
14. [Notifications in-app](#14-notifications-in-app)
15. [Abonnements & Plans tarifaires](#15-abonnements--plans-tarifaires)
16. [Prise de rendez-vous en ligne (public)](#16-prise-de-rendez-vous-en-ligne-public)
17. [Paramètres cabinet & profil](#17-paramètres-cabinet--profil)
18. [Super Administration (SaaS)](#18-super-administration-saas)
19. [Statistiques](#19-statistiques)
20. [PWA & Mode hors-ligne](#20-pwa--mode-hors-ligne)
21. [Emails automatiques](#21-emails-automatiques)
22. [API & Intégrations](#22-api--intégrations)
23. [Modèle de données](#23-modèle-de-données)

---

## 1. Vue d'ensemble

Gynaeasy est un logiciel SaaS de gestion de cabinet de gynécologie conçu pour le marché sénégalais. Il couvre l'intégralité du parcours patient — de la prise de rendez-vous en ligne à la facturation — avec des intégrations natives SMS (Orange Sénégal) et WhatsApp (Meta Cloud API).

### Accès

| Type | URL | Audience |
|---|---|---|
| Application protégée | `/dashboard` et sous-routes | Médecins, secrétaires, admins |
| Booking public | `/booking` | Patients |
| Onboarding médecin | `/onboarding` | Nouveaux médecins |
| Super Admin | `/admin/super` | Administrateurs SaaS |

---

## 2. Rôles et permissions

### MEDECIN

| Fonctionnalité | Accès |
|---|---|
| Ses propres patients | ✅ Complet |
| Patients d'un autre médecin | ✅ Sur demande d'accès approuvée (24h) |
| Agenda | ✅ Complet |
| Consultations | ✅ Ses consultations uniquement |
| Facturation | ✅ Ses réglements uniquement |
| Imagerie | ✅ Si module activé par admin |
| Inventaire | ✅ Lecture + consommation |
| SMS groupé | ✅ Ses patients uniquement |
| WhatsApp groupé | ✅ Ses patients uniquement |
| Statistiques | ✅ Ses données |
| Paramètres | ✅ Son profil + son cabinet |
| Abonnement | ✅ Son abonnement |

### SECRETAIRE

| Fonctionnalité | Accès |
|---|---|
| Agenda | ✅ Tous les RDV |
| Patients | ✅ Tous les patients |
| Facturation | ✅ |
| SMS groupé | ✅ Tous les patients |
| WhatsApp groupé | ✅ Tous les patients |
| Imagerie | ❌ Non accessible |
| Statistiques | ❌ Non accessible |
| Paramètres compte | ❌ Limité |
| Abonnement | ❌ Non accessible |
| Super Admin | ❌ Non accessible |

### ADMIN (Super Admin SaaS)

Accès complet à toutes les données et fonctionnalités de la plateforme — gestion des comptes, abonnements, CCAM, logs d'audit, publicités partenaires, paramètres globaux.

---

## 3. Authentification & Sécurité

### Connexion
- Email + mot de passe (bcrypt)
- Authentification à deux facteurs **TOTP** (Google Authenticator, Authy, etc.)
- Session JWT (durée : 30 jours)
- Banner d'encouragement à activer la 2FA si elle n'est pas activée

### Inscription médecin (onboarding)
- Formulaire : nom, email, cabinet, spécialité, plan souhaité
- **Vérification email** obligatoire (lien valable 48h)
- Renvoi du lien de vérification depuis la page d'erreur
- Approbation manuelle par l'admin ou automatique selon la configuration
- Envoi des identifiants par email après approbation
- **Rate limiting** : 5 inscriptions / heure / IP

### Réinitialisation de mot de passe
- Lien de reset envoyé par email (token valable 1h)
- **Rate limiting** : 5 demandes / heure / IP, échec silencieux
- Changement de mot de passe forcé au premier login (`mustChangePassword`)

### Chiffrement des données
- **AES-256-GCM** pour les données sensibles (`lib/encryption.ts`)
- Clé obligatoire au démarrage — crash intentionnel si absente ou invalide

### Logs d'audit
- Toutes les actions sensibles sont tracées : connexions réussies/échouées, 2FA, accès patients, modifications
- Chaque entrée : userId · action · patientId · détails JSON · IP · horodatage

### Contrôle d'accès aux données
- Les données patient sont protégées par `userId` (médecin traitant)
- Accès tiers via `AccessRequest` avec approbation et expiration configurable (24h par défaut)
- Les patients peuvent être marqués `isPublic` pour un accès élargi
- Consentement RGPD : `consentementRGPD` + date de signature

---

## 4. Tableau de bord

### Vue MEDECIN
- **Patients total** — nombre de patients enregistrés
- **Consultations du jour** — RDV planifiés aujourd'hui
- **Grossesses en cours** — suivi actif
- **Recettes du jour** — total des réglements journaliers
- **Prochains rendez-vous** — liste des RDV à venir
- **Demandes d'accès en attente** — accès aux dossiers patients d'un autre médecin
- **Alertes** — stocks bas, notifications importantes

### Vue SECRETAIRE
- Mêmes indicateurs globaux
- **Recherche rapide de RDV** par nom de patient
- **Carte rappels SMS** — nombre de rappels en attente pour demain + bouton d'envoi

---

## 5. Gestion des patients

### Dossier patient
Chaque patient dispose d'un **code patient unique à 5 chiffres** généré automatiquement.

**Données enregistrées :**
- Civilité (Mme / Mlle / M)
- Nom, prénom, date de naissance
- Téléphone, email, adresse
- Groupe sanguin + rhésus
- Antécédents médicaux (JSON structuré)
- Traitements en cours
- Médecin traitant
- Consentement RGPD

### Accès multi-médecins
- Un médecin peut demander l'accès au dossier d'un patient géré par un collègue
- Le médecin traitant reçoit une notification + email
- L'accès est accordé pour une durée déterminée (24h par défaut)
- L'accès peut être refusé ou révoqué

### Recherche
- Par nom, prénom, code patient (5 chiffres)
- Filtré par `userId` pour le médecin (ses patients uniquement)
- Tous patients pour la secrétaire/admin

---

## 6. Agenda & Rendez-vous

### Calendrier
- Vue jour / semaine / mois
- Affichage de tous les RDV avec horaire, durée, type, patient

### Création de RDV
- Sélection du patient (existant ou création en ligne)
- Date, heure, durée (en minutes)
- Type : `CONSULTATION` · `ECHOGRAPHIE` · `URGENCE` · `SUIVI_GROSSESSE` · `TELECONSULTATION`
- Source : `PHONE` (cabinet) ou `ONLINE` (booking public)
- Motif libre

### Annulation de RDV
- Annulation depuis l'agenda
- Envoi automatique de notifications : **SMS** + **WhatsApp** + **Email** au patient

---

## 7. Consultations & Actes médicaux

### Données cliniques
- **Données médicales** en JSON libre (structuré par le médecin)
- Diagnostic, notes, observations

### Actes CCAM
- Association de codes CCAM à chaque consultation
- Tarif applicable + coefficient + remboursement par acte
- Catalogue CCAM géré par l'admin (codes, libellés, tarifs, chapitres)

### Accès aux consultations
- Un médecin ne voit que ses propres consultations
- La secrétaire voit toutes les consultations pour la facturation

---

## 8. Grossesses

- Déclaration d'une grossesse avec **DDR** (date des dernières règles)
- **DPA calculée automatiquement** (DDR + 280 jours)
- Statuts : `EN_COURS` · `TERMINÉE` · `ARRÊTÉE`
- Notes libres
- Tableau de suivi par patient
- Compteur "grossesses actives" sur le dashboard

---

## 9. Documents médicaux

### Types de documents
`ORDONNANCE` · `CERTIFICAT` · `COURRIER` · `RESULTAT_LABO` · `ECHOGRAPHIE` · `FEUILLE_SOIN` · `AUTRE`

### Fonctionnalités
- Upload et stockage par patient
- Métadonnées libres (JSON)
- **Génération PDF d'ordonnance** via `/api/documents/ordonnance` (données réelles du patient + médecin depuis la base)
- Accès depuis le dossier patient

---

## 10. Facturation & Paiements

### Modes de paiement acceptés
`ESPECES` · `CHEQUE` · `CB` · `VIREMENT` · `SANTE` · `WAVE` · `ORANGE_MONEY`

### Statuts de règlement
`EN_ATTENTE` · `PAYÉ` · `ANNULÉ` · `REMBOURSÉ`

### Fonctionnalités
- Enregistrement d'un règlement lié à une consultation
- Vérification de propriété (le médecin ne peut régler que ses propres consultations)
- Historique des règlements récents
- Consultations en attente de paiement
- Référence de paiement + URL feuille de soins

### Factures plateforme
- Factures mensuelles d'abonnement Gynaeasy (FactureHote)
- Numéro unique, période, montant HT/TVA/TTC, statut

---

## 11. Imagerie médicale

> Module optionnel — activé par l'admin pour chaque compte médecin

- Enregistrement de rapports d'échographie (description + métadonnées)
- Lien avec la consultation correspondante
- Documents de type `ECHOGRAPHIE` dans le dossier patient
- Consommation de matériel de stock (sonde, gel, etc.) lors de l'acte
- Accès aux paramètres du cabinet depuis ce module

---

## 12. Stocks & Inventaire

### Gestion des articles
- Création / modification / suppression d'articles
- Champs : nom, catégorie, quantité, unité, seuil d'alerte
- Date de dernière modification automatique

### Consommation
- Décrémentation de stock lors d'un acte (imagerie, etc.)
- Alerte si quantité < seuil d'alerte (affiché sur le dashboard)

---

## 13. Communications SMS & WhatsApp

### SMS — Orange Sénégal (OneAPI)

**Envois automatiques :**
| Événement | Déclencheur |
|---|---|
| Confirmation de RDV (booking public) | Création d'un RDV en ligne |
| Annulation de RDV | Annulation depuis l'agenda |
| Rappel J-1 | Cron quotidien ou déclenchement manuel |

**Rappels RDV (page `/sms` — onglet "Rappels RDV") :**
- Sélecteur de date avec navigation
- Compteur de rappels en attente
- Envoi en un clic
- Automatisable via le cron endpoint (voir section API)

**Message groupé (page `/sms` — onglet "Message groupé") :**
- Liste de patients filtrée par rôle (médecin → ses patients, secrétaire/admin → tous)
- Recherche par nom
- Sélection individuelle ou "Tout sélectionner"
- Composeur de message avec compteur de caractères (160 / 320 / 480 = 1 / 2 / 3 SMS)
- Indicateur du nombre de SMS total (nb destinataires × nb SMS par message)
- Confirmation avant envoi
- Rapport : SMS envoyés / échecs

**Normalisation des numéros :**
Gère automatiquement : `+221XXXXXXX`, `00221XXXXXXX`, `77XXXXXXX`, `0XXXXXXX`

**Solde Orange :**
- Consultation du solde de SMS disponibles (contrats actifs)
- Date d'expiration du contrat
- Nombre de SMS consommés
- Depuis la page Super Admin → Paramètres application

### WhatsApp — Meta Cloud API (v25.0)

**Envoi direct individuel :**
- Bouton WhatsApp (icône verte) dans chaque ligne de la liste patients
- Ouvre `wa.me/{numéro}` dans le navigateur → conversation directe sans API

**Envoi groupé via API :**
- Canal sélectionnable dans le composeur : **SMS** | **WhatsApp** | **SMS + WhatsApp**
- Utilise `sendWhatsApp()` (message texte libre) — nécessite fenêtre de 24h après message entrant
- Utilise `sendWhatsAppTemplate()` pour les broadcasts hors fenêtre (templates approuvés Meta)

**Variables d'environnement requises :**
```
WHATSAPP_API_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
```

**Mode simulation :** si les variables sont absentes, tous les envois retournent `simulated: true` sans erreur.

---

## 14. Notifications in-app

- Cloche dans l'en-tête avec compteur non lus
- Types : `INFO` · `SUCCESS` · `WARNING` · `ERROR` · `URGENT`
- Marquage individuel ou global "tout lu"
- Lien optionnel (ex: vers la demande d'accès)
- 20 dernières notifications affichées

**Déclencheurs automatiques :**
- Nouvelle demande d'accès à un dossier patient
- Approbation d'une demande d'accès
- Nouveau médecin en attente d'approbation (admin)
- Demande de changement de plan

---

## 15. Abonnements & Plans tarifaires

### Plans disponibles

| Plan | Prix/mois | Cible |
|---|---|---|
| **SOLO** | 25 000 FCFA | Médecin seul |
| **PRO** | 50 000 FCFA | Cabinet avec secrétaire |
| **CLINIQUE** | 95 000 FCFA | Clinique multi-médecins |

### SOLO — 25 000 FCFA/mois
- Agenda & dossier médical spécialisé
- 150 SMS de rappel/mois
- Ordonnances & certificats numériques
- Support WhatsApp
- ❌ Secrétaire, vidéo, statistiques

### PRO — 50 000 FCFA/mois
- Tout SOLO +
- Accès secrétaire illimité
- 500 SMS/mois
- Téléconsultation vidéo HD
- Suivi paiements (Wave / Orange Money)
- Statistiques activité & finances

### CLINIQUE — 95 000 FCFA/mois
- Tout PRO +
- Médecins illimités
- 2 000 SMS/mois
- Assistant IA (rapports automatiques)
- Gestion stock & pharmacie
- Support 24/7 prioritaire
- Développement API sur mesure

### Gestion abonnements (côté utilisateur)
- Visualisation du plan actuel, statut, dates
- Historique des factures mensuelles
- Demande de changement de plan (notifie l'admin)

### Gestion abonnements (côté admin)
- Création / modification de tous les abonnements
- Application de codes promo (pourcentage ou montant fixe)
- Configuration des prix et features par plan
- Synchronisation des plans vers la base de données

---

## 16. Prise de rendez-vous en ligne (public)

Route publique accessible sans authentification : `/booking`

### Flux en 4 étapes
1. **Identification** — saisie du code patient à 5 chiffres
2. **Spécialiste** — sélection du médecin parmi les médecins actifs
3. **Rendez-vous** — sélection de la date (7 prochains jours) et du créneau (30 min, 8h–18h)
4. **Confirmation** — récapitulatif + envoi SMS + WhatsApp + Email

### Sécurités
- Validation que le médecin est actif (`status: ACTIVE`, `role: MEDECIN`)
- Validation que le créneau est dans le futur
- Types autorisés : `CONSULTATION` et `URGENCE` uniquement
- Créneaux occupés masqués (affichés en opacité réduite)

---

## 17. Paramètres cabinet & profil

### Informations du cabinet
- Nom du cabinet, adresse, téléphone, email, slogan, logo
- Partagé entre le médecin et sa secrétaire

### Profil utilisateur
- Nom, spécialité, disponibilité urgences (`isEmergencyAvailable`)
- Photo de profil (base64)
- Changement de mot de passe (confirmation du mot de passe actuel requis)

### Sécurité (onglet dédié)
- Activation / désactivation de la 2FA
- Affichage du QR code TOTP
- Vérification du code avant activation

---

## 18. Super Administration (SaaS)

Route `/admin/super` — accès ADMIN uniquement.

### Tableau de bord global
- Utilisateurs totaux / actifs
- Patients totaux
- Consultations totales
- Abonnements actifs / revenus mensuels

### Gestion des utilisateurs
- Liste paginée (100 par page)
- Création manuelle avec rôle et mot de passe
- Modification du rôle (`MEDECIN` / `SECRETAIRE` / `ADMIN`)
- Activation / blocage / suppression (impossible si données médicales existent)
- Activation / désactivation de modules par compte (`IMAGERIE`, etc.)
- Approbation des inscriptions en attente
- Envoi des identifiants par email après approbation

### Gestion des abonnements
- Liste de tous les abonnements (200 max)
- Création / modification / application de promo
- Statuts : `ACTIF` · `ANNULÉ` · `EXPIRÉ`

### Catalogue CCAM
- Liste de tous les actes médicaux
- Modification du tarif, coefficient, libellé, statut actif/inactif

### Codes promotionnels
- Création avec type (`POURCENTAGE` / `MONTANT_FIXE`), valeur, date d'expiration, limite d'usage
- Activation / désactivation / suppression

### Publicités partenaires
- Création de campagnes (partenaire, titre, description, image, lien, période, prix/jour)
- Calcul automatique du prix total
- Statuts : `ACTIF` · `PAUSE` · `TERMINÉ`
- Affichage sur la page abonnement des médecins

### Logs d'audit
- 30 derniers événements
- Filtres par utilisateur, action, IP

### Paramètres globaux
- Nom, adresse, téléphone, email de la plateforme
- `requireApproval` — approbation manuelle obligatoire pour les nouveaux médecins

---

## 19. Statistiques

Route `/statistiques` — accès MEDECIN uniquement.

- Indicateurs clés d'activité (KPIs)
- Rendu côté client
- Données filtrées par utilisateur connecté

---

## 20. PWA & Mode hors-ligne

L'application est installable sur mobile et desktop (Progressive Web App).

### Capacités PWA
- Installable sur Android (prompt d'installation natif) et iOS (Ajouter à l'écran d'accueil)
- Mode **standalone** (sans barre de navigation du navigateur)
- Icônes 192×192 et 512×512 (any + maskable)
- Couleur de thème : `#ec4899` (rose)
- Fond : `#0a0f1e` (bleu nuit)

### Raccourcis (shortcuts)
- Agenda → `/agenda`
- Patients → `/patients`
- Facturation → `/facturation`

### Mode hors-ligne
- Page `/offline` servie par le Service Worker si aucune connexion
- Message d'erreur et bouton "Réessayer"

### Service Worker
- Généré par `next-pwa` (Workbox)
- Cache statique des assets
- Fallback document sur `/offline`

---

## 21. Emails automatiques

Tous les emails sont envoyés via `lib/mail.ts` (SMTP configuré).

| Email | Destinataire | Déclencheur |
|---|---|---|
| Vérification email | Nouveau médecin | Inscription |
| Identifiants de connexion | Médecin approuvé | Approbation admin |
| Nouvelle demande d'accès dossier | Médecin traitant | Demande d'accès |
| Confirmation RDV | Patient | Booking public |
| Annulation RDV | Patient | Annulation agenda |
| Réinitialisation mot de passe | Utilisateur | Mot de passe oublié |
| Notification approbation admin | Admin | Nouveau médecin vérifié |

---

## 22. API & Intégrations

### Endpoints API internes

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | — | Callbacks NextAuth |
| `/api/documents/ordonnance` | GET | Session | Génère le PDF d'ordonnance |
| `/api/reminders/cron` | GET | Bearer CRON_SECRET | Déclenche les rappels SMS du lendemain |
| `/api/reminders/sms` | POST | Session + rate limit | Envoi SMS ad hoc |

### Cron automatique (rappels RDV)

Configuration recommandée sur **cron-job.org** (gratuit) :

```
URL    : https://votre-domaine.com/api/reminders/cron
Méthode: GET
Header : Authorization: Bearer {CRON_SECRET}
Horaire: Chaque jour à 20h00
```

### Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL PostgreSQL |
| `NEXTAUTH_SECRET` | Secret NextAuth (JWT) |
| `NEXTAUTH_URL` | URL publique de l'app |
| `ENCRYPTION_KEY` | 64 caractères hex (AES-256-GCM) |
| `ORANGE_SMS_CLIENT_ID` | Client ID Orange Developer |
| `ORANGE_SMS_CLIENT_SECRET` | Client Secret Orange |
| `ORANGE_SMS_SENDER_NUMBER` | Numéro expéditeur (+221...) |
| `ORANGE_SMS_SENDER_NAME` | Nom affiché (optionnel, si validé Orange) |
| `WHATSAPP_API_TOKEN` | Token Meta Business API |
| `WHATSAPP_PHONE_NUMBER_ID` | ID numéro WhatsApp Business |
| `SMTP_HOST` | Serveur email |
| `SMTP_PORT` | Port SMTP |
| `SMTP_USER` | Utilisateur SMTP |
| `SMTP_PASS` | Mot de passe SMTP |
| `CRON_SECRET` | Secret pour l'endpoint cron |
| `NEXT_PUBLIC_APP_URL` | URL publique (Server Actions CORS) |

---

## 23. Modèle de données

### Entités principales

```
User (médecin / secrétaire / admin)
  └── Patient (dossier patient)
        ├── Consultation (RDV + données médicales)
        │     ├── ConsultationActe (actes CCAM)
        │     └── Reglement (paiement)
        ├── Grossesse (suivi de grossesse)
        ├── Document (ordonnances, échographies, etc.)
        └── AccessRequest (accès multi-médecins)
  └── Abonnement (plan SaaS)
  └── FactureHote (factures plateforme)
  └── Notification (alertes in-app)
  └── AuditLog (traçabilité)

StockItem (inventaire cabinet)
ActeCCAM (catalogue d'actes médicaux)
ClinicSettings (paramètres cabinet — singleton)
PlanConfig (configuration des plans tarifaires)
Promotion (codes promo)
Advertisement (publicités partenaires)
```

### Enums clés

| Enum | Valeurs |
|---|---|
| Role | MEDECIN · SECRETAIRE · ADMIN |
| TypeRDV | CONSULTATION · ECHOGRAPHIE · URGENCE · SUIVI_GROSSESSE · TELECONSULTATION |
| ModePaiement | ESPECES · CHEQUE · CB · VIREMENT · SANTE · WAVE · ORANGE_MONEY |
| PlanAbonnement | SOLO · PRO · CLINIQUE |
| AccountStatus | PENDING_VERIFICATION · PENDING_APPROVAL · ACTIVE · BLOCKED |
| StatutGrossesse | EN_COURS · TERMINEE · ARRETEE |
| TypeDocument | ORDONNANCE · CERTIFICAT · COURRIER · RESULTAT_LABO · ECHOGRAPHIE · FEUILLE_SOIN · AUTRE |

---

*Dernière mise à jour : Mai 2026 — Gynaeasy v1.x*
