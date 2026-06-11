# TenderFlow — Documento di Riferimento Generale

> Versione 1.0 — Giugno 2026  
> Audience: tutti gli sviluppatori del progetto

---

## 1. Visione del Prodotto

TenderFlow è un SaaS B2B multi-tenant per aziende che partecipano a bandi, gare, RFP e RFQ.  
Sostituisce email, cartelle sparse ed Excel con un workspace unico che unisce gestione documentale, task, scadenze e AI applicata al procurement.

---

## 2. Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| Back-end | Node.js 20 + Express.js |
| Autenticazione | JWT (access 15min + refresh 7d) |
| Database | MySQL 8 |
| Storage file | Docker volume locale (`/storage`) |
| Front-end | React 18 + CSS Modules |
| AI | OpenAI API (con Ollama come fallback locale) |
| Containerizzazione | Docker + Docker Compose |
| API Spec | OpenAPI 3.1 (Swagger UI a `/api/docs`) |

---

## 3. Architettura Multi-Tenant

- Database **shared** con isolamento via `tenant_id` su ogni tabella.
- Il middleware `resolveTenant` ricava il `tenant_id` dal JWT e lo inietta in ogni query.
- Nessun dato cross-tenant è mai esposto agli utenti finali.
- Il `superadmin` bypassa il filtro tenant solo su rotte `/admin/*` protette da ruolo.

### Ruoli RBAC

| Ruolo | Codice | Scope |
|---|---|---|
| Admin globale | `superadmin` | Tutti i tenant |
| Manager aziendale | `manager` | Proprio tenant |
| Utente operativo | `user` | Solo gare assegnate |

---

## 4. Struttura Repository

```
tenderflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── tenants/
│   │   │   ├── users/
│   │   │   ├── tenders/
│   │   │   ├── requirements/
│   │   │   ├── documents/
│   │   │   ├── tasks/
│   │   │   ├── ai/
│   │   │   ├── scraping/
│   │   │   ├── chatbot/
│   │   │   ├── audit/
│   │   │   └── admin/
│   │   ├── utils/
│   │   └── app.js
│   ├── migrations/
│   ├── seeds/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── storage/                  # Docker volume mount
├── docker-compose.yml
└── openapi.yaml
```

---

## 5. Roadmap e Piano di Sviluppo

### Milestone 1 — Foundation (Settimane 1–2)
| # | Task | Owner |
|---|---|---|
| 1.1 | Setup Docker Compose (MySQL + backend + frontend + storage volume) | Back |
| 1.2 | Schema DB: tabelle base (tenants, users, roles, subscriptions) | Back |
| 1.3 | Auth: register, login, refresh token, logout | Back |
| 1.4 | Middleware: JWT verify, resolveTenant, RBAC guard | Back |
| 1.5 | Setup React + React Router + CSS Modules + Axios client | Front |
| 1.6 | Layout shell: sidebar, header, breadcrumb (con mock data) | Front |
| 1.7 | LoginPage, RegisterPage, guard rotte private | Front |

### Milestone 2 — Core: Gare & Checklist (Settimane 3–4)
| # | Task | Owner |
|---|---|---|
| 2.1 | Schema DB: tenders, tender_assignments, requirements, requirement_items | Back |
| 2.2 | API CRUD `/tenders` e `/tenders/:id/requirements` | Back |
| 2.3 | Seed dati demo (1 tenant, 1 manager, 3 gare) | Back |
| 2.4 | TendersListPage con filtri e ricerca | Front |
| 2.5 | TenderDetailPage con tab (overview, checklist, documenti, task) | Front |
| 2.6 | ChecklistPage con progress bar e stati item | Front |

### Milestone 3 — Documenti & Task (Settimane 5–6)
| # | Task | Owner |
|---|---|---|
| 3.1 | Schema DB: documents, document_versions, tasks, approvals | Back |
| 3.2 | API upload/download `/documents`, versioning | Back |
| 3.3 | API CRUD `/tasks`, workflow approvazioni | Back |
| 3.4 | DocumentsPage: drag-and-drop upload, versioning, download | Front |
| 3.5 | TasksPage: board kanban con stati e assegnazione | Front |

