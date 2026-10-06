# TP1 – Mon premier serveur Express : l'API d'un blog

Travail pratique de la **Séance 1** du cours *MERN Stack*.

## Description

Ce TP consiste à créer un serveur **Node.js / Express** qui répond à des requêtes HTTP et renvoie du JSON, puis à le tester avec **Postman**. Le projet est une petite API REST pour un blog (articles et utilisateurs). Les données sont stockées en mémoire : la base de données MongoDB sera ajoutée à la séance 3.

Le TP permet de découvrir :

- le principe client / serveur et les requêtes HTTP (méthode, URL, code de statut) ;
- la création de routes Express (`GET` et `POST`) ;
- la lecture des données d'une requête : `req.params`, `req.query` et `req.body` ;
- quelques écritures modernes de JavaScript : fonction fléchée, template literal, déstructuration, `find` et `filter`.

Le détail du travail réalisé (prédictions, exercices, captures Postman) se trouve dans le **compte rendu** du TP.

## Structure du projet

```
mon-api-blog/
├── .gitignore             # exclut node_modules/ et .idea/
├── exercices_js.js        # Exercice 2 : notions JavaScript
├── package.json           # carte d'identité du projet et script "dev"
├── package-lock.json      # versions exactes des dépendances
├── README.md              # ce fichier
└── server.js              # le serveur Express (étapes 1 à 7 + exercice 1)
```

Le dossier `node_modules/` (créé par `npm install`) n'est pas versionné : il contient les bibliothèques téléchargées et se recrée à tout moment.

## Guide de démarrage

### 1. Préparer l'environnement

Installer, avec les options par défaut :

- [Node.js](https://nodejs.org/) (version **LTS**) : exécute le JavaScript en dehors du navigateur ;
- [VS Code](https://code.visualstudio.com/) : l'éditeur de code ;
- [Postman](https://www.postman.com/downloads/) : envoie des requêtes à l'API ;
- [Git](https://git-scm.com/) : enregistre l'historique du projet.

Puis, dans un **nouveau** terminal, vérifier l'installation :

```bash
node -v
npm -v
```

Deux numéros de version doivent s'afficher.

### 2. Créer le projet (étape 1 du TP)

```bash
mkdir mon-api-blog
cd mon-api-blog
npm init -y
npm install express
git init
code .
```

| Commande | Rôle |
|---|---|
| `npm init -y` | crée `package.json`, la carte d'identité du projet |
| `npm install express` | télécharge Express dans `node_modules/` |
| `git init` | initialise le dépôt Git |
| `code .` | ouvre le dossier dans VS Code |

Créer ensuite un fichier `.gitignore` contenant :

```
node_modules/
```

Et dans `package.json`, remplacer la partie `"scripts"` par :

```json
{
  "scripts": {
    "dev": "node --watch server.js"
  }
}
```

Désormais, `npm run dev` lance le serveur, et l'option `--watch` le redémarre à chaque enregistrement d'un fichier.

### 3. Lancer le serveur (étape 2 du TP)

Créer `server.js` :

```js
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({ message: "Bonjour, je suis l'API du blog" });
});

app.listen(PORT, () => {
  console.log(`Serveur disponible sur http://localhost:${PORT}`);
});
```

Lancer :

```bash
npm run dev
```

Le terminal affiche `Serveur disponible sur http://localhost:3000`. Ouvrir cette adresse dans le navigateur : le message JSON s'affiche. Pour arrêter le serveur : `Ctrl + C`.

### 4. Récupérer et lancer ce projet

```bash
git clone https://github.com/mohamedkhalilkhelifi20/TP_MERN.git
cd TP_MERN
git checkout tp1
npm install
npm run dev
```

Pour lancer l'exercice 2 :

```bash
node exercices_js.js
```

## Routes de l'API

| Méthode | Route | Description |
|---|---|---|
| GET | `/` | message d'accueil |
| GET | `/about` | informations sur l'application |
| GET | `/api/articles` | liste des articles (filtre : `?author=Aya`) |
| GET | `/api/articles/:id` | un article, ou `404` |
| POST | `/api/articles` | crée un article (`201`, ou `400` si champ manquant) |
| GET | `/api/users` | liste des utilisateurs (filtre : `?name=Khalil`) |
| GET | `/api/users/:id` | un utilisateur, ou `404` |
| POST | `/contact` | message de contact (`200`, ou `400` si champ manquant) |

## Organisation Git

Le dépôt `TP_MERN` regroupe tous les TP du cours, chacun sur sa propre branche :

| Branche | Contenu |
|---|---|
| `main` | README d'accueil |
| `tp1` | ce TP |
| `tp2`, … | les TP suivants |
