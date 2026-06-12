# Comanda — Opterra (TenderFlow) · WebApp B2B Multi-Tenant

> Documento di tracciamento: requisiti della comanda → dove sono implementati nel progetto.
> Branch di riferimento: `integration` | Data: Giugno 2026

---

## 1. Creare una webapp con Express.js / Auth JWT / Database MySQL

| Componente | Dove | Come |
|---|---|---|
| Express.js | [backend/src/app.js](backend/src/app.js) | App Express con helmet, CORS configurabile, rate limiting, Swagger UI su `/api/docs`, routing modulare (12 moduli) |
| Auth JWT | [backend/src/middleware/auth.middleware.js](backend/src/middleware/auth.middleware.js) e [backend/src/modules/auth/auth.service.js](backend/src/modules/auth/auth.service.js) | Access token JWT (15 min) con payload `{userId, tenantId, role, email}` + refresh token crittografico (7 giorni) salvato hashato SHA-256 e ruotato a ogni refresh |
| Database MySQL | [backend/src/config/db.js](backend/src/config/db.js) + [backend/migrations/](backend/migrations/) | Connection pool mysql2 verso il DB **opterra** su `localhost:3306` (config in [.env](.env)); 29 tabelle create da 5 migrazioni |

**Setup database eseguito:**
```
DB_HOST=localhost  DB_PORT=3306  DB_NAME=opterra  DB_USER=root  DB_PASSWORD=password
cd backend
npm run migrate   # 001_initial_schema → 005_admin_hardening (29 tabelle)
npm run seed      # piani, ruoli, superadmin, dati demo (3 utenti, 9 gare)
```

---

## 2. La webapp dev'essere relativa ad un'attività B2B

| Dove | Come |
|---|---|
| [Docs/01_tenderflow_riferimento_generale.md](Docs/01_tenderflow_riferimento_generale.md) | Opterra è un SaaS B2B per aziende che partecipano a bandi, gare d'appalto, RFP e RFQ |
| [backend/migrations/001_initial_schema.sql](backend/migrations/001_initial_schema.sql) | Tabella `tenants` con dati aziendali: `name`, `slug`, `vat_number` (P.IVA), `industry`, `country` |
| [backend/seeds/001_plans.sql](backend/seeds/001_plans.sql) | Piani di abbonamento B2B: Free / Pro / Enterprise con limiti su utenti, gare, storage e richieste AI |

---

## 3. La webapp dev'essere multi-tenant (stesso software/DB, più aziende clienti)

| Dove | Come |
|---|---|
| [backend/src/middleware/tenant.middleware.js](backend/src/middleware/tenant.middleware.js) | `resolveTenant` estrae il `tenantId` dal JWT e lo inietta in `req.tenantId` |
| [backend/migrations/](backend/migrations/) | Colonna `tenant_id` su tutte le tabelle business (`users`, `tenders`, `documents`, `tasks`, `audit_logs`, `groups`, …) |
| Tutte le query nei moduli (es. [backend/src/modules/tenders/tenders.queries.js](backend/src/modules/tenders/tenders.queries.js)) | Ogni query filtra obbligatoriamente per `tenant_id`: nessun dato cross-tenant può essere esposto |

**Flusso:** login → il JWT contiene `tenantId` → `verifyToken` decodifica → `resolveTenant` imposta `req.tenantId` → ogni query usa quel filtro.

---

## 4. Utente "admin" con accesso a qualsiasi gestione