### Milestone 4 — AI Engine (Settimane 7–8)
| # | Task | Owner |
|---|---|---|
| 4.1 | AI service layer con logging e rate limit per tenant | Back |
| 4.2 | Endpoint `/ai/extract-requirements`, `/ai/compliance-check` | Back |
| 4.3 | Endpoint `/ai/summary`, `/ai/go-nogo`, `/ai/qa`, `/ai/draft` | Back |
| 4.4 | Componenti AI card (summary, compliance badge, go-nogo panel) | Front |
| 4.5 | Integrazione AI Q&A nel TenderDetailPage | Front |

### Milestone 5 — Chatbot & Scraping (Settimane 9–10)
| # | Task | Owner |
|---|---|---|
| 5.1 | Schema DB: chat_sessions, chat_messages, scraped_tenders, scraping_sources | Back |
| 5.2 | Chatbot engine con function calling (azioni su gare, task, reminder) | Back |
| 5.3 | Cron job scraping bandi + classificazione AI | Back |
| 5.4 | ChatbotDrawer: pannello laterale persistente | Front |
| 5.5 | BandiBrowserPage: lista bandi scraper con filtri e "Salva come gara" | Front |

### Milestone 6 — Admin, Audit & Tenant Setup (Settimane 11–12)
| # | Task | Owner |
|---|---|---|
| 6.1 | Schema DB: audit_logs, invitations | Back |
| 6.2 | API `/admin/*`: gestione tenant, subscription, utenti globali | Back |
| 6.3 | Audit log automatico su ogni operazione critica | Back |
| 6.4 | AdminDashboard, TenantsPage, GlobalAuditPage | Front |
| 6.5 | AuditLogPage tenant-level | Front |

### Milestone 7 — Sezione Pubblica & Polish (Settimane 13–14)
| # | Task | Owner |
|---|---|---|
| 7.1 | HomePage, FeaturesPage, PricingPage, DemoRequestPage | Front |
| 7.2 | Notifiche interne (polling o WebSocket) | Back + Front |
| 7.3 | Test e2e principali flussi | Back + Front |
| 7.4 | Seed dati demo completo per portfolio | Back |

---

## 6. Naming Convention API

### Prefissi route

| Prefisso | Scope |
|---|---|
| `/api/auth` | Autenticazione pubblica |
| `/api/me` | Profilo utente corrente |
| `/api/tenders` | Gestione gare (tenant-scoped) |
| `/api/requirements` | Checklist requisiti (tenant-scoped) |
| `/api/documents` | Document management (tenant-scoped) |
| `/api/tasks` | Task e approvazioni (tenant-scoped) |
| `/api/ai` | Funzioni AI (tenant-scoped) |
| `/api/chat` | Chatbot (tenant-scoped) |
| `/api/scraping` | Bandi scraper (tenant-scoped) |
| `/api/audit` | Audit log (tenant-scoped) |
| `/api/users` | Gestione utenti tenant (manager+) |
| `/api/admin` | Pannello superadmin |

### Tabella completa endpoint

#### Auth
| Metodo | Path | Descrizione | Ruolo minimo |
|---|---|---|---|
| POST | `/api/auth/register` | Registra azienda + crea tenant + manager | Public |
| POST | `/api/auth/login` | Login → access + refresh token | Public |
| POST | `/api/auth/refresh` | Rinnova access token | Public |
| POST | `/api/auth/logout` | Revoca refresh token | Auth |
| POST | `/api/auth/forgot-password` | Invia email reset | Public |
| POST | `/api/auth/reset-password` | Imposta nuova password | Public |

#### Profilo
| Metodo | Path | Descrizione | Ruolo minimo |
|---|---|---|---|
| GET | `/api/me` | Profilo utente corrente | Auth |
| PATCH | `/api/me` | Aggiorna nome/avatar | Auth |
| PATCH | `/api/me/password` | Cambia password | Auth |

#### Utenti (tenant-scoped)
| Metodo | Path | Descrizione | Ruolo minimo |
|---|---|---|---|
| GET | `/api/users` | Lista utenti del tenant | manager |
| POST | `/api/users/invite` | Invita utente via email | manager |
| PATCH | `/api/users/:id/role` | Cambia ruolo utente | manager |
| DELETE | `/api/users/:id` | Rimuove utente dal tenant | manager |
| GET | `/api/users/groups` | Lista gruppi | manager |
| POST | `/api/users/groups` | Crea gruppo | manager |
| POST | `/api/users/groups/:id/members` | Aggiungi membro a gruppo | manager |

