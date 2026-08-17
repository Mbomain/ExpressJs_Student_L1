# Students API - Express.js + TypeScript + PostgreSQL

API REST complète pour la gestion des étudiants avec architecture inspirée de Spring Boot.

## Architecture

```
src/
├── configuration/  # Pool PostgreSQL, middleware CORS
├── controllers/    # Gère les requêtes HTTP        (Student, Auth)
├── services/       # Logique métier                (Student, Auth)
├── repositories/   # Accès aux données             (Student, User)
├── models/         # Types et interfaces           (Student, User)
├── security/       # Mécanisme de sécurité JWT
└── index.ts        # Point d'entrée
```

### Dossier `security/`

Le mécanisme de sécurité uniquement — les couches auth suivent le découpage du projet
(`models/User.ts`, `repositories/UserRepository.ts`, `services/AuthService.ts`,
`controllers/AuthController.ts`).

```
src/security/
├── jwt.ts              # signAccessToken / verifyAccessToken
├── AuthMiddleware.ts   # authenticate + authorize(...roles)
└── HttpError.ts        # Error porteuse d'un status HTTP
```

## Prérequis

- Node.js >= 18
- PostgreSQL >= 12
- npm ou yarn

## Installation

```bash
# Cloner le projet et installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials PostgreSQL

# Créer les tables dans la BD
npm run migrate
```

## Démarrer l'application

```bash
# Mode développement avec hot reload
npm run dev

# Build pour production
npm run build
npm start
```

Le serveur sera disponible sur `http://localhost:3000`

## Sécurité (JWT)

Tous les endpoints `/api/students` sont protégés par un access token JWT (HS256) à envoyer dans
l'en-tête `Authorization: Bearer <token>`.

| Endpoint                  | Accès                    |
| ------------------------- | ------------------------ |
| `GET /health`             | Public                   |
| `POST /api/auth/register` | Public (rôle `STUDENT`)  |
| `POST /api/auth/login`    | Public                   |
| `GET /api/auth/whoami`        | Authentifié              |
| `GET /api/students`       | Authentifié              |
| `GET /api/students/:id`   | Authentifié              |
| `POST /api/students`      | Rôle `ADMIN`             |
| `PUT /api/students/:id`   | Rôle `ADMIN`             |
| `PATCH /api/students/:id` | Rôle `ADMIN`             |
| `DELETE /api/students/:id`| Rôle `ADMIN`             |

Réponses d'erreur de sécurité :

- `401` : token absent ou malformé (`Missing or malformed Authorization header`), token invalide ou
  expiré (`Invalid or expired token`), mauvais identifiants (`Invalid credentials`)
- `403` : token valide mais rôle insuffisant (`Insufficient permissions`)

### POST /api/auth/register

Crée un compte. Le rôle est toujours `STUDENT` (le champ `role` du body est ignoré, pas
d'escalade de privilèges possible). Mot de passe : 8 caractères minimum, stocké hashé avec bcrypt.

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "jean.dupont@example.com", "password": "password123"}'
```

**Réponse:** 201 Created

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "email": "jean.dupont@example.com", "role": "STUDENT" }
}
```

### POST /api/auth/login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jean.dupont@example.com", "password": "password123"}'
```

**Réponse:** 200 OK (même corps que `register`) | 400 Bad Request | 401 Unauthorized

### GET /api/auth/whoami

```bash
curl http://localhost:3000/api/auth/whoami \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse:** 200 OK | 401 Unauthorized

### CORS

Le navigateur refuse à une page servie depuis une autre origine (`http://localhost:5173` par
exemple) de lire les réponses de l'API, sauf si l'API l'autorise explicitement. Le middleware
[cors](src/configuration/cors.ts) envoie ces autorisations :

- origines autorisées : valeur de `CORS_ORIGINS` (séparées par des virgules), `*` par défaut
- méthodes : `GET, POST, PUT, PATCH, DELETE`
- en-têtes acceptés : `Content-Type` et **`Authorization`** — sans ce dernier, un front ne peut pas
  envoyer son token JWT

Comme le token voyage dans l'en-tête `Authorization` et non dans un cookie, chaque appel protégé
déclenche d'abord une requête de vérification `OPTIONS` (préflight) :

