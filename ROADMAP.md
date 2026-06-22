# Gynaeasy — Roadmap d'amélioration v2

> Plan de mise en place des améliorations identifiées lors de la seconde lecture stratégique
> Horizon : 12 mois — Mai 2026 → Mai 2027
> Stack actuelle : Next.js 14 · Prisma · PostgreSQL · NextAuth · Orange SMS · Meta WhatsApp

---

## Statut Phase 0 — Réalisé (Juin 2026)

Les travaux suivants ont été accomplis avant le démarrage formel de la Phase 1 :

### UX & Dashboard ✅

- Tableau de bord médecin/secrétaire entièrement refondu (KPI trends, prochain patient, alertes interactives)
- Agenda refondu : navigation custom, pré-remplissage slot, pills type, modal détail enrichi, légende
- Page Communications SMS créée (`/sms`) : rappels + broadcast multi-canal (SMS + WhatsApp)

### Super Admin ✅

- Gestion codes promo avec tracking usages + validation côté médecin
- Campagnes publicitaires : tracking impressions/clics, CTR, 6 thèmes, ciblage par plan
- Tarification dynamique : prix mensuel + annuel éditable, % remise auto, stats CA par plan

### Qualité & Corrections ✅

- **Bug critique corrigé** : filtrage patients par `treatingDoctorId` (était `userId` → leak inter-médecins)
- **PWA corrigée** : route `/offline` exclue du middleware d'auth
- **Thème unifié** : migration complète rose → violet dans tous les composants
- **TypeScript** : 0 erreur sur tout le projet
- `.env.example` mis à jour avec toutes les variables requises et documentées

### Prochaines priorités recommandées (Phase 1)

1. Dossier obstétrical structuré (partogramme, courbes de croissance SA)
2. Portail patient léger (consultation résultats, historique)
3. Alertes cliniques automatiques (suivi grossesse, dépistages)
4. Module téléconsultation (vidéo + notes pendant appel)

---

---

## Table des matières