#### Gare
| Metodo | Path | Descrizione | Ruolo minimo |
|---|---|---|---|
| GET | `/api/tenders` | Lista gare (filtri: status, type, deadline) | user |
| POST | `/api/tenders` | Crea nuova gara | manager |
| GET | `/api/tenders/:id` | Dettaglio gara | user (assegnato) |
| PATCH | `/api/tenders/:id` | Aggiorna gara | manager |
| DELETE | `/api/tenders/:id` | Elimina gara (soft) | manager |
| PATCH | `/api/tenders/:id/status` | Cambia stato gara | manager |
| GET | `/api/tenders/dashboard` | KPI dashboard gare | user |
| POST | `/api/tenders/:id/assign` | Assegna utenti/gruppi | manager |

#### Requisiti / Checklist
| Metodo | Path | Descrizione | Ruolo minimo |
|---|---|---|---|
| GET | `/api/tenders/:id/requirements` | Lista requisiti gara | user |
| POST | `/api/tenders/:id/requirements` | Aggiungi requisito | manager |
| PATCH | `/api/requirements/:itemId` | Aggiorna stato/note item | user |
| DELETE | `/api/requirements/:itemId` | Elimina item | manager |

#### Documenti
| Metodo | Path | Descrizione | Ruolo minimo |
|---|---|---|---|
| GET | `/api/tenders/:id/documents` | Lista documenti gara | user |
| POST | `/api/tenders/:id/documents` | Upload file (multipart) | user |
| GET | `/api/documents/:docId/download` | Download file (stream) | user |
| GET | `/api/documents/:docId/versions` | Lista versioni | user |
| DELETE | `/api/documents/:docId` | Soft delete documento | manager |

#### Task
| Metodo | Path | Descrizione | Ruolo minimo |
|---|---|---|---|
| GET | `/api/tenders/:id/tasks` | Lista task gara | user |
| POST | `/api/tenders/:id/tasks` | Crea task | manager |
| PATCH | `/api/tasks/:taskId` | Aggiorna task (stato, assegnatario) | user |
| DELETE | `/api/tasks/:taskId` | Elimina task | manager |
| POST | `/api/tasks/:taskId/comments` | Aggiungi commento | user |
| GET | `/api/tasks/:taskId/approvals` | Stato workflow approvazione | user |
| POST | `/api/tasks/:taskId/approvals/:stepId/approve` | Approva step | user (step owner) |
| POST | `/api/tasks/:taskId/approvals/:stepId/reject` | Rifiuta step | user (step owner) |

#### AI
| Metodo | Path | Descrizione | Ruolo minimo |
|---|---|---|---|
| POST | `/api/ai/extract-requirements` | Estrae requisiti da file bando | user |
| POST | `/api/ai/compliance-check` | Gap analysis checklist vs documenti | user |
| POST | `/api/ai/summary` | Sintesi bando in markdown | user |
| POST | `/api/ai/go-nogo` | Score e raccomandazione partecipazione | manager |
| POST | `/api/ai/qa` | Q&A RAG sui documenti gara | user |
| POST | `/api/ai/draft` | Bozza sezione risposta | user |

#### Chatbot
| Metodo | Path | Descrizione | Ruolo minimo |
|---|---|---|---|
| GET | `/api/chat/sessions` | Lista sessioni chat | user |
| POST | `/api/chat/sessions` | Nuova sessione | user |
| GET | `/api/chat/sessions/:id/messages` | Messaggi sessione | user |
| POST | `/api/chat/sessions/:id/messages` | Invia messaggio (esegue azioni) | user |

#### Scraping Bandi
| Metodo | Path | Descrizione | Ruolo minimo |
|---|---|---|---|
| GET | `/api/scraping/tenders` | Lista bandi trovati | user |
| PATCH | `/api/scraping/tenders/:id/status` | Cambia stato (new/saved/dismissed) | user |
| POST | `/api/scraping/tenders/:id/convert` | Converti in gara reale | manager |
| GET | `/api/scraping/sources` | Lista sorgenti configurate | manager |
| POST | `/api/scraping/sources` | Aggiungi sorgente | manager |
| DELETE | `/api/scraping/sources/:id` | Rimuovi sorgente | manager |

