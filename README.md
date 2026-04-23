# ALI AVANCES & TAF — Guide d'installation complet

## Architecture

```
Ton téléphone (navigateur)
       ↓  HTTPS
   Vercel (hébergement gratuit)
       ↓  API
   Supabase (base de données PostgreSQL gratuite)
```

---

## ÉTAPE 1 — Créer la base de données Supabase (10 min)

### 1.1 Créer un compte
1. Va sur **https://supabase.com**
2. Clique **"Start your project"**
3. Connecte-toi avec GitHub ou email
4. Clique **"New project"**
5. Donne un nom : `ali-avances`
6. Choisis un mot de passe (note-le)
7. Région : **Europe West** (ou la plus proche)
8. Attends 2 min que le projet se crée

### 1.2 Créer les tables
1. Dans ton projet Supabase, clique **"SQL Editor"** dans le menu gauche
2. Clique **"New query"**
3. Copie-colle tout le contenu du fichier `supabase_schema.sql`
4. Clique **"Run"** (bouton vert)
5. Tu dois voir : `Success. No rows returned`

### 1.3 Récupérer tes clés API
1. Clique **"Project Settings"** (icône engrenage en bas à gauche)
2. Clique **"API"**
3. Note ces deux valeurs :
   - **Project URL** → ressemble à `https://abcxyz.supabase.co`
   - **anon public key** → longue chaîne commençant par `eyJ...`

---

## ÉTAPE 2 — Configurer le projet (5 min)

### 2.1 Créer le fichier .env.local
Dans le dossier `ali-app`, crée un fichier nommé `.env.local` (pas `.env.local.example`) avec ce contenu :

```
REACT_APP_SUPABASE_URL=https://TON_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...TON_ANON_KEY
```

Remplace les valeurs par celles récupérées à l'étape 1.3.

---

## ÉTAPE 3 — Tester en local (optionnel, nécessite Node.js)

```bash
# Dans le dossier ali-app :
npm install
npm start
# → Ouvre http://localhost:3000 dans ton navigateur
```

---

## ÉTAPE 4 — Déployer sur Vercel (10 min, GRATUIT)

### Option A — Via GitHub (recommandée)

1. Crée un compte sur **https://github.com** (si tu n'en as pas)
2. Crée un nouveau repository : `ali-avances`
3. Upload tous les fichiers du dossier `ali-app`
4. Va sur **https://vercel.com** et connecte-toi avec GitHub
5. Clique **"New Project"**
6. Sélectionne ton repository `ali-avances`
7. **IMPORTANT** — Avant de déployer, configure les variables d'environnement :
   - Clique **"Environment Variables"**
   - Ajoute : `REACT_APP_SUPABASE_URL` = ton URL Supabase
   - Ajoute : `REACT_APP_SUPABASE_ANON_KEY` = ta clé anon
8. Clique **"Deploy"**
9. Attends 2-3 minutes
10. Vercel te donne une URL comme : `https://ali-avances.vercel.app`

### Option B — Via Vercel CLI

```bash
npm install -g vercel
cd ali-app
vercel
# Suis les instructions, entre tes variables d'env quand demandé
```

---

## ÉTAPE 5 — Installer sur ton téléphone comme une app

### Sur iPhone (Safari)
1. Ouvre ton URL Vercel dans **Safari**
2. Appuie sur l'icône **Partager** (carré avec flèche vers le haut)
3. Défile et appuie sur **"Sur l'écran d'accueil"**
4. Nomme-la **"Ali TAF"**
5. Appuie **"Ajouter"**
6. ✅ L'app apparaît sur ton écran d'accueil comme une vraie app !

### Sur Android (Chrome)
1. Ouvre ton URL Vercel dans **Chrome**
2. Appuie sur les **3 points** en haut à droite
3. Appuie sur **"Ajouter à l'écran d'accueil"**
4. ✅ L'app s'installe sur ton téléphone !

---

## Structure des fichiers

```
ali-app/
├── public/
│   ├── index.html          # Page HTML avec meta PWA
│   └── manifest.json       # Config PWA (icône, couleurs...)
├── src/
│   ├── lib/
│   │   ├── supabase.js     # Client Supabase
│   │   └── api.js          # Toutes les requêtes DB
│   ├── components/
│   │   ├── shared.jsx      # Composants réutilisables
│   │   ├── DashboardPage.jsx
│   │   ├── AdvancesPage.jsx
│   │   ├── TasksPage.jsx
│   │   ├── QuotesPage.jsx
│   │   └── SihamPage.jsx
│   ├── App.jsx             # Navigation principale
│   ├── index.js            # Point d'entrée React
│   └── styles.css          # Styles globaux
├── .env.local              # ← À CRÉER (tes clés Supabase)
├── .env.local.example      # Template des variables
├── supabase_schema.sql     # Schéma base de données
├── vercel.json             # Config déploiement Vercel
└── package.json            # Dépendances
```

---

## Schéma de la base de données

```
advances          expenses
────────          ────────
id (UUID)    ←── advance_id
advance_type      description
source            amount
amount            date
date              created_at
project
reason
destination
status
recorded_by_siham
date_recorded
admin_note

tasks             quotes
─────             ──────
id (UUID)         id (UUID)
title             type
description       supplier
project           amount
due_date          date
status            project
done              notes
notes             recorded_by_siham
                  date_recorded
                  admin_note
```

---

## FAQ

**Q : Mes données sont-elles sécurisées ?**
R : Oui. Supabase utilise PostgreSQL avec HTTPS. Tes données sont dans le cloud et sauvegardées automatiquement.

**Q : C'est gratuit pour combien de temps ?**
R : Le plan gratuit Supabase inclut 500 MB de stockage et 50 000 requêtes/mois. Largement suffisant pour cet usage personnel. Vercel est gratuit pour les projets personnels sans limite de temps.

**Q : Que se passe-t-il si je change de téléphone ?**
R : Rien. Tes données sont dans Supabase (cloud), pas sur ton téléphone. Tu ouvres juste l'URL sur le nouveau téléphone et tu retrouves tout.

**Q : Comment ajouter des icônes à l'app ?**
R : Crée des images `icon-192.png` et `icon-512.png` (logo de 192×192 et 512×512 pixels) et place-les dans le dossier `public/`.

**Q : Comment mettre à jour l'app ?**
R : Modifie les fichiers et re-déploie sur Vercel. Les changements sont en ligne en 2 minutes.
