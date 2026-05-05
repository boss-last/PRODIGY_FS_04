# PRODIGY_FS_04 — Application de Chat en Temps Réel

Application de chat fullstack en temps réel développée dans le cadre de **Task-04** chez Prodigy InfoTech. L'application propose une interface de type terminal avec des fonctionnalités de messagerie instantanée via WebSocket.

---

## Table des matières

- [Description](#description)
- [Fonctionnalités](#fonctionnalités)
- [Stack Technique](#stack-technique)
- [Captures d'écran](#captures-décran)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement](#lancement)
- [Variables d'environnement](#variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [API Endpoints](#api-endpoints)
- [Événements Socket.io](#événements-socketio)
- [Rôles Utilisateurs](#rôles-utilisateurs)
- [Auteur](#auteur)
- [Licence](#licence)

---

## Description

Cette application permet aux utilisateurs de communiquer en temps réel via des **salles de discussion publiques ou privées** et des **messages directs (DM)**. Elle intègre une authentification sécurisée par JWT, un historique de messages persistant dans MongoDB, des indicateurs de présence, des notifications, et le partage de fichiers multimédias.

Le design s'inspire des terminaux et clients IRC modernes avec un thème sombre, du phosphore vert sur fond noir, et une typographie monospace fonctionnelle.

---

## Fonctionnalités

- **Authentification** — Inscription / connexion sécurisée avec JWT et bcrypt
- **Messagerie temps réel** — Messages instantanés via WebSocket (Socket.io)
- **Salles de discussion** — Création de salons publics ou privés, rejoindre/quitter
- **Messages directs (DM)** — Conversations privées 1-to-1
- **Historique** — Persistance des messages dans MongoDB avec pagination
- **Présence utilisateurs** — Statuts : en ligne, absent, ne pas déranger, hors ligne
- **Notifications** — Toasts pour les nouveaux messages directs
- **Partage de fichiers** — Upload d'images et documents (Multer, max 10 Mo)
- **Indicateurs de frappe** — "En train d'écrire..." en temps réel
- **Messages système** — Événements de connexion/déconnexion dans les salons
- **Fallback MongoDB** — Connexion automatique à mongodb-memory-server si MongoDB local est indisponible
- **Rôles** — Support des rôles `user` et `admin` dans le modèle utilisateur

---

## Stack Technique

| Couche | Technologies |
|--------|-------------|
| **Backend** | Node.js, Express, Socket.io, MongoDB (Mongoose), JWT, bcryptjs, Multer |
| **Frontend** | React 18, Vite, Socket.io-client, Lucide React |
| **Design** | CSS custom properties, thème terminal sombre |
| **Base de données** | MongoDB (local ou Docker) + fallback memory server |

---

## Prérequis

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/) local ou via Docker
- npm ou yarn

### Option Docker (MongoDB)

Un fichier `docker-compose.yml` est fourni pour démarrer MongoDB facilement :

```bash
docker-compose up -d
```

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/<ton-username>/PRODIGY_FS_04.git
cd PRODIGY_FS_04
```

### 2. Installer les dépendances backend

```bash
cd backend
npm install
```

### 3. Installer les dépendances frontend

```bash
cd ../frontend
npm install
```

---

## Lancement

### Démarrer MongoDB (si local)

```bash
# Option Docker (recommandé)
docker-compose up -d

# Ou manuellement
mongod
```

### Démarrer le backend

```bash
cd backend
npm start
```
Le serveur démarre sur `http://localhost:5000`

### Démarrer le frontend

```bash
cd frontend
npm run dev
```
Le frontend démarre sur `http://localhost:5173`

Ouvrir le navigateur sur `http://localhost:5173`

---

## Variables d'environnement

Créer un fichier `backend/.env` :

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prodigy_chat
JWT_SECRET=prodigy_fs_04_secret_key_change_in_production
```

---

## Structure du projet

```
PRODIGY_FS_04/
├── backend/
│   ├── src/
│   │   ├── server.js              # Point d'entrée Express + Socket.io
│   │   ├── models/
│   │   │   ├── User.js            # Modèle utilisateur (auth, rôle, présence)
│   │   │   ├── Message.js         # Modèle message (room, DM, fichiers)
│   │   │   └── Room.js            # Modèle salle de discussion
│   │   ├── routes/
│   │   │   ├── auth.js            # Register, Login, Me, Users, Status
│   │   │   ├── messages.js        # Historique messages, non lus
│   │   │   ├── rooms.js           # CRUD salles + rejoindre/quitter
│   │   │   └── upload.js          # Upload fichiers (Multer)
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT auth HTTP + Socket.io
│   │   └── utils/
│   │       └── socketHandler.js   # Gestionnaire événements Socket.io
│   ├── uploads/                   # Stockage fichiers uploadés
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Routage conditionnel Login/Chat
│   │   ├── main.jsx               # Entry point React
│   │   ├── index.css              # Thème terminal + variables CSS
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Connexion / Inscription
│   │   │   └── Chat.jsx           # Page principale de chat
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        # Barre latérale (RoomList + UserList)
│   │   │   ├── RoomList.jsx       # Liste des salons
│   │   │   ├── UserList.jsx       # Liste utilisateurs + présence
│   │   │   ├── ChatWindow.jsx     # Fenêtre de conversation active
│   │   │   ├── MessageList.jsx    # Affichage des messages
│   │   │   ├── MessageInput.jsx   # Saisie + upload fichiers
│   │   │   ├── CreateRoomModal.jsx # Modal création de salon
│   │   │   └── NotificationToast.jsx # Notifications push
│   │   └── context/
│   │       ├── AuthContext.jsx     # Contexte authentification JWT
│   │       └── SocketContext.jsx   # Contexte Socket.io + événements
│   └── package.json
├── docker-compose.yml             # MongoDB container
├── .gitignore
└── README.md
```

---

## API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| GET | `/api/auth/me` | Utilisateur courant |
| GET | `/api/auth/users` | Liste des utilisateurs |
| PATCH | `/api/auth/status` | Mettre à jour le statut |
| GET | `/api/rooms` | Liste des salons |
| POST | `/api/rooms` | Créer un salon |
| POST | `/api/rooms/:id/join` | Rejoindre un salon |
| POST | `/api/rooms/:id/leave` | Quitter un salon |
| GET | `/api/messages/room/:id` | Messages d'un salon |
| GET | `/api/messages/dm/:id` | Messages directs |
| GET | `/api/messages/unread` | Messages non lus |
| POST | `/api/upload` | Uploader un fichier |

---

## Événements Socket.io

| Événement | Direction | Description |
|-----------|-----------|-------------|
| `send_message` | Client → Serveur | Envoyer un message (room ou DM) |
| `typing` / `stop_typing` | Client → Serveur | Indicateur de frappe |
| `join_room` / `leave_room` | Client → Serveur | Rejoindre / quitter un salon |
| `new_message` | Serveur → Client | Nouveau message dans un salon |
| `new_dm` | Serveur → Client | Nouveau message direct reçu |
| `user_status_change` | Serveur → Client | Changement de statut utilisateur |
| `online_users` | Serveur → Client | Liste des utilisateurs en ligne |

---

## Rôles Utilisateurs

Le modèle `User` supporte deux rôles :

- `user` — Utilisateur standard (par défaut)
- `admin` — Administrateur

Le rôle est stocké dans la base de données et retourné dans les réponses API. Il peut être utilisé pour implémenter des fonctionnalités d'administration (modération de salons, gestion utilisateurs, etc.).

---

## Auteur

Développé dans le cadre du stage **Prodigy InfoTech — Task 04**.

---

## Licence

MIT