```bash
curl -i -X OPTIONS http://localhost:3000/api/students \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

Une origine non autorisée reçoit une réponse **sans** `Access-Control-Allow-Origin` : le navigateur
bloque alors la lecture côté front. `curl` et Postman ne sont pas concernés, ils n'appliquent pas
cette règle.

### Créer un administrateur

`register` ne crée que des `STUDENT`. Les administrateurs se créent en ligne de commande :

```bash
npm run create:admin -- admin@example.com motdepasse123
```

### Appeler un endpoint protégé

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "motdepasse123"}' | jq -r .accessToken)

curl http://localhost:3000/api/students -H "Authorization: Bearer $TOKEN"
```

## Endpoints API

> Tous les endpoints ci-dessous exigent l'en-tête `Authorization: Bearer <token>` (voir
> [Sécurité (JWT)](#sécurité-jwt)).

### GET /api/etudiants
Liste tous les étudiants
```bash
curl http://localhost:3000/api/etudiants
```
**Réponse:** 200 OK

### GET /api/etudiants/:id
Récupère un étudiant par ID
```bash
curl http://localhost:3000/api/etudiants/1
```
**Réponse:** 200 OK | 404 Not Found

### POST /api/etudiants
Crée un nouvel étudiant
```bash
curl -X POST http://localhost:3000/api/etudiants \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+33612345678",
    "dateOfBirth": "2000-01-15",
    "address": "123 Rue de Paris"
  }'
```
**Réponse:** 201 Created

### PUT /api/etudiants/:id
Met à jour complètement un étudiant
```bash
curl -X PUT http://localhost:3000/api/etudiants/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Martin",
    "email": "jean.martin@example.com",
    "phone": "+33698765432"
  }'
```
**Réponse:** 200 OK | 404 Not Found

### PATCH /api/etudiants/:id
Met à jour partiellement un étudiant
```bash
curl -X PATCH http://localhost:3000/api/etudiants/1 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+33698765432"
  }'
```
**Réponse:** 200 OK | 404 Not Found

### DELETE /api/etudiants/:id
Supprime un étudiant
```bash
curl -X DELETE http://localhost:3000/api/etudiants/1
```
**Réponse:** 204 No Content | 404 Not Found

## Gestion des erreurs

L'API retourne des réponses d'erreur structurées :

```json
{
  "error": "Message d'erreur",
  "status": 400,
  "path": "/api/etudiants"
}
```

Codes d'erreur :
- `400` : Requête invalide (validation échouée)
- `404` : Ressource non trouvée
- `500` : Erreur serveur

## Structure de données

### Student
```typescript
{
  id: number              // ID auto-généré
  firstName: string       // Prénom (requis)
  lastName: string        // Nom (requis)
  email: string          // Email unique (requis)
  phone?: string         // Téléphone (optionnel)
  dateOfBirth?: Date     // Date de naissance (optionnel)
  address?: string       // Adresse (optionnel)
  createdAt: Date        // Date de création
  updatedAt: Date        // Date de modification
}
```

## Validation

- Email unique et valide
- Prénom et nom obligatoires
- Email obligatoire

## Outils pour tester l'API

- **Postman** : https://www.postman.com/downloads/
- **Thunder Client** : Extension VS Code
- **curl** : Ligne de commande

## Variables d'environnement

```env
DATABASE_URL="postgresql://user:password@localhost:5432/students_db"
PORT=3000
NODE_ENV=development

# Security (JWT)
JWT_SECRET="change-me-with-a-long-random-string"   # requis, l'app refuse de démarrer sans
JWT_EXPIRES_IN=1h                                  # optionnel (défaut: 1h)

# CORS
CORS_ORIGINS=http://localhost:5173                 # optionnel (défaut: *), séparées par des virgules
```

Générer un secret :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Scripts utiles

```bash
# Exécuter les migrations SQL
npm run migrate

# Créer un compte administrateur
npm run create:admin -- admin@example.com motdepasse123

# Build pour production
npm run build

# Lancer en production
npm start
```

## Développement

Pour développer localement :

1. Installer les dépendances : `npm install`
2. Configurer `.env` avec votre BD locale
3. Lancer les migrations : `npm run migrate`
4. Démarrer le serveur : `npm run dev`
5. Les changements TypeScript sont détectés automatiquement (hot reload)
#   E x p r e s s J s _ S t u d e n t _ L 1  
 