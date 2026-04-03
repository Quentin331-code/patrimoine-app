# 🚀 Guide de déploiement — Mon Patrimoine

## Étape 1 : Configurer Supabase (ta base de données)

1. Va sur **supabase.com** → connecte-toi
2. Clique **"New Project"**
   - Nom : `patrimoine`
   - Mot de passe base de données : choisis-en un (note-le)
   - Région : `West EU (Ireland)` (la plus proche de la France)
3. Attends 1-2 minutes que le projet se crée
4. Va dans **SQL Editor** (menu de gauche)
5. Copie-colle TOUT le contenu du fichier `supabase-schema.sql` dans l'éditeur
6. Clique **"Run"** → tu devrais voir "Success"
7. Va dans **Settings → API** et note :
   - `Project URL` → c'est ton `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → c'est ton `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Important : activer l'auth par email
8. Va dans **Authentication → Providers**
9. Vérifie que **Email** est activé
10. Dans **Authentication → URL Configuration**, ajoute :
    - Site URL : `http://localhost:3000` (pour le dev)
    - Redirect URLs : `http://localhost:3000/api/auth/callback`

---

## Étape 2 : Configurer le projet en local

Ouvre ton **Terminal** (Mac : cherche "Terminal" dans Spotlight).

```bash
# 1. Va dans ton dossier de projets (ou bureau)
cd ~/Desktop

# 2. Crée le dossier du projet et copie les fichiers
# (tu as déjà téléchargé le dossier patrimoine-app depuis Claude)

# 3. Va dans le dossier
cd patrimoine-app

# 4. Crée le fichier de configuration
cp .env.local.example .env.local

# 5. Ouvre .env.local et remplace les valeurs
# Avec TextEdit ou VS Code :
open .env.local
# Remplace NEXT_PUBLIC_SUPABASE_URL par ton URL Supabase
# Remplace NEXT_PUBLIC_SUPABASE_ANON_KEY par ta clé anon

# 6. Installe les dépendances
npm install

# 7. Lance le projet
npm run dev
```

8. Ouvre **http://localhost:3000** dans ton navigateur
9. Tu devrais voir la page de connexion !
10. Crée un compte, confirme par email, et connecte-toi

---

## Étape 3 : Mettre en ligne avec Vercel

### Pousser sur GitHub

```bash
# 1. Initialise Git
git init
git add .
git commit -m "Initial commit - Mon Patrimoine"

# 2. Crée un repo sur github.com (bouton + en haut à droite → New repository)
# Nom : patrimoine-app
# Laisse tout par défaut, clique "Create repository"

# 3. GitHub te donne des commandes, exécute celles-ci :
git remote add origin https://github.com/TON-USERNAME/patrimoine-app.git
git branch -M main
git push -u origin main
```

### Déployer sur Vercel

1. Va sur **vercel.com** → connecte-toi avec GitHub
2. Clique **"Add New" → "Project"**
3. Sélectionne ton repo `patrimoine-app`
4. Dans **"Environment Variables"**, ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL` → ta valeur
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → ta valeur
5. Clique **"Deploy"**
6. Attends 1-2 minutes... 🎉 Ton site est en ligne !

### Mettre à jour les URLs Supabase

Une fois déployé, Vercel te donne une URL (ex: `patrimoine-app.vercel.app`).

1. Retourne sur **Supabase → Authentication → URL Configuration**
2. Mets à jour :
   - Site URL : `https://patrimoine-app.vercel.app`
   - Redirect URLs : ajoute `https://patrimoine-app.vercel.app/api/auth/callback`

---

## Structure du projet

```
patrimoine-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js        ← Page de connexion
│   │   └── register/page.js     ← Page d'inscription
│   ├── api/
│   │   ├── auth/callback/route.js ← Callback auth email
│   │   └── prices/route.js      ← API prix en direct (serveur)
│   ├── dashboard/page.js        ← App principale
│   ├── globals.css              ← Styles globaux
│   ├── layout.js                ← Layout racine
│   └── page.js                  ← Redirection
├── lib/
│   ├── data.js                  ← Base actions/ETF/crypto/métaux
│   ├── supabase-browser.js      ← Client Supabase (navigateur)
│   ├── supabase-server.js       ← Client Supabase (serveur)
│   └── usePatrimoine.js         ← Hook principal (données + CRUD)
├── middleware.js                 ← Protection des routes
├── supabase-schema.sql          ← Schéma base de données
├── .env.local.example           ← Template variables d'env
├── package.json
└── GUIDE.md                     ← Ce fichier
```

---

## Résumé des commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer en local (http://localhost:3000) |
| `npm run build` | Compiler pour production |
| `git add . && git commit -m "msg" && git push` | Déployer une mise à jour |

Chaque `git push` déclenche automatiquement un redéploiement sur Vercel.

---

## FAQ

**Les prix ne s'affichent pas ?**
→ L'API `/api/prices` tourne côté serveur. Si tu es en local, assure-toi que `npm run dev` tourne. En production sur Vercel, ça marche automatiquement.

**Je ne reçois pas l'email de confirmation ?**
→ Vérifie tes spams. Sur Supabase gratuit, les emails viennent de `noreply@mail.app.supabase.io`.

**Comment ajouter un domaine personnalisé ?**
→ Sur Vercel : Settings → Domains → ajoute ton domaine. Vercel te guide pour configurer les DNS.
