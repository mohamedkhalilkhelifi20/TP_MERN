# API Blog : Node.js, Express, MongoDB & Mongoose

![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2018.11-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-API%20REST-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-local-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000)

API REST d'un blog (utilisateurs et articles) dont les données sont **persistées dans MongoDB** grâce à **Mongoose**.
Projet réalisé dans le cadre du cours **MERN Stack, Séance 3 : Persistance des données** (École Polytechnique de Sousse, 2026-2027).

---

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Technologies](#technologies)
3. [Prérequis](#prérequis)
4. [Installation et lancement](#installation-et-lancement)
5. [Configuration](#configuration)
6. [Structure du projet](#structure-du-projet)
7. [Architecture](#architecture)
8. [Modèles de données](#modèles-de-données)
9. [Documentation de l'API](#documentation-de-lapi)
10. [Jeu de données de démonstration](#jeu-de-données-de-démonstration)
11. [Gestion des erreurs](#gestion-des-erreurs)
12. [Tests avec Postman](#tests-avec-postman)
13. [Dépannage](#dépannage)
14. [Sécurité](#sécurité)
15. [Évolutions prévues](#évolutions-prévues)
16. [Auteur](#auteur)

---

## Fonctionnalités

- CRUD complet sur les **articles** et gestion des **utilisateurs** (création, lecture, suppression).
- **Persistance** réelle : les données survivent à un redémarrage du serveur.
- **Relation un-à-plusieurs** entre un auteur et ses articles, reconstituée avec `.populate()`.
- **Validation** des données au niveau du schéma (format d'email par regex, âge minimum, rôle limité à une liste, téléphone à 8 chiffres, bio limitée à 200 caractères).
- **Intégrité référentielle** : impossible de supprimer un utilisateur qui a encore des articles.
- **Codes HTTP cohérents** : 200, 201, 400, 404, 409, 500.
- **Code asynchrone** avec `async/await` et blocs `try/catch`.
- Configuration externalisée dans un fichier `.env`, exclu de Git.

## Technologies

| Technologie | Rôle |
| --- | --- |
| [Node.js](https://nodejs.org/) (18.11 ou plus) | Environnement d'exécution JavaScript |
| [Express](https://expressjs.com/) | Framework HTTP : routes et middlewares |
| [MongoDB](https://www.mongodb.com/) Community Server | Base de données NoSQL orientée documents |
| [Mongoose](https://mongoosejs.com/) | ODM : schémas, modèles, validation, relations |
| [dotenv](https://github.com/motdotla/dotenv) | Chargement des variables d'environnement |
| MongoDB Compass | Interface graphique pour visualiser et importer les données |
| Postman | Tests de l'API |

## Prérequis

- **Node.js 18.11 ou plus récent** (`node --version`).
- **MongoDB Community Server** installé et démarré (service Windows « MongoDB Server »). Vérification : `mongod --version`.
- **MongoDB Compass** (optionnel mais recommandé) et **Postman** pour tester.
- **Git**.

## Installation et lancement

```bash
# 1. Cloner le dépôt et se placer sur la branche du TP
git clone <url-du-depot>
cd mon-api-blog
git checkout tp3-mongodb

# 2. Installer les dépendances
npm install

# 3. Créer le fichier de configuration à partir du modèle
cp .env.example .env        # Windows PowerShell : Copy-Item .env.example .env

# 4. Lancer le serveur en mode développement (rechargement automatique)
npm run dev
```

Au démarrage, le terminal doit afficher :

```text
Connexion a MongoDB locale reussie avec succes !
Serveur MERN en ecoute sur http://localhost:3000
```

### Scripts npm

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance `node --watch src/server.js` : le serveur redémarre à chaque modification |
| `npm start` | Lance `node src/server.js` (sans rechargement automatique) |

Si `npm run dev` répond `Missing script: "dev"`, ajoute ce bloc dans `package.json` :

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "node --watch src/server.js"
}
```

## Configuration

La configuration se fait par variables d'environnement, dans un fichier `.env` à la racine du projet (modèle fourni : `.env.example`).

| Variable | Description | Valeur par défaut du TP |
| --- | --- | --- |
| `PORT` | Port d'écoute du serveur | `3000` |
| `MONGODB_URI` | Chaîne de connexion à MongoDB | `mongodb://127.0.0.1:27017/blogDB` |

> **Pourquoi `127.0.0.1` et pas `localhost` ?** Sur certains postes, `localhost` est résolu en IPv6 (`::1`) et la connexion à MongoDB échoue. L'adresse IPv4 explicite évite ce problème.

La base `blogDB` et ses collections (`users`, `articles`) sont créées automatiquement par MongoDB au premier enregistrement.

## Structure du projet

```text
mon-api-blog/
├── .env                      # Configuration locale (JAMAIS versionnée)
├── .env.example              # Modèle de configuration, sans secret
├── .gitignore                # Exclut .env et node_modules
├── package.json
├── users.json                # Jeu de données : collection users
├── articles.json             # Jeu de données : collection articles
├── README.md
└── src/
    ├── server.js             # Point d'entrée : connexion à la base puis écoute HTTP
    ├── config/
    │   └── db.js             # Connexion asynchrone à MongoDB
    ├── models/
    │   ├── userModel.js      # Schéma et modèle User
    │   └── articleModel.js   # Schéma et modèle Article
    ├── controllers/
    │   ├── userController.js     # Logique métier des utilisateurs
    │   └── articleController.js  # Logique métier des articles
    └── routes/
        ├── userRoutes.js     # Routes /api/users
        └── articleRoutes.js  # Routes /api/articles
```

## Architecture

Le projet suit une **séparation des responsabilités** (SoC) en couches. Une requête les traverse dans cet ordre :

```text
Client (Postman, navigateur)
        │  requête HTTP
        ▼
   Routes          associent une URL à une fonction
        ▼
  Contrôleurs      valident, appellent le modèle, choisissent le code HTTP
        ▼
   Modèles         schémas Mongoose : structure et validation
        ▼
   MongoDB         collections users et articles (blogDB)
```

Les routes ne savent pas comment les données sont stockées : le passage des tableaux en mémoire (Séance 2) à MongoDB n'a modifié que les contrôleurs.

## Modèles de données

### User (collection `users`)

| Champ | Type | Règles |
| --- | --- | --- |
| `name` | String | Obligatoire, espaces retirés (`trim`) |
| `email` | String | Obligatoire, **unique**, minuscules, format validé par regex |
| `age` | Number | Minimum 4 |
| `role` | String | `user` ou `admin` (défaut : `user`) |
| `bio` | String | Optionnel, 200 caractères maximum |
| `phone` | String | Optionnel, exactement 8 chiffres |
| `createdAt`, `updatedAt` | Date | Ajoutés automatiquement (`timestamps`) |

### Article (collection `articles`)

| Champ | Type | Règles |
| --- | --- | --- |
| `title` | String | Obligatoire, espaces retirés |
| `content` | String | Obligatoire |
| `author` | ObjectId | Obligatoire, référence vers `User` (`ref: 'User'`) |
| `createdAt`, `updatedAt` | Date | Ajoutés automatiquement |

### Relation

Un utilisateur écrit plusieurs articles (**1:N**). L'article ne stocke que l'`_id` de son auteur ; `.populate('author', 'name email')` le remplace par `{ _id, name, email }` à la lecture.

## Documentation de l'API

URL de base : `http://localhost:3000`. Les corps de requête sont en JSON (`Content-Type: application/json`).

### Utilisateurs : `/api/users`

| Méthode | Route | Description | Codes de réponse |
| --- | --- | --- | --- |
| `POST` | `/api/users` | Crée un utilisateur | 201, 400, 409, 500 |
| `GET` | `/api/users` | Liste tous les utilisateurs | 200, 500 |
| `GET` | `/api/users/:id` | Détail d'un utilisateur | 200, 400, 404, 500 |
| `DELETE` | `/api/users/:id` | Supprime un utilisateur **sans article** | 200, 400, 404, 500 |

### Articles : `/api/articles`

| Méthode | Route | Description | Codes de réponse |
| --- | --- | --- | --- |
| `GET` | `/api/articles` | Liste les articles avec leur auteur (`populate`) | 200, 500 |
| `POST` | `/api/articles` | Crée un article lié à un auteur | 201, 400, 404, 500 |
| `GET` | `/api/articles/:id` | Détail d'un article avec son auteur | 200, 400, 404, 500 |
| `PUT` | `/api/articles/:id` | Modifie un article | 200, 404, 500 |
| `DELETE` | `/api/articles/:id` | Supprime un article | 200, 404, 500 |

### Exemples

**Créer un utilisateur** (les `_id` ci-dessous sont des exemples : MongoDB en génère de nouveaux)

```http
POST /api/users
Content-Type: application/json

{
  "name": "Aya Ben Salah",
  "email": "aya@polytechnique.tn",
  "age": 22,
  "role": "admin"
}
```

Réponse `201 Created` :

```json
{
  "_id": "665a1b2c3d4e5f6a7b8c9d0e",
  "name": "Aya Ben Salah",
  "email": "aya@polytechnique.tn",
  "age": 22,
  "role": "admin",
  "createdAt": "2026-10-13T10:00:00.000Z",
  "updatedAt": "2026-10-13T10:00:00.000Z",
  "__v": 0
}
```

**Créer un article lié à un auteur**

```http
POST /api/articles
Content-Type: application/json

{
  "title": "Maîtriser MongoDB et Mongoose",
  "content": "L'ODM Mongoose simplifie la validation et les relations NoSQL.",
  "authorId": "665a1b2c3d4e5f6a7b8c9d0e"
}
```

Réponse `201 Created` : le champ `author` est un objet grâce à `populate` :

```json
{
  "_id": "665a1b2c3d4e5f6a7b8c9d0f",
  "title": "Maîtriser MongoDB et Mongoose",
  "content": "L'ODM Mongoose simplifie la validation et les relations NoSQL.",
  "author": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "name": "Aya Ben Salah",
    "email": "aya@polytechnique.tn"
  }
}
```

> Le champ envoyé s'appelle `authorId`, mais il est enregistré dans le champ `author` du document.

## Jeu de données de démonstration

Deux fichiers à la racine permettent de remplir la base : `users.json` (5 utilisateurs) et `articles.json` (8 articles). Les `_id` sont fixés à l'avance, donc chaque article pointe vers un auteur qui existe.

**Import avec MongoDB Compass**

1. Se connecter à `mongodb://127.0.0.1:27017`.
2. Cliquer sur **Create database** : base `blogDB`, première collection `users`.
3. Ouvrir `users` → **ADD DATA** → **Import JSON or CSV file** → choisir `users.json`.
4. Créer la collection `articles` dans `blogDB` et importer `articles.json` (toujours **après** les utilisateurs).

Utilisateurs utiles pour les tests :

| Utilisateur | `_id` | Articles | Usage pour les tests |
| --- | --- | --- | --- |
| Aya Ben Salah | `665f00000000000000000001` | 2 | `DELETE` refusé (400) |
| Yasmine Mansouri | `665f00000000000000000005` | 0 | `DELETE` autorisé (200) |

## Gestion des erreurs

| Situation | Code | Exemple de message |
| --- | --- | --- |
| Champs obligatoires manquants | 400 | `Le nom et l'email sont requis` |
| Donnée invalide (email, âge, téléphone...) | 400 | Message de la `ValidationError` Mongoose |
| Identifiant mal formé (`GET /api/articles/abc`) | 400 | `Identifiant de ressource invalide (format ObjectId attendu)` |
| Suppression d'un utilisateur ayant des articles | 400 | `Impossible de supprimer un utilisateur ayant des articles publies` |
| Ressource introuvable | 404 | `Article non trouve` |
| Email déjà utilisé | 409 | `Cet email est deja utilise` |
| Erreur inattendue (base inaccessible...) | 500 | Message de l'erreur |

> Un identifiant MongoDB valide fait 24 caractères hexadécimaux. Les fonctions `getUserById` et `getArticleById` détectent la `CastError` et répondent **400** (faute du client) au lieu de 500 (faute du serveur).

## Tests avec Postman

Scénario de validation, à exécuter dans l'ordre :

| N° | Requête | Résultat attendu |
| --- | --- | --- |
| 1 | `POST /api/users` avec un utilisateur valide | `201`, champ `_id` généré |
| 2 | `POST /api/users` avec un email sans `@` et `age: 2` | `400` (ValidationError) |
| 3 | `POST /api/articles` avec `authorId` | `201`, `author` contient `name` et `email` |
| 4 | `GET /api/articles` | `200`, chaque article avec son auteur |
| 5 | `POST /api/users` avec un email déjà utilisé | `409` |
| 6 | Arrêt (Ctrl+C) puis relance (`npm run dev`), puis `GET /api/articles` | Les données sont toujours présentes |
| 7 | `GET /api/articles/abc` | `400` et non `500` |
| 8 | `DELETE /api/users/<_id d'un auteur>` | `400` tant qu'il a des articles |

## Dépannage

| Symptôme | Cause probable | Solution |
| --- | --- | --- |
| `Missing script: "dev"` | Script absent de `package.json` | Ajouter le script `dev` (voir [Scripts npm](#scripts-npm)) |
| `ECONNREFUSED 127.0.0.1:27017` | Service MongoDB arrêté | Démarrer « MongoDB Server » dans les Services Windows |
| `L'URI MongoDB est manquant` | Fichier `.env` absent ou `MONGODB_URI` vide | Créer `.env` à partir de `.env.example` |
| `mongod` non reconnu dans le terminal | Dossier `bin` de MongoDB absent du PATH | Fermer et rouvrir le terminal, ou ajouter le dossier au PATH |
| `E11000 duplicate key` | Email déjà présent dans la base | Utiliser un autre email, ou supprimer le document existant |
| `404 Auteur non trouve` à la création d'un article | `authorId` ne correspond à aucun utilisateur | Copier l'`_id` d'un utilisateur existant |

## Sécurité

- Le fichier **`.env` n'est jamais versionné** : il est listé dans `.gitignore`. Seul `.env.example`, sans secret, est publié.
- En local, MongoDB n'exige pas d'identifiants. En production (MongoDB Atlas par exemple), l'URI contiendra un mot de passe : il doit rester dans `.env`, jamais dans le code.
- Les données sont validées par les schémas Mongoose avant d'être enregistrées.

## Évolutions prévues

- **Séance 4** : hachage des mots de passe avec `bcrypt`, authentification par **JSON Web Tokens (JWT)**, middlewares d'authentification pour restreindre la création et la modification d'articles aux utilisateurs connectés.

## Auteur

- **Auteur** : `Mohamed Khalil Khelifi`
- **Établissement** : École Polytechnique de Sousse, année universitaire 2026-2027

Projet à but pédagogique.