1. [Vue d'ensemble du plan](#1-vue-densemble-du-plan)
2. [Principes directeurs](#2-principes-directeurs)
3. [Phase 0 — Préparation (2 semaines)](#phase-0--préparation-2-semaines)
4. [Phase 1 — Cœur obstétrical (M1–M3)](#phase-1--cœur-obstétrical-m1m3)
5. [Phase 2 — Engagement patient & WhatsApp (M3–M5)](#phase-2--engagement-patient--whatsapp-m3m5)
6. [Phase 3 — Aide à la décision clinique (M5–M7)](#phase-3--aide-à-la-décision-clinique-m5m7)
7. [Phase 4 — Téléconsultation & laboratoire (M7–M9)](#phase-4--téléconsultation--laboratoire-m7m9)
8. [Phase 5 — Facturation avancée & stocks (M9–M11)](#phase-5--facturation-avancée--stocks-m9m11)
9. [Phase 6 — Statistiques & santé publique (M11–M12)](#phase-6--statistiques--santé-publique-m11m12)
10. [Backlog différé (post v2)](#backlog-différé-post-v2)
11. [Suivi et gouvernance](#suivi-et-gouvernance)

---

## 1. Vue d'ensemble du plan

| Phase | Durée | Thème | Impact métier | Effort |
|---|---|---|---|---|
| **0** | 2 sem. | Préparation, refactor base | Aucun (technique) | M |
| **1** | 3 mois | Cœur obstétrical structuré | ★★★★★ | L |
| **2** | 2 mois | WhatsApp Bot patient + portail léger | ★★★★☆ | M |
| **3** | 2 mois | Alertes cliniques + dépistages | ★★★★☆ | M |
| **4** | 2 mois | Téléconsultation + module labo | ★★★☆☆ | L |
| **5** | 2 mois | Tiers payant IPM + stocks avancés | ★★★★☆ | L |
| **6** | 1 mois | Stats riches + export DHIS2 | ★★★☆☆ | S |

**Légende effort** : S = ≤ 2 sem. · M = 2–6 sem. · L = 6–12 sem.

---

## 2. Principes directeurs

À garder en tête à chaque étape :

1. **Pas de régression** — chaque release passe la suite de tests E2E existante avant déploiement.
2. **Migration douce** — les nouveaux schémas Prisma doivent être backward-compatible (champs nullable, défauts sains).
3. **Feature flags** — chaque nouveauté est activable par cabinet (`ClinicSettings.features.json`) pour pilotage progressif.
4. **Documentation continue** — `FEATURES.md` mis à jour à chaque release ; pas de feature non documentée.
5. **Audit log obligatoire** — toute action sensible logguée dans `AuditLog` dès la première ligne de code.
6. **Mobile-first** — chaque écran testé sur Android entrée de gamme (Tecno/Itel) + connexion 3G simulée Chrome DevTools.
7. **Wolof-ready** — toute chaîne utilisateur passe par i18n (`next-intl`), même si seul le français est livré au début.

---

## Phase 0 — Préparation (2 semaines)

> Objectif : préparer le terrain technique pour les 6 phases suivantes. Aucune feature visible.

### 0.1 Audit technique de l'existant

- [ ] Lancer un audit Lighthouse sur les 10 pages principales — noter les scores Performance / Accessibility / PWA
- [ ] Profiling Prisma : identifier les requêtes N+1 dans les listes patients, agenda, consultations
- [ ] Audit Sentry : intégrer Sentry SDK si pas déjà fait, générer 7 jours de données baseline
- [ ] Inventaire de la dette technique : créer un fichier `TECH_DEBT.md` listant les `TODO`, `FIXME`, hacks

### 0.2 Refactor Consultation (préparatoire à la Phase 1)

Le modèle `Consultation` actuel est monolithique avec un champ `donneesMedicales` en JSON. À séparer :

```prisma
model Consultation {
  id            String   @id @default(cuid())
  patientId     String
  userId        String
  date          DateTime
  type          TypeRDV
  motif         String?
  diagnostic    String?
  notes         String?  @db.Text
  
  // Relations enfants (1-1 selon le type)
  examGyneco       ConsultationGynecoExam?
  cpn              ConsultationCPN?
  contraception    ConsultationContraception?
  
  // Existant
  actes            ConsultationActe[]
  reglement        Reglement?
  
  @@index([userId, date])
  @@index([patientId, date])
}
```

- [ ] Créer la migration Prisma `add_consultation_subtypes`
- [ ] Script de migration : pour chaque consultation existante avec `donneesMedicales`, créer le sous-type correspondant
- [ ] Tester en staging avec un dump de prod (anonymisé)
- [ ] Garder `donneesMedicales` en lecture seule pendant 1 mois (rollback safety)

### 0.3 Infrastructure de jobs (BullMQ + Redis)

Les Phases 2–4 nécessitent des jobs asynchrones (envoi WhatsApp groupé, génération PDF, etc.).

- [ ] Provisionner Redis (Upstash gratuit jusqu'à 10K commandes/jour, ou Redis Cloud)
- [ ] Installer `bullmq` + créer `lib/queue.ts` avec les queues : `sms`, `whatsapp`, `pdf`, `email`, `cron`
- [ ] Migrer les envois SMS actuels (synchrones) vers la queue
- [ ] Dashboard interne `/admin/super/jobs` (bull-board) pour le monitoring

### 0.4 Internationalisation (i18n)

- [ ] Installer `next-intl`
- [ ] Extraire toutes les chaînes UI dans `messages/fr.json`
- [ ] Créer `messages/wo.json` vide (à remplir progressivement)
- [ ] Switcher de langue dans les paramètres profil utilisateur

### 0.5 Feature flags

- [ ] Ajouter `features: Json @default("{}")` sur `ClinicSettings`
- [ ] Créer `lib/features.ts` : `isFeatureEnabled(clinicId, "obstetrique_v2")`
- [ ] Toggles dans le Super Admin pour activer/désactiver par cabinet

**Livrables Phase 0** : code prêt, infra prête, équipe alignée. **Aucune feature utilisateur visible.**

---

## Phase 1 — Cœur obstétrical (M1–M3)

> Objectif : transformer Gynaeasy d'un "outil de gestion de cabinet" en un vrai **EMR gynéco-obstétrique**. C'est la phase la plus critique.

### 1.1 Antécédents obstétricaux structurés (Sem. 1–2)

**Modèle Prisma** :

```prisma
model AntecedentsObstetricaux {
  id              String   @id @default(cuid())
  patientId       String   @unique
  
  // TPAL
  gestite         Int      @default(0)  // G - nb total grossesses
  parite          Int      @default(0)  // P - nb accouchements >= 22 SA
  avortements     Int      @default(0)  // A
  enfantsVivants  Int      @default(0)  // L
  
  // Antécédents détaillés
  grossessesAnterieures  GrossesseAnterieure[]
  
  // Antécédents généraux
  menarche        Int?     // âge des 1ères règles
  cycleRegulier   Boolean?
  cycleDuree      Int?     // jours
  
  updatedAt       DateTime @updatedAt
}

model GrossesseAnterieure {
  id              String   @id @default(cuid())
  annee           Int
  termeSA         Int?     // semaines d'aménorrhée
  modeAccouchement String? // VOIE_BASSE | CESARIENNE | INSTRUMENTALE
  complications   String?
  poidsNaissance  Int?     // grammes
  sexe            String?  // M | F
  vivant          Boolean  @default(true)
  notes           String?
}
```

- [ ] Migration Prisma
- [ ] UI : section "Antécédents" dans le dossier patient (onglet dédié)
- [ ] Composant `<TPALEditor>` avec calcul automatique
- [ ] Liste éditable des grossesses antérieures

### 1.2 Déclaration de grossesse enrichie (Sem. 2–3)

Étendre le modèle `Grossesse` existant :

```prisma
model Grossesse {
  id              String   @id @default(cuid())
  patientId       String
  userId          String   // médecin traitant
  
  ddr             DateTime // date dernières règles
  dpa             DateTime // calculée auto (DDR + 280j)
  echoDatation    DateTime? // si recalibrée par écho T1
  
  // Évaluation initiale du risque
  niveauRisque    NiveauRisque @default(NORMAL) // NORMAL | MODERE | ELEVE
  facteursRisque  Json     @default("[]")
  
  statut          StatutGrossesse @default(EN_COURS)
  notes           String?
  
  cpns            ConsultationCPN[]
  echographies    Echographie[]
  
  // Issue
  dateAccouchement DateTime?
  modeAccouchement String?
  termeAccouchement Int?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum NiveauRisque {
  NORMAL
  MODERE
  ELEVE
}
```

- [ ] Migration
- [ ] Formulaire de déclaration enrichi : DDR + auto-suggestion facteurs de risque (âge, ATCD, parité)
- [ ] Affichage du niveau de risque avec code couleur (vert/orange/rouge)

### 1.3 Consultations Prénatales (CPN) structurées (Sem. 3–6)

**LE** sujet central. Suivre le protocole **OMS 2016 (8 contacts minimum)**.

```prisma
model ConsultationCPN {
  id                String   @id @default(cuid())
  consultationId    String   @unique
  consultation      Consultation @relation(fields: [consultationId], references: [id])
  grossesseId       String
  grossesse         Grossesse @relation(fields: [grossesseId], references: [id])
  
  numeroContact     Int      // CPN1, CPN2, ...
  ageGestationnelSA Int      // calculé auto depuis DDR
  ageGestationnelJ  Int      // jours en plus
  
  // Mesures cliniques
  poids             Float?   // kg
  taille            Float?   // cm (1ère CPN uniquement)
  imc               Float?   // calculé
  tensionSyst       Int?     // mmHg
  tensionDiast      Int?
  pouls             Int?     // bpm
  temperature       Float?
  
  // Mesures obstétricales
  hauteurUterine    Float?   // cm
  bcf               Int?     // bruits du cœur fœtal (bpm)
  mouvementsActifs  Boolean?
  presentation      String?  // CEPHALIQUE | SIEGE | TRANSVERSE | NON_DETERMINEE
  oedemes           OedemeNiveau?
  
  // Bandelette urinaire
  buAlbumine        String?  // -, +, ++, +++
  buGlucose         String?
  buNitrites        Boolean?
  
  // Examens prescrits/réalisés
  examensPrescrits  Json     @default("[]")
  vaccinations      Json     @default("[]")  // VAT1, VAT2...
  
  // Conduite à tenir
  observations      String?
  conduiteATenir    String?
  prochaineCPN      DateTime?
  
  createdAt         DateTime @default(now())
}

enum OedemeNiveau {
  ABSENT
  LEGER
  MODERE
  IMPORTANT
}
```

**UI à concevoir** :

- [ ] Composant `<CPNForm>` avec champs progressifs (mesures → obstétrique → bandelette → CAT)
- [ ] Auto-calcul de l'âge gestationnel à l'ouverture du formulaire
- [ ] Détection automatique du numéro de CPN (CPN1 si première, CPN2 si > 14 SA, etc.)
- [ ] Validation : alerte si TA > 140/90 (HTA gravidique), Hb < 11, albuminurie ++
- [ ] Suggestion automatique du prochain RDV selon le calendrier OMS

### 1.4 Courbes et flow sheets (Sem. 6–8)

L'élément qui transforme Gynaeasy en vrai EMR.

- [ ] **Courbe HU vs âge gestationnel** : Recharts, avec courbes percentiles 10/50/90
- [ ] **Courbe de poids maternel**
- [ ] **Courbe de TA** (systolique + diastolique sur même graphe)
- [ ] **Flow sheet récapitulatif** : tableau de toutes les CPN sur une page, format A4 imprimable
- [ ] **Carnet de grossesse PDF** : génération PDF du dossier complet de grossesse (pour la patiente)

### 1.5 Échographies structurées (Sem. 8–9)

Étendre l'imagerie existante avec des templates spécifiques :

```prisma
model Echographie {
  id              String   @id @default(cuid())
  consultationId  String?
  grossesseId     String?
  patientId       String
  
  type            TypeEcho // T1_DATATION | T2_MORPHOLOGIQUE | T3_CROISSANCE | PELVIENNE | MAMMAIRE
  date            DateTime
  
  // Données structurées (selon le type)
  donnees         Json     // BIP, PC, PA, fémur, LA, etc.
  conclusion      String?
  
  documentId      String?  // PDF du compte-rendu
  
  createdAt       DateTime @default(now())
}

enum TypeEcho {
  T1_DATATION
  T2_MORPHOLOGIQUE
  T3_CROISSANCE
  PELVIENNE
  MAMMAIRE
  AUTRE
}
```

- [ ] Templates de saisie par type (T1, T2, T3) avec biométries standards
- [ ] Calcul automatique du percentile de croissance (BIP, fémur, PA)
- [ ] Génération PDF du compte-rendu avec en-tête du cabinet

### 1.6 Tests & rollout (Sem. 9–12)

- [ ] Tests E2E (Playwright) : créer grossesse → 4 CPN → accouchement
- [ ] Tests d'intégration sur les calculs (âge gestationnel, DPA, IMC, percentiles)
- [ ] **Pilote sur 3 cabinets** volontaires (1 SOLO, 1 PRO, 1 CLINIQUE)
- [ ] Itération sur retours utilisateurs (sem. 11)
- [ ] Activation progressive : 10 cabinets / sem. via feature flag
- [ ] Documentation utilisateur + 3 vidéos tutoriels

**Livrables Phase 1** : Gynaeasy devient un vrai EMR obstétrical. KPI cible : 80 % des grossesses suivies avec ≥ 4 CPN structurées dans les cabinets pilotes.

---

## Phase 2 — Engagement patient & WhatsApp (M3–M5)

> Objectif : faire de WhatsApp le canal principal de communication patient — sans app native à installer.

### 2.1 Templates WhatsApp Meta approuvés (Sem. 1)

Préalable indispensable : faire approuver des templates par Meta (1–2 semaines d'attente).

- [ ] Soumettre les templates en français :
  - `confirmation_rdv` (utility)
  - `rappel_rdv_j1` (utility)
  - `annulation_rdv` (utility)
  - `ordonnance_disponible` (utility)
  - `resultats_disponibles` (utility)
  - `rappel_cpn_due` (utility)
- [ ] Soumettre versions wolof (caractères latins) — Meta accepte le wolof depuis 2024
- [ ] Stocker les `template_name` dans une table de config

### 2.2 WhatsApp Bot conversationnel (Sem. 2–5)

Modèle : webhook Meta entrant + machine à états légère.

```typescript
// lib/whatsapp/bot.ts
type ConversationState = 
  | { step: "IDLE" }
  | { step: "AWAITING_PATIENT_CODE" }
  | { step: "MENU"; patientId: string }
  | { step: "BOOKING_DOCTOR_SELECTION"; patientId: string }
  | { step: "BOOKING_DATE_SELECTION"; patientId: string; userId: string }
  | { step: "BOOKING_CONFIRMATION"; ... };
```

**Commandes du bot** :

| Commande | Action |
|---|---|
| `bonjour` / `salut` / `menu` | Affiche le menu principal |
| `rdv` | Affiche le prochain RDV du patient |
| `prendre rdv` | Lance le flux de prise de RDV |
| `ordonnance` | Renvoie la dernière ordonnance en PDF |
| `mes documents` | Liste les 5 derniers documents |
| `solde` | Affiche le solde dû à la clinique |
| `urgence` | Renvoie le numéro de garde du cabinet |
| `arrêt` / `stop` | Désactive les rappels |

**Modèle Prisma** :

```prisma
model WhatsAppConversation {
  id          String   @id @default(cuid())
  phone       String   @unique  // numéro normalisé E.164
  patientId   String?
  state       Json     @default("{}")
  lastMessage DateTime @default(now())
  messages    WhatsAppMessage[]
}

model WhatsAppMessage {
  id              String   @id @default(cuid())
  conversationId  String
  direction       String   // IN | OUT
  type            String   // TEXT | TEMPLATE | DOCUMENT
  content         String   @db.Text
  metadata        Json?
  createdAt       DateTime @default(now())
}
```

- [ ] Webhook `/api/whatsapp/webhook` (vérification token Meta)
- [ ] Machine à états avec persistance Redis (TTL 24h)
- [ ] Tests : 10 scénarios de bout en bout simulés
- [ ] Fallback : si le bot ne comprend pas 2 fois, propose "Parler à un humain" → notification secrétaire

### 2.3 Mini-portail patient web (Sem. 5–7)

Pour les cas qui dépassent WhatsApp (téléchargement, historique).

Route publique : `/p/{codePatient}` → demande OTP par SMS (valable 10 min) → portail.

**Contenu** :

- [ ] Liste des prochains RDV (annulation possible jusqu'à H-24)
- [ ] Historique des consultations (date + motif uniquement, pas les notes médicales)
- [ ] Téléchargement des ordonnances PDF
- [ ] Téléchargement des factures
- [ ] Téléchargement du carnet de grossesse (si grossesse en cours)
- [ ] Téléchargement export RGPD complet (zip)

### 2.4 Notifications enrichies (Sem. 7–8)

- [ ] Rappel CPN due : si âge gestationnel atteint le seuil sans CPN, notif au médecin + SMS/WA patient
- [ ] Rappel frottis : 3 ans après le dernier
- [ ] Rappel mammographie : 2 ans après la dernière (patientes > 40 ans)
- [ ] Rappel renouvellement contraception : DIU 5/10 ans, implant 3 ans, injectable 3 mois

**Livrables Phase 2** : taux de no-show réduit (cible : -30 %), engagement WhatsApp mesurable (≥ 40 % des patientes actives utilisent le bot mensuellement).

---

## Phase 3 — Aide à la décision clinique (M5–M7)

> Objectif : ajouter une couche de **rules engine** qui aide le médecin à ne rien rater.

### 3.1 Moteur de règles cliniques (Sem. 1–3)

```prisma
model ClinicalAlert {
  id            String   @id @default(cuid())
  patientId     String
  type          String   // FROTTIS_DUE | MAMMO_DUE | HTA_GRAVIDIQUE | ANEMIE | etc.
  severite      String   // INFO | WARNING | CRITICAL
  message       String
  donnees       Json
  
  acknowledged  Boolean  @default(false)
  acknowledgedBy String?
  acknowledgedAt DateTime?
  
  createdAt     DateTime @default(now())
  
  @@index([patientId, acknowledged])
}
```

**Règles à implémenter** (en TypeScript pur, pas d'IA) :

| Règle | Déclencheur | Sévérité |
|---|---|---|
| HTA gravidique | TA ≥ 140/90 sur CPN | CRITICAL |
| Pré-éclampsie suspectée | HTA + albuminurie ≥ ++ | CRITICAL |
| Anémie en grossesse | Hb < 11 g/dL | WARNING |
| Retard de croissance | HU < percentile 10 | WARNING |
| Macrosomie suspectée | HU > percentile 90 | WARNING |
| Frottis dû | Pas de frottis depuis 3 ans, patiente 25–65 ans | INFO |
| Mammographie due | Pas de mammo depuis 2 ans, patiente ≥ 40 ans | INFO |
| Vaccin VAT manquant | Grossesse > 28 SA sans VAT2 | WARNING |
| DIU à renouveler | Pose il y a > 4 ans 6 mois (cuivre 5 ans) | INFO |
| Implant à renouveler | Pose il y a > 2 ans 9 mois | INFO |

- [ ] Service `lib/clinical-rules.ts` avec une fonction `evaluatePatient(patientId)` retournant un tableau d'alertes
- [ ] Évaluation déclenchée après chaque consultation (job BullMQ)
- [ ] Évaluation batch nocturne pour tous les patients actifs
- [ ] UI : bannière d'alertes en haut du dossier patient, codes couleur, action "acknowledge"

### 3.2 Drug interaction checker (Sem. 3–5)

Sur les ordonnances : alerte si médicament contre-indiqué en grossesse/allaitement.

- [ ] Constituer une base de données médicaments (CSV initial : 500 molécules courantes)
- [ ] Champs : DCI, nom commercial, classe thérapeutique, contre-indications (grossesse T1/T2/T3, allaitement)
- [ ] Source : extraire depuis le **Vidal** (ou OMS Model List), à anonymiser
- [ ] Composant `<OrdonnanceEditor>` qui détecte le contexte (patiente enceinte → vérifier)
- [ ] Affichage warning rouge avec justification (cite la classe pharmacologique)

### 3.3 Templates d'ordonnance pré-remplis (Sem. 5–7)

Bibliothèque de templates par motif de consultation :

- [ ] Suivi grossesse 1er trimestre (acide folique, fer, vitamines)
- [ ] Suivi grossesse 2e/3e trimestre (fer + calcium)
- [ ] Contraception orale (3 régimes types)
- [ ] Infection urinaire grossesse
- [ ] Mycose vaginale
- [ ] Métrorragies fonctionnelles
- [ ] Mastite du post-partum
- [ ] Pré-opératoire (avant césarienne, hystéroscopie...)

Chaque template = posologie + durée + nb de boîtes. Personnalisable par cabinet (`ClinicSettings.ordonnanceTemplates`).

**Livrables Phase 3** : qualité de soin mesurablement améliorée. KPI cible : ≥ 95 % des grossesses dépistées HTA gravidique le jour même.

---

## Phase 4 — Téléconsultation & laboratoire (M7–M9)

> Objectif : débloquer le plan PRO (téléconsult promise mais non livrée) et ouvrir la voie au B2B labo.

### 4.1 Téléconsultation WebRTC (Sem. 1–5)

**Choix techno** : **LiveKit Cloud** (gratuit jusqu'à 50 minutes/mois × utilisateur, puis ~0,004 €/min) — beaucoup plus simple que de self-hoster Jitsi.

Alternative : **Daily.co** (50 min gratuites/mois, plus chère ensuite mais plus simple).

```prisma
model Teleconsultation {
  id              String   @id @default(cuid())
  consultationId  String   @unique
  consultation    Consultation @relation(fields: [consultationId], references: [id])
  
  roomName        String   @unique  // livekit room
  tokenMedecin    String?  // JWT généré côté serveur
  tokenPatient    String?
  
  statut          String   // EN_ATTENTE | EN_COURS | TERMINEE | NO_SHOW
  startedAt       DateTime?
  endedAt         DateTime?
  durationSeconds Int?
  
  recordingUrl    String?  // optionnel, si consentement
  recordingConsent Boolean @default(false)
}
```

**UI** :

- [ ] Type de RDV `TELECONSULTATION` (existe déjà) → affiche bouton "Démarrer la visio" dans l'agenda
- [ ] Côté médecin : `/teleconsult/{id}` avec composant LiveKit React
- [ ] Côté patient : lien unique avec token JWT, accessible **sans login** (mais token expirant 4h après le RDV)
- [ ] Envoi du lien par **SMS + WhatsApp + Email** au patient 30 min avant le RDV
- [ ] Salle d'attente : patient connecté en attente d'admission par le médecin
- [ ] Mode dégradé audio seul si bande passante < 200 Kbps (LiveKit le gère natif)
- [ ] Bouton "partager mon écran" pour montrer un compte-rendu
- [ ] Chat textuel intégré (utile pour partager des numéros, doses)

### 4.2 Module Laboratoire (Sem. 5–8)

```prisma
model BiologieResultat {
  id              String   @id @default(cuid())
  patientId       String
  consultationId  String?
  date            DateTime
  
  laboratoire     String?  // nom du labo
  documentId      String?  // PDF reçu
  
  // Valeurs structurées principales
  resultats       BiologieValeur[]
  
  observations    String?
  createdAt       DateTime @default(now())
}

model BiologieValeur {
  id            String   @id @default(cuid())
  resultatId    String
  parametre     String   // "Hémoglobine", "Glycémie à jeun", etc.
  code          String?  // code LOINC si dispo
  valeur        Float
  unite         String
  normeMin      Float?
  normeMax      Float?
  anormal       Boolean  @default(false)
}
```

- [ ] **Bon d'examens** : génération PDF d'une ordonnance d'examens biologiques avec catalogue (NFS, ionogramme, bilan grossesse standard, etc.)
- [ ] **Réception manuelle** : upload du PDF + saisie des valeurs clés (formulaire optimisé pour saisie rapide : Hb, GB, plaquettes, glycémie, créat, urée, transaminases…)
- [ ] **Courbes temporelles** : évolution Hb sur 6 mois pour suivi grossesse, glycémie pour diabète gestationnel
- [ ] **Alerte valeurs anormales** : utilise le moteur de la Phase 3
- [ ] **Pack examens grossesse** : un clic pour prescrire le bilan complet T1 (groupage, TPHA-VDRL, HIV, HBs, toxo, rubéole, NFS, glycémie)

### 4.3 Intégration labos partenaires (Sem. 8–9) — optionnel

Si un partenariat est négocié avec Bio24 / Pasteur Dakar / Institut Pasteur :

- [ ] API REST simple `/api/biologie/webhook` pour réception automatique des résultats
- [ ] Format : JSON ou HL7 v2 (selon ce que le labo expose)
- [ ] Matching patient par code patient ou nom + DDN
- [ ] Notification automatique médecin + patient (WhatsApp) à réception

**Livrables Phase 4** : téléconsult fonctionnelle (KPI cible : 10 % des consultations en visio à 3 mois post-lancement) + labo digitalisé.

---

## Phase 5 — Facturation avancée & stocks (M9–M11)

> Objectif : débloquer le marché **B2B cliniques** (plan CLINIQUE) qui exige tiers payant et gestion de stock sérieuse.

### 5.1 Tiers payant IPM / Mutuelles / Assurances (Sem. 1–5)

```prisma
model Assureur {
  id            String   @id @default(cuid())
  nom           String   @unique  // IPM, IPRES, ASKIA, Sonam, Sunu, NSIA, etc.
  type          String   // IPM | MUTUELLE | ASSURANCE_PRIVEE
  tauxCouverture Float   // % couvert par défaut (0.80 = 80 %)
  formatBordereau String? // PDF_STANDARD | EXCEL_IPM | etc.
  contact       Json     @default("{}")
  actif         Boolean  @default(true)
}

model PatientAssurance {
  id            String   @id @default(cuid())
  patientId     String
  assureurId    String
  numeroAdherent String
  validiteDebut DateTime?
  validiteFin   DateTime?
  tauxCouverture Float?  // override du défaut
  actif         Boolean  @default(true)
}

model FeuilleSoins {
  id            String   @id @default(cuid())
  reglementId   String   @unique
  assureurId    String
  patientAssuranceId String
  
  numero        String   @unique // numéro de feuille
  montantTotal  Float
  montantPatient Float   // part patient (ticket modérateur)
  montantAssureur Float  // part assureur
  
  statut        StatutFeuille // EMISE | ENVOYEE | PAYEE | REJETEE
  bordereauId   String?  // si incluse dans un bordereau mensuel
  
  documentPdf   String?
  createdAt     DateTime @default(now())
}

model Bordereau {
  id            String   @id @default(cuid())
  assureurId    String
  periode       String   // "2026-06"
  nombreFeuilles Int
  montantTotal  Float
  
  statut        String   // BROUILLON | ENVOYE | PAYE | LITIGE
  dateEnvoi     DateTime?
  datePaiement  DateTime?
  
  feuilles      FeuilleSoins[]
  documentPdf   String?
}

enum StatutFeuille {
  EMISE
  ENVOYEE
  PAYEE
  REJETEE
}
```

- [ ] Catalogue des assureurs courants au Sénégal pré-rempli (IPM, IPRES, NSIA, Sunu, ASKIA…)
- [ ] Onglet "Assurance" dans le dossier patient
- [ ] Détection automatique : à la facturation, si patient a une assurance active, propose génération feuille de soins
- [ ] Calcul automatique part patient / part assureur selon taux
- [ ] Génération PDF de la feuille de soins (template par assureur)
- [ ] **Bordereau mensuel** : agréger toutes les feuilles d'un assureur sur un mois, générer le bordereau récap
- [ ] Workflow secrétaire : "Feuilles à envoyer" / "En attente paiement" / "Litiges"

### 5.2 Stocks avancés : lots, péremptions, multi-emplacements (Sem. 5–8)

Refactor du modèle `StockItem` actuel (trop simple) :

```prisma
model Article {
  id              String   @id @default(cuid())
  nom             String
  categorie       String   // MEDICAMENT | CONSOMMABLE | MATERIEL | VACCIN
  unite           String   // boîte, comprimé, ampoule, sachet, unité
  seuilAlerte     Int      @default(5)
  
  codeBarre       String?
  fournisseur     String?
  prixAchat       Float?
  prixVente       Float?
  
  lots            ArticleLot[]
  mouvements      StockMouvement[]
}

model ArticleLot {
  id              String   @id @default(cuid())
  articleId       String
  numeroLot       String
  emplacementId   String
  
  quantite        Int
  datePeremption  DateTime?
  
  createdAt       DateTime @default(now())
  
  @@index([datePeremption])
}

model Emplacement {
  id        String   @id @default(cuid())
  nom       String   // "Pharmacie", "Salle de soins", "Bloc"
  actif     Boolean  @default(true)
}

model StockMouvement {
  id              String   @id @default(cuid())
  articleId       String
  lotId           String?
  emplacementId   String
  
  type            String   // ENTREE | SORTIE | TRANSFERT | RETOUR | CASSE | INVENTAIRE
  quantite        Int      // positif = entrée, négatif = sortie
  
  motif           String?
  consultationId  String?  // si consommé en consultation
  userId          String   // qui a fait le mouvement
  
  createdAt       DateTime @default(now())
}
```

- [ ] Migration depuis l'ancien modèle (création de "lot par défaut" pour chaque article existant)
- [ ] UI gestion d'articles avec onglet lots
- [ ] **Alerte péremption** : 3 mois / 1 mois / 1 semaine — dashboard + email + WhatsApp au pharmacien
- [ ] **Scan code-barres** : composant React utilisant `html5-qrcode` via caméra du téléphone
- [ ] **Inventaire physique** : workflow "démarrer inventaire → scanner tout → comparer → ajuster"
- [ ] **FIFO automatique** : à la sortie, utilise le lot le plus proche de la péremption en priorité
- [ ] **Multi-emplacements** : seulement pour le plan CLINIQUE (feature flag)

### 5.3 Plan de paiement échelonné (Sem. 8–9)

Cas d'usage : césarienne à 400 000 FCFA en 3 mensualités.

```prisma
model PlanPaiement {
  id              String   @id @default(cuid())
  patientId       String
  consultationId  String?
  
  montantTotal    Float
  montantPaye     Float    @default(0)
  
  nombreEcheances Int
  echeances       Echeance[]
  
  statut          String   // EN_COURS | SOLDE | EN_RETARD
  createdAt       DateTime @default(now())
}

model Echeance {
  id            String   @id @default(cuid())
  planPaiementId String
  
  numero        Int      // 1, 2, 3
  dateEcheance  DateTime
  montant       Float
  
  statut        String   // EN_ATTENTE | PAYE | EN_RETARD
  paiementId    String?  // lien vers Reglement quand payé
  
  rappelEnvoye  Boolean  @default(false)
}
```

- [ ] UI création de plan : "Encaisser maintenant" → option "Étaler le paiement"
- [ ] Rappel automatique 3 jours avant échéance (SMS + WhatsApp)
- [ ] Tableau de bord "Échéances à venir" pour la secrétaire

**Livrables Phase 5** : ouvre le marché B2B cliniques. KPI cible : 5 cliniques (plan CLINIQUE) signées dans les 3 mois post-livraison.

---

## Phase 6 — Statistiques & santé publique (M11–M12)

> Objectif : faire de Gynaeasy un **outil de pilotage**, pas juste de saisie. Et créer le lien avec les autorités de santé.

### 6.1 Dashboard statistiques riche (Sem. 1–2)

Refonte complète de la page `/statistiques`.

**Sections** :

- [ ] **Activité clinique** : consultations/jour, /sem., /mois — comparaison N-1
- [ ] **Motifs principaux** : top 10 des motifs de consultation
- [ ] **Démographie patientèle** : pyramide des âges, répartition géographique
- [ ] **Suivi obstétrical** : grossesses suivies, taux CPN4+, taux CPN8+ (norme OMS)
- [ ] **Indicateurs qualité** : taux d'HTA gravidique dépistée, taux d'anémie, taux de césariennes
- [ ] **Indicateurs financiers** : CA, créances, taux d'impayés, panier moyen
- [ ] **Agenda** : taux de no-show, taux d'occupation, heatmap créneaux
- [ ] **Rétention** : cohorte patients (combien de retours à 3/6/12 mois)

Tous filtrables par période, exportables Excel + PDF.

### 6.2 Export DHIS2 (Sem. 2–4)

DHIS2 est utilisé par le **MSAS Sénégal** pour la santé maternelle.

- [ ] Mapper les indicateurs Gynaeasy vers les indicateurs DHIS2 (CPN1, CPN4, CPN8, VAT2+, accouchements assistés, etc.)
- [ ] Endpoint `/api/dhis2/export?periode=2026-06` retournant un JSON conforme DHIS2 API
- [ ] Configuration cabinet : URL DHIS2 cible, credentials, période d'export
- [ ] Tâche cron mensuelle : export automatique le 5 de chaque mois

C'est un **vrai différenciateur** vs les EMR US/EU : on parle à l'écosystème national.

### 6.3 Rapports réglementaires (Sem. 4)

- [ ] Rapport mensuel d'activité (PDF) signable et tamponnable, format DSDOM
- [ ] Registre des accouchements (obligation légale pour les maternités)
- [ ] Registre des consultations prénatales

**Livrables Phase 6** : Gynaeasy devient l'outil que les médecins peuvent présenter à l'administration de santé sénégalaise.

---

## Backlog différé (post v2)

À ne pas oublier mais hors scope 12 mois :

- **Partogramme électronique** (pour maternités du plan CLINIQUE — Phase 7)
- **IA résumé de consultation** (ambient scribing via Claude API — Phase 8)
- **Module DPC** (développement professionnel continu) — formations en ligne pour les médecins (cf. projet Tech Care For All – Africa au Sénégal)
- **Marketplace remplaçants/seconds avis** (Phase 9)
- **Comptes sage-femme / matrone** avec droits limités (Phase 10)
- **Programme de fidélité patient**
- **Intégration mammographie avec IA (Niramai-style)**
- **Bot WhatsApp en wolof avec LLM** (Grand Challenges Senegal)
- **Wearables / RPM** : monitoring TA à domicile pour grossesses à risque

---

## Suivi et gouvernance

### Rituels

- **Daily** : standup 15 min équipe dev
- **Weekly** : revue de roadmap (PO + lead dev), ajustement priorités
- **Bi-weekly** : démo aux 3 cabinets pilotes, feedback structuré
- **Monthly** : revue KPI globale, ajustement plan trimestriel

### KPIs trimestriels

| Trimestre | KPI principal | Cible |
|---|---|---|
| Q1 (M1–M3) | Cabinets utilisant CPN structurée | ≥ 15 |
| Q2 (M4–M6) | Patientes actives sur WhatsApp Bot | ≥ 500 |
| Q3 (M7–M9) | Téléconsultations / mois | ≥ 200 |
| Q4 (M10–M12) | Cliniques (plan CLINIQUE) signées | ≥ 5 |

### Gestion des risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Templates WhatsApp refusés par Meta | Moyenne | Élevé | Soumettre dès Phase 0, plan B = SMS uniquement |
| Adoption lente Phase 1 (CPN) | Moyenne | Élevé | Pilote 3 cabinets, formation 1-1, vidéos |
| Performance Postgres (>50 cabinets) | Faible | Moyen | Index, monitoring Sentry, plan de migration Aurora |
| Régression sur features existantes | Moyenne | Élevé | E2E Playwright dans la CI, feature flags |
| Dépendance Meta / Orange (lock-in) | Faible | Élevé | Abstractions `lib/sms.ts` et `lib/whatsapp.ts` déjà bien faites |

### Versioning

- **v1.x** : version actuelle (mai 2026)
- **v1.5** : fin de Phase 0 (juin 2026)
- **v2.0** : fin de Phase 1 — release majeure (août 2026)
- **v2.1** : fin de Phase 2 (octobre 2026)
- **v2.2** : fin de Phase 3 (décembre 2026)
- **v2.3** : fin de Phase 4 (février 2027)
- **v2.4** : fin de Phase 5 (avril 2027)
- **v2.5** : fin de Phase 6 (mai 2027)

---

*Roadmap initiale — mai 2026. À ré-évaluer tous les trimestres en fonction des retours utilisateurs et de l'évolution du marché.*