| Dove | Come |
|---|---|
| [backend/seeds/002_roles.sql](backend/seeds/002_roles.sql) + [backend/seeds/004_superadmin.sql](backend/seeds/004_superadmin.sql) | Ruolo `superadmin` (scope globale) con utente seedato — credenziali in [Docs/accessi.md](Docs/accessi.md) |
| [backend/src/middleware/rbac.middleware.js](backend/src/middleware/rbac.middleware.js) | Gerarchia `superadmin(3) > manager(2) > user(1)`; guard `requireSuperadmin()` per le route admin |
| [backend/src/modules/admin/admin.routes.js](backend/src/modules/admin/admin.routes.js) | API `/api/admin/*`: gestione tenant, sottoscrizioni, utenti globali, audit globale |
| [frontend/src/pages/admin/](frontend/src/pages/admin/) | Pannello admin: AdminDashboard, TenantsPage, SubscriptionsPage, GlobalAuditPage — route `/admin/*` protette da `ProtectedRoute requiredRole=SUPERADMIN` in [frontend/src/App.jsx](frontend/src/App.jsx) |

---

## 5. Gestione gruppi/utenti (gruppo manager, gruppo user)

| Dove | Come |
|---|---|
| [backend/migrations/001_initial_schema.sql](backend/migrations/001_initial_schema.sql) | Tabelle `roles`, `user_roles`, `groups`, `group_members`, `invitations` |
| [backend/src/modules/users/users.routes.js](backend/src/modules/users/users.routes.js) | API complete (tutte `requireRole('manager')`): lista utenti, crea, invita, cambia ruolo, rimuovi, CRUD gruppi, aggiungi membri |
| [frontend/src/pages/private/UsersPage.jsx](frontend/src/pages/private/UsersPage.jsx) | UI gestione utenti e gruppi del tenant (visibile solo a manager) |

---

## 6. Sottoscrizione azienda → creazione automatica utente manager

| Dove | Come |
|---|---|
| [backend/src/modules/auth/auth.service.js](backend/src/modules/auth/auth.service.js) (`register`) | Operazione atomica: crea tenant + utente manager + subscription |
| [backend/src/modules/auth/auth.queries.js](backend/src/modules/auth/auth.queries.js) (`createTenantWithManager`) | INSERT `tenants` → `users` (password bcrypt) → `user_roles` (ruolo **manager** assegnato in automatico) → `subscriptions` (piano **free** attivo) |
| [frontend/src/pages/public/RegisterPage.jsx](frontend/src/pages/public/RegisterPage.jsx) | Form pubblico di registrazione azienda → `POST /api/auth/register` |

---

## 7. Utente manager: tutte le funzioni (compresa la gestione utenti)

| Dove | Come |
|---|---|
| [backend/src/middleware/rbac.middleware.js](backend/src/middleware/rbac.middleware.js) | Livello 2: il manager accede a tutte le route `requireRole('manager')` e `requireRole('user')` |
| [backend/src/modules/tenders/tenders.routes.js](backend/src/modules/tenders/tenders.routes.js) | **Solo manager**: crea gara (`POST`), modifica (`PATCH /:id`), cambio stato, assegnazioni, eliminazione |
| [backend/src/modules/users/users.routes.js](backend/src/modules/users/users.routes.js) | **Solo manager**: gestione utenti e gruppi del tenant |
| [frontend/src/utils/guards.js](frontend/src/utils/guards.js) + [frontend/src/hooks/usePermissions.js](frontend/src/hooks/usePermissions.js) | Guard frontend: `canManageTenders`, `canManageUsers`, `canDelete` → true per manager/superadmin |

---

## 8. Utente user: funzioni dedicate

| Dove | Come |
|---|---|
| [backend/src/modules/tenders/tenders.routes.js](backend/src/modules/tenders/tenders.routes.js) | Lo user **visualizza** le gare (`GET /api/tenders`, `GET /api/tenders/:id`, dashboard KPI) ma **non può crearle né modificarle**: `POST/PATCH/DELETE` rispondono 403 per ruolo `user` |
| [frontend/src/pages/private/TendersListPage.jsx](frontend/src/pages/private/TendersListPage.jsx) | Il pulsante e la modale "Nuova gara" sono renderizzati solo se `canManageTenders` (manager+) |
| [frontend/src/pages/private/TenderDetailPage.jsx](frontend/src/pages/private/TenderDetailPage.jsx) | Il pulsante di modifica gara è visibile solo a manager+ |
| Moduli tasks, documents, AI, chatbot ([backend/src/modules/](backend/src/modules/)) | Funzioni operative dedicate allo user: gestione task, upload documenti, funzioni AI, chatbot |

