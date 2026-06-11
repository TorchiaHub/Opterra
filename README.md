# TenderFlow

Piattaforma di gestione gare d'appalto con multi-tenancy, AI, scraping e flussi di approvazione.

## Stack

- **Backend**: Node.js 20 + Express + MySQL 8
- **Frontend**: React 18 + Vite + React Router
- **Auth**: JWT (access 15m + refresh 7d con rotation) + RBAC
- **Container**: Docker + Docker Compose

## Prerequisiti

- Node.js 20+
- MySQL 8 (o Docker)
- npm

## Avvio rapido

### 1. Docker (produzione-like)

```bash
# Clona e entra
git clone https://github.com/TorchiaHub/Opterra.git
cd Opterra

# Configura ambiente
cp .env.example .env
# (modifica .env con password e secret sicuri)

# Avvia MySQL + Backend
docker compose up -d mysql backend

# (opzionale) Avvia anche Frontend
docker compose --profile frontend up -d

# Esegui migrazioni e seed
docker compose exec backend npm run migrate
docker compose exec backend npm run seed

# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

### 2. Sviluppo locale (senza Docker)

#### Database

```bash
# Assicurati che MySQL 8 sia in esecuzione su localhost:3306
# Crea database e utente:
mysql -u root -p -e "
  CREATE DATABASE IF NOT EXISTS tenderflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS 'tenderflow_user'@'%' IDENTIFIED BY 'tenderflow_pass';
  GRANT ALL PRIVILEGES ON tenderflow.* TO 'tenderflow_user'@'%';
  FLUSH PRIVILEGES;
