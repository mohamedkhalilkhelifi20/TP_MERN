# API Blog - TP2 : Architecture modulaire (SoC)

Projet réalisé dans le cadre du cours **MERN Stack - Séance 2** (École Polytechnique de Sousse, 2026-2027).

Ce TP transforme un serveur Express écrit dans un seul fichier en une **API REST structurée**, en appliquant le principe de **séparation des préoccupations** (*Separation of Concerns*, SoC). Il ajoute aussi les opérations **PUT** et **DELETE**, une seconde ressource (**users**) et un module de validation réutilisable.

---

## Table des matières

1. [Objectifs](#objectifs)
2. [Technologies](#technologies)
3. [Architecture du projet](#architecture-du-projet)
4. [Installation et lancement](#installation-et-lancement)
5. [Endpoints de l'API](#endpoints-de-lapi)
6. [Exemples de requêtes et de réponses](#exemples-de-requêtes-et-de-réponses)
7. [Codes de statut HTTP utilisés](#codes-de-statut-http-utilisés)
8. [Validation des données](#validation-des-données)
9. [Tester avec Postman](#tester-avec-postman)
10. [Limites actuelles et suite du projet](#limites-actuelles-et-suite-du-projet)

---

## Objectifs

- Découper le serveur en trois couches : `server.js`, `routes/` et `controllers/`.
- Compléter le CRUD des articles avec **PUT** (modifier) et **DELETE** (supprimer).
- Appliquer la même architecture à une nouvelle ressource, les **utilisateurs**, sans modifier le code des articles.
- Isoler les contrôles de saisie dans un module réutilisable (`utils/validators.js`).
- Valider le comportement de l'API avec Postman.

## Technologies

| Outil | Rôle |
|-------|------|
| Node.js | Environnement d'exécution JavaScript |
| Express | Framework web pour créer l'API |
| Postman | Test des requêtes HTTP |
| Git / GitHub | Versionnement (branche `TP2`) |

## Architecture du projet

```
mon-api-blog/
|-- server.js                  Point d'entrée : configuration, middlewares, montage des routeurs
|-- package.json
|-- routes/
|   |-- articleRoutes.js       Aiguillage des URL /api/articles
|   `-- userRoutes.js          Aiguillage des URL /api/users
|-- controllers/
|   |-- articleController.js   Logique métier des articles
|   `-- userController.js      Logique métier des utilisateurs
`-- utils/
    `-- validators.js          Fonctions de validation réutilisables
```

### Rôle de chaque couche

L'analogie du restaurant aide à les retenir :

| Fichier / dossier | Rôle | Analogie |
|-------------------|------|----------|
| `server.js` | Démarre le serveur, active `express.json()`, monte les routeurs sous leur préfixe | Le gérant |
| `routes/` | Associe un verbe HTTP + un chemin à la bonne fonction du contrôleur | Le serveur en salle |
| `controllers/` | Applique la logique métier et renvoie la réponse JSON | Le chef cuisinier |
| `utils/` | Fonctions d'aide partagées (validation) | Les outils de cuisine |

### Trajet d'une requête

```
Client (Postman)
   -> server.js          reçoit la requête, lit le JSON, choisit le bon préfixe
   -> routes/            associe verbe + chemin à une fonction
   -> controllers/       traite la demande et renvoie res.json(...)
```

Les chemins des routeurs sont **relatifs** : `'/'` désigne la racine de la ressource. Le préfixe (`/api/articles`, `/api/users`) est défini une seule fois dans `server.js` avec `app.use(...)`.

## Installation et lancement

### Prérequis

- [Node.js](https://nodejs.org/) (version 18 ou plus récente recommandée)
- npm (installé avec Node.js)

### Étapes

```bash
# 1. Cloner le dépôt et se placer sur la branche TP2
git clone https://github.com/mohamedkhalilkhelifi20/TP_MERN.git
cd TP_MERN
git checkout TP2

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur
node server.js
```

Le serveur écoute sur **http://localhost:3000**. Le message suivant s'affiche dans le terminal :

```
Serveur modulaire en écoute sur http://localhost:3000
```

Vérification rapide : `GET http://localhost:3000/` doit répondre

```json
{ "message": "API du Blog - Serveur Modulaire Opérationnel (SoC)" }
```

> Le dossier `node_modules/` n'est pas versionné (il est dans `.gitignore`). La commande `npm install` le recrée.

## Endpoints de l'API

### Articles - `/api/articles`

| Méthode | URL | Description | Statuts possibles |
|---------|-----|-------------|-------------------|
| GET | `/api/articles` | Liste tous les articles (filtre optionnel `?author=Nom`) | 200 |
| GET | `/api/articles/:id` | Récupère un article par son ID | 200, 404 |
| POST | `/api/articles` | Crée un article (`title` et `author` obligatoires) | 201, 400 |
| PUT | `/api/articles/:id` | Modifie le titre et/ou l'auteur d'un article | 200, 404 |
| DELETE | `/api/articles/:id` | Supprime un article | 200, 404 |

### Utilisateurs - `/api/users`

| Méthode | URL | Description | Statuts possibles |
|---------|-----|-------------|-------------------|
| GET | `/api/users` | Liste tous les utilisateurs (filtre optionnel `?role=admin`) | 200 |
| GET | `/api/users/:id` | Récupère un utilisateur par son ID | 200, 404 |
| POST | `/api/users` | Crée un utilisateur (`name` et `email` valides obligatoires) | 201, 400 |
| DELETE | `/api/users/:id` | Supprime un utilisateur | 200, 404 |

## Exemples de requêtes et de réponses

Pour les requêtes avec un corps (POST, PUT), ajouter l'en-tête `Content-Type: application/json`.

### Modifier un article (PUT)

`PUT /api/articles/2`

```json
{ "title": "Express et Architecture SoC Maîtrisés" }
```

Réponse `200 OK` :

```json
{
  "message": "Article mis à jour",
  "article": { "id": 2, "title": "Express et Architecture SoC Maîtrisés", "author": "Aya" }
}
```

### Modifier un article inexistant

`PUT /api/articles/99` -> `404 Not Found`

```json
{ "error": "Article 99 introuvable" }
```

### Supprimer un article (DELETE)

`DELETE /api/articles/1` -> `200 OK`

```json
{ "message": "Article 1 supprimé avec succès" }
```

Si on répète la même requête, l'article n'existe plus : `404 Not Found`

```json
{ "error": "Impossible de supprimer : article 1 introuvable" }
```

### Créer un utilisateur valide (POST)

`POST /api/users`

```json
{ "name": "Sami Gharbi", "email": "sami@example.com", "role": "user" }
```

Réponse `201 Created` :

```json
{
  "message": "Utilisateur créé",
  "user": { "id": 3, "name": "Sami Gharbi", "email": "sami@example.com", "role": "user" }
}
```

### Créer un utilisateur avec un email invalide

`POST /api/users` avec `{ "name": "Sami", "email": "samiexample" }` -> `400 Bad Request`

```json
{ "error": "L'email est invalide : il doit contenir '@' et '.'" }
```

### Créer un utilisateur avec un nom vide

`POST /api/users` avec `{ "name": "  ", "email": "a@b.com" }` -> `400 Bad Request`

```json
{ "error": "Le nom est obligatoire et ne doit pas être vide" }
```

## Codes de statut HTTP utilisés

| Code | Signification | Quand ? |
|------|---------------|---------|
| 200 OK | Succès | Lecture, modification, suppression réussies |
| 201 Created | Ressource créée | POST réussi |
| 400 Bad Request | Données invalides | Champ manquant, nom vide, email invalide |
| 404 Not Found | Ressource introuvable | ID inexistant |

## Validation des données

Le module `utils/validators.js` regroupe les contrôles réutilisables :

| Fonction | Vérifie que... |
|----------|----------------|
| `estNonVide(chaine)` | la valeur est une chaîne non vide, une fois les espaces retirés avec `.trim()` |
| `estEmailValide(email)` | l'email est une chaîne qui contient `@` et `.` |

Elles sont importées dans les contrôleurs avec :

```js
const { estNonVide, estEmailValide } = require('../utils/validators');
```

Centraliser ces règles évite de les recopier dans chaque contrôleur : si une règle change, on la corrige à un seul endroit. Le contrôle de l'email est volontairement simple pour ce TP ; une application réelle utiliserait une expression régulière ou une bibliothèque dédiée.

## Tester avec Postman

1. Lancer le serveur avec `node server.js`.
2. Dans Postman, choisir la méthode et saisir l'URL (par exemple `http://localhost:3000/api/articles`).
3. Pour POST et PUT : onglet **Body** -> **raw** -> format **JSON**, puis saisir le corps de la requête.
4. Cliquer sur **Send** et vérifier le **statut** et le **JSON** de la réponse.

Scénario conseillé :

1. `PUT /api/articles/2` avec un nouveau titre -> 200.
2. `PUT /api/articles/99` -> 404.
3. `DELETE /api/articles/1` -> 200, puis une 2e fois -> 404.
4. `GET /api/users`, puis `POST /api/users` valide -> 201.
5. `POST /api/users` avec un email invalide -> 400.

## Limites actuelles et suite du projet

- Les données sont stockées **en mémoire** (tableaux JavaScript) : elles sont perdues à chaque redémarrage du serveur.
- Il n'y a pas encore d'authentification.
- Le DELETE des utilisateurs et des articles n'est pas protégé.

**Séance suivante :** connexion à **MongoDB Atlas** avec **Mongoose**. Grâce à l'architecture modulaire, seuls les contrôleurs changeront (appels asynchrones comme `await Article.find()` à la place des tableaux) ; les routes et `server.js` resteront presque identiques.

---

*TP2 - MERN Stack - École Polytechnique de Sousse*