---

## 9. Sezione pubblica e sezione privata

| Sezione | Dove | Come |
|---|---|---|
| Pubblica | [frontend/src/pages/public/](frontend/src/pages/public/) | HomePage `/`, FeaturesPage `/features`, PricingPage `/pricing`, DemoRequestPage `/demo`, LoginPage `/login`, RegisterPage `/register` — nessuna autenticazione richiesta |
| Privata tenant | [frontend/src/pages/private/](frontend/src/pages/private/) | Route `/app/*` (Dashboard, Gare, Utenti, Audit, Bandi, Impostazioni) dentro `ProtectedRoute` in [frontend/src/App.jsx](frontend/src/App.jsx): senza sessione → redirect a `/login` |
| Privata admin | [frontend/src/pages/admin/](frontend/src/pages/admin/) | Route `/admin/*` con `requiredRole=SUPERADMIN` |
| Lato API | [backend/src/app.js](backend/src/app.js) | Pubbliche: `/api/auth/register`, `/api/auth/login`, `/api/health`, `/api/docs`; tutte le altre richiedono JWT (`verifyToken`) |

---

## 10. La webapp dev'essere responsive

| Dove | Come |
|---|---|
| [frontend/src/styles/globals.css](frontend/src/styles/globals.css) + [frontend/src/styles/variables.css](frontend/src/styles/variables.css) | Design system con variabili CSS, tema dark/light |
| `*.module.css` per ogni pagina/componente (es. [HomePage.module.css](frontend/src/pages/public/HomePage.module.css), [Sidebar.module.css](frontend/src/components/layout/Sidebar/Sidebar.module.css)) | CSS Modules con media query (`@media`) per breakpoint mobile/tablet: sidebar collassabile, griglie fluide, tabelle adattive |

---

## 11. Formalizzare i test di collaudo e rilascio

| Dove | Come |
|---|---|
| [backend/src/tests/](backend/src/tests/) | Test di collaudo con **Vitest + Supertest**: `auth.test.js` (registrazione, login, refresh), `tenders.test.js` (CRUD gare e blocco 403 per ruolo user), `admin.test.js`, `ai.test.js` — eseguibili con `npm test` dalla cartella backend |
| [backend/vitest.config.js](backend/vitest.config.js) + [backend/src/tests/setup.js](backend/src/tests/setup.js) | Configurazione test e setup ambiente |
| [docker-compose.yml](docker-compose.yml) | Rilascio: stack completo containerizzato (MySQL + backend + frontend + volume storage) |
| [backend/migrations/](backend/migrations/) + [backend/seeds/](backend/seeds/) | Migrazioni rieseguibili da zero e seed demo coerente: collaudo riproducibile su ambiente pulito |

---

## Avvio rapido in locale

```bash
# Backend (porta 3000) — il DB opterra è già creato e popolato
cd backend
npm install
npm start

# Frontend (porta 5173)
cd frontend
npm install
npm run dev
```

### Credenziali demo (seedate nel database `opterra`)

| Email | Password | Ruolo | Cosa può fare |
|---|---|---|---|
| `admin@tenderflow.app` | `password123` | superadmin | Tutto, incluso pannello `/admin/*` |
| `marco@demo.it` | `password123` | manager | Tutte le funzioni del tenant: crea/modifica gare, gestione utenti |
| `lisa@demo.it` | `password123` | user | Sola visualizzazione gare, task, documenti — non può creare/modificare gare |

Altri riferimenti: [Docs/accessi.md](Docs/accessi.md).