"
```

Oppure via Node:
```bash
node -e "
const mysql = require('mysql2/promise');
const conn = await mysql.createConnection({host:'localhost',port:3306,user:'root',password:'password'});
await conn.query('CREATE DATABASE IF NOT EXISTS \`tenderflow\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
await conn.query(\"CREATE USER IF NOT EXISTS 'tenderflow_user'@'%' IDENTIFIED BY 'tenderflow_pass'\");
await conn.query(\"GRANT ALL PRIVILEGES ON tenderflow.* TO 'tenderflow_user'@'%'\");
await conn.query('FLUSH PRIVILEGES');
await conn.end();
"
```

#### Backend

```bash
cd backend
cp ../.env.example ../.env
# Modifica DB_HOST=localhost, DB_USER=tenderflow_user, DB_PASSWORD=tenderflow_pass

npm install
npm run migrate
npm run seed
npm start       # http://localhost:3000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

## Utenti di default

| Ruolo       | Email                    | Password    |
|-------------|--------------------------|-------------|
| Superadmin  | admin@tenderflow.app     | admin123    |
| Manager     | marco@demo.it            | password123 |
| Utente      | lisa@demo.it             | password123 |

## Comandi disponibili

```bash
# Backend
cd backend
npm run migrate        # Esegue migrazioni DB
npm run seed           # Carica dati iniziali (piani, ruoli, demo, superadmin)
npm start              # Avvia server Express su :3000
npm test               # Esegue test (vitest)
npm run migrate:reset  # Reimposta DB (drop + migrate + seed)

# Frontend
cd frontend
npm run dev            # Avvia Vite dev server su :5173
npm run build          # Build produzione
```

## Variabili d'ambiente (`.env`)

| Variabile             | Default                    | Descrizione                              |
|-----------------------|----------------------------|------------------------------------------|
| `PORT`                | `3000`                     | Porta backend                            |
| `DB_HOST`             | `mysql`                    | Host database (usare `localhost` in dev) |
| `DB_PORT`             | `3306`                     | Porta database                           |
| `DB_NAME`             | `tenderflow`               | Nome database                            |
| `DB_USER`             | `tenderflow_user`          | Utente database                          |
| `DB_PASSWORD`         | `tenderflow_pass`          | Password database                        |
| `DB_ROOT_USER`        | `root`                     | Utente root DB (solo per test)           |
| `DB_ROOT_PASSWORD`    | `password`                 | Password root DB (solo per test)         |
| `JWT_SECRET`          | —                          | Segreto JWT access (min 32 caratteri)     |
| `JWT_REFRESH_SECRET`  | —                          | Segreto JWT refresh (min 32 caratteri)    |
| `CORS_ORIGINS`        | `http://localhost:5173,...`| Origini CORS (separate da virgola)       |
| `STORAGE_PATH`        | `/storage`                 | Percorso storage documenti               |
| `OPENAI_API_KEY`      | —                          | API key OpenAI (opzionale)               |
| `SCRAPING_CRON`       | `0 6 * * *`               | Espressione cron scraping                |

## Test

```bash
cd backend
npm test
```

I test creano/eliminano automaticamente un database `tenderflow_test` temporaneo. Usano le credenziali `DB_ROOT_USER`/`DB_ROOT_PASSWORD` per creare il database, poi eseguono migrazioni + seed su di esso.

## Struttura progetto

```
Opterra/
├── backend/
│   ├── migrations/          # Migration SQL (001-005)
│   ├── seeds/               # Seed dati iniziali
│   ├── src/
│   │   ├── app.js           # Entry point Express
│   │   ├── config/          # Configurazioni (db, logger, migrate, seed)
│   │   ├── middleware/       # rateLimiter, errorHandler, auth, tenant, rbac
│   │   ├── modules/         # Controller + service + queries + routes + validators
│   │   │   ├── admin/       # Superadmin: tenants, plans, users, usage, audit
│   │   │   ├── ai/          # AI requests, chatbot, scraping
│   │   │   ├── auth/        # Login, register, refresh, logout
│   │   │   ├── documents/   # Upload/download con versioning
│   │   │   ├── requirements/# Checklist requisiti gara
│   │   │   ├── tasks/       # Kanban, commenti, approvali multi-step
│   │   │   ├── tenders/     # CRUD gare, dashboard KPI, changeStatus
│   │   │   └── users/       # CRUD utenti, gruppi, inviti
│   │   └── tests/           # Test con vitest + supertest
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/             # Chiamate API (axios)
│   │   ├── components/      # Componenti riutilizzabili
│   │   ├── contexts/        # React Context (auth, tenant)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Pagine (public, auth, dashboard)
│   │   └── styles/          # CSS modules
│   └── Dockerfile
├── docker-compose.yml       # MySQL + Backend + Frontend (opt-in)
├── .env.example
└── README.md
```

## Endpoints API principali

| Metodo | Path                           | Ruolo minimo | Descrizione                   |
|--------|--------------------------------|--------------|-------------------------------|
| POST   | `/api/auth/login`              | —            | Login                         |
| POST   | `/api/auth/register`           | —            | Registrazione (con invito)    |
| POST   | `/api/auth/refresh`            | —            | Refresh token                 |
| POST   | `/api/auth/logout`             | auth         | Logout                        |
| GET    | `/api/health`                  | —            | Health check (DB + storage)   |
| GET    | `/api/tenders`                 | user         | Lista gare (paginata)         |
| POST   | `/api/tenders`                 | manager      | Crea gara                     |
| GET    | `/api/tenders/dashboard/kpi`   | user         | KPI dashboard                 |
| GET    | `/api/requirements/:tenderId`  | user         | Checklist requisiti           |
| GET/POST| `/api/documents/:tenderId`    | user         | Documenti con versioning      |
| GET/POST| `/api/tasks/:tenderId`       | user         | Task kanban                   |
| POST   | `/api/tasks/:taskId/approve`  | manager      | Approvazione multi-step       |
| POST   | `/api/ai/extract`             | manager      | Estrai requisiti con AI       |
| GET    | `/api/audit`                  | manager      | Audit log (paginato)          |
| GET    | `/api/admin/tenants`          | superadmin   | Lista tenants                 |
| PATCH  | `/api/admin/tenants/:id/plan` | superadmin   | Cambia piano tenant           |
| PATCH  | `/api/admin/tenants/:id/block`| superadmin   | Blocca/sblocca tenant         |
| GET    | `/api/admin/plans`            | superadmin   | Lista piani                   |
| GET    | `/api/admin/usage`            | superadmin   | Monitoraggio utilizzo         |

## API completa

La documentazione completa delle API (con esempi richiesta/risposta) è in `connessioni.md`.