#### Audit Log
| Metodo | Path | Descrizione | Ruolo minimo |
|---|---|---|---|
| GET | `/api/audit` | Log attività tenant | manager |
| GET | `/api/audit/export` | Export CSV log tenant | manager |

#### Admin (superadmin only)
| Metodo | Path | Descrizione | Ruolo minimo |
|---|---|---|---|
| GET | `/api/admin/tenants` | Lista tutti i tenant | superadmin |
| GET | `/api/admin/tenants/:id` | Dettaglio tenant | superadmin |
| PATCH | `/api/admin/tenants/:id/status` | Abilita/disabilita tenant | superadmin |
| GET | `/api/admin/subscriptions` | Lista sottoscrizioni | superadmin |
| PATCH | `/api/admin/subscriptions/:id` | Modifica piano | superadmin |
| GET | `/api/admin/audit` | Log globali tutti i tenant | superadmin |
| GET | `/api/admin/users` | Lista globale utenti | superadmin |

---

## 7. Formato Risposte API

Tutte le risposte seguono questo schema JSON:

```json
// Successo
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 42 }   // solo per liste paginate
}

// Errore
{
  "success": false,
  "error": {
    "code": "TENDER_NOT_FOUND",
    "message": "La gara richiesta non esiste o non è accessibile."
  }
}
```

### Codici errore standard

| Codice | HTTP | Descrizione |
|---|---|---|
| `UNAUTHORIZED` | 401 | Token mancante o scaduto |
| `FORBIDDEN` | 403 | Ruolo insufficiente |
| `NOT_FOUND` | 404 | Risorsa non trovata |
| `VALIDATION_ERROR` | 422 | Dati input non validi |
| `TENANT_DISABLED` | 403 | Tenant disabilitato |
| `STORAGE_QUOTA_EXCEEDED` | 429 | Quota storage superata |
| `AI_RATE_LIMIT` | 429 | Limite AI per tenant superato |

---

## 8. Query DB — Naming Convention

Tutti i moduli del back-end usano una classe/oggetto `*Queries` per isolare le query SQL raw.

| Modulo | File query | Esempio funzione |
|---|---|---|
| Auth | `auth.queries.js` | `findUserByEmail(email)` |
| Tenants | `tenants.queries.js` | `getTenantById(id)` |
| Users | `users.queries.js` | `getUsersByTenant(tenantId)` |
| Tenders | `tenders.queries.js` | `getTendersByTenant(tenantId, filters)` |
| Requirements | `requirements.queries.js` | `getRequirementsByTender(tenderId)` |
| Documents | `documents.queries.js` | `getDocumentVersions(docId)` |
| Tasks | `tasks.queries.js` | `getTasksByTender(tenderId)` |
| AI | `ai.queries.js` | `logAiRequest(tenantId, type, tokens)` |
| Chat | `chat.queries.js` | `getMessagesBySession(sessionId)` |
| Scraping | `scraping.queries.js` | `getScrapedTendersByTenant(tenantId)` |
| Audit | `audit.queries.js` | `insertAuditLog(entry)` |
| Admin | `admin.queries.js` | `getAllTenants(filters)` |

---

## 9. Variabili d'Ambiente

```env
# Backend
PORT=3000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=tenderflow
DB_USER=tenderflow_user
DB_PASSWORD=secret
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
STORAGE_PATH=/storage
OPENAI_API_KEY=sk-...
SCRAPING_CRON=0 6 * * *

# Frontend
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 10. Docker Compose Overview

```yaml
services:
  mysql:
    image: mysql:8
    volumes: [mysql_data:/var/lib/mysql]

  backend:
    build: ./backend
    depends_on: [mysql]
    volumes: [./storage:/storage]
    env_file: .env

  frontend:
    build: ./frontend
    depends_on: [backend]

volumes:
  mysql_data:
```

---

## 11. Regole di Collaborazione

- **Prima di iniziare ogni milestone**, back e front concordano il contratto dell'endpoint (path, body, risposta) sul file `openapi.yaml`.
- Il front usa **mock handler** (es. MSW) per sviluppare in parallelo prima che il back sia pronto.
- Nessun `console.log` in produzione; usare il logger centralizzato (`winston` lato back).
- Ogni PR richiede almeno una review incrociata.
- I nomi delle rotte, dei campi JSON e delle colonne DB devono rispettare questa specifica senza deviazioni per garantire compatibilità immediata.
