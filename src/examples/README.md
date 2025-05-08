
# Application de Gestion de Projets

Cette application permet la gestion de projets, tâches, employés et utilisateurs avec différents rôles et permissions.

## Technologies utilisées

- **Frontend**: React.js, Tailwind CSS, Shadcn/UI
- **Backend**: PHP, MySQL

## Prérequis

- Node.js et npm installés
- XAMPP (ou équivalent avec PHP 7.4+ et MySQL)
- Un navigateur web moderne

## Installation et configuration

### 1. Configuration de la base de données

1. Démarrez XAMPP et assurez-vous que les services Apache et MySQL sont en cours d'exécution
2. Accédez à phpMyAdmin (http://localhost/phpmyadmin)
3. Créez une nouvelle base de données nommée `gestion_des_projets`
4. Importez le fichier SQL fourni ou exécutez les requêtes SQL du fichier de création de la base de données

### 2. Configuration du Backend PHP

1. Copiez le dossier `api` du répertoire `src/examples/php` vers le répertoire `htdocs` de XAMPP (ou l'équivalent selon votre configuration)
2. Assurez-vous que le chemin d'accès est correct (par défaut: `http://localhost/api`)
3. Modifiez les fichiers de connexion à la base de données si nécessaire (nom d'utilisateur, mot de passe, hôte)

### 3. Installation et démarrage du Frontend React

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Modifiez le fichier `src/services/api.ts` pour qu'il pointe vers l'URL correcte de votre API PHP (par défaut: `http://localhost/api`)

3. Démarrez l'application React :
   ```bash
   npm run dev
   ```

4. Accédez à l'application dans votre navigateur (par défaut: `http://localhost:5173`)

## Utilisation

### Comptes par défaut

L'application propose plusieurs comptes de test avec différents rôles :

- **Administrateur**: 
  - Nom d'utilisateur: `admin`
  - Mot de passe: `admin`

- **Gérant**: 
  - Nom d'utilisateur: `manager`
  - Mot de passe: `manager`

- **Chef de Projet**: 
  - Nom d'utilisateur: `pm`
  - Mot de passe: `pm`

- **Employé**: 
  - Nom d'utilisateur: `employee`
  - Mot de passe: `employee`

## Structure de l'API PHP

L'API est organisée selon une structure RESTful :

- `api/auth/` - Endpoints d'authentification
- `api/projects/` - Gestion des projets
- `api/tasks/` - Gestion des tâches
- `api/users/` - Gestion des utilisateurs
- `api/reports/` - Gestion des rapports

## Sécurité

Pour une utilisation en production :

1. Utilisez HTTPS au lieu de HTTP
2. Mettez en place un système de jetons JWT pour l'authentification au lieu des sessions PHP
3. Hachage des mots de passe avec `password_hash()` et `password_verify()`
4. Configuration d'une politique CORS plus stricte
5. Vérification des entrées et sorties pour éviter les injections SQL et XSS
