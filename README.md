# Aura Stream - Web Music Streaming Platform

Aura Stream is a premium, secure, and modern web music streaming application that connects to a backend REST API and plays high-quality audio with synced scrolling lyrics.

---

## 📂 Project Architecture (Monorepo)

For maximum modularity, clean code, and standard professional workflows, the codebase is structured into two main packages under a monorepo setup:

```
VibeMusic_Coding/
├── client/              # React / Vite Client Application (Frontend)
│   ├── public/          # Static assets (images, icons)
│   ├── src/             # React application source code
│   │   ├── components/  # Modular UI Views (Landing, Login, Dashboard, Player)
│   │   ├── context/     # Global state providers (Auth, Audio playback)
│   │   ├── styles/      # Vanilla CSS custom animations and glassmorphism
│   │   └── api.js       # API client communication layer
│   └── package.json
│
├── server/              # Node.js / Express REST API (Backend)
│   ├── config/          # Connection pool initialization
│   ├── controllers/     # MVC controller handlers (Auth, Songs, Playlists)
│   ├── database/        # SQL schema definition and seed data
│   ├── middleware/      # JWT route protection middleware
│   ├── routes/          # Express API route mapping
│   ├── .env             # Environment configuration (ignored in Git)
│   └── server.js        # Main entry point
│
└── .gitignore           # Global git ignore configuration
```

---

## 🛠️ Technology Stack

*   **Frontend (client)**: React (v19), Vite, React Router, Lucide Icons, Vanilla CSS (Glassmorphism, custom animations).
*   **Backend (server)**: Node.js, Express, `mysql2` (Prepared statements), `bcryptjs` (Password cryptographical hashing), `jsonwebtoken` (JWT Session authentication).
*   **Database**: MySQL 8.0 (Local connection).

---

## 🚀 Getting Started

### 1. Database Setup
Ensure a MySQL server is running locally on port `3306`. Import the schema and mock seed data:
```bash
# Import Database Schema
mysql -u root -p123456 < server/database/schema.sql

# Import Mock Songs and Timed-Lyrics Seeds
mysql -u root -p123456 < server/database/seed.sql
```

### 2. Backend Server Setup
Navigate to the `server/` directory, configure environment variables, and run the server:
1. Ensure `server/.env` is set up:
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASS=123456
   DB_NAME=vibemusic_db
   JWT_SECRET=aura_stream_ultra_secure_jwt_secret_token_2026_key
   JWT_EXPIRES_IN=7d
   ```
2. Launch the backend server:
   ```bash
   cd server
   npm install
   npm start
   ```
   The backend API will run at `http://localhost:5000/`.

### 3. Frontend Client Setup
Navigate to the `client/` directory and spin up the development server:
```bash
cd client
npm install
npm run dev
```
The client dashboard will run at `http://localhost:5173/`.

---

## 🛡️ Security Implementations

*   **No SQLite / No Hardcoding**: Configured using standard pooled MySQL connection with environment variable overrides.
*   **BCrypt Hashing**: All user passwords are dynamically salted and hashed (`bcryptjs`) on the server before storage.
*   **JWT Tokens**: Secure endpoints require an authorization token provided in the HTTP `Authorization: Bearer <token>` header.
*   **SQL Injection Prevention**: All queries use prepared statements with parameter binding to prevent malicious injections.

---

## 🌳 Git Submission Recommendations

When pushing this project to GitHub/GitLab, follow these professional best practices:

1.  **Initialize Git at the Root**:
    *   Do **NOT** initialize git separately inside `client/` or `server/`. Initialize at the root folder `VibeMusic_Coding/`.
    ```bash
    git init
    ```
2.  **Verify `.gitignore` is Active**:
    *   Ensure that sensitive config files (`.env`) and heavy package directories (`node_modules`) are ignored.
    ```bash
    git status
    ```
    *Double-check that only `client/`, `server/`, `.gitignore`, and `README.md` are staged for commit (no node_modules or .env).*
3.  **Create Initial Commit**:
    ```bash
    git add .
    git commit -m "feat: initial commit of Aura Stream monorepo structure"
    ```
4.  **Publish to Remote**:
    ```bash
    git remote add origin <your-repository-url>
    git branch -M main
    git push -u origin main
    ```
