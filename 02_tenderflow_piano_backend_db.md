# TenderFlow — Piano di Sviluppo Back-End e Database

> Versione 1.0 — Giugno 2026  
> Audience: sviluppatore back-end / database

---

## 1. Obiettivi del documento

Questo documento definisce in modo operativo tutto ciò che serve per sviluppare back-end e database di TenderFlow.  
Lo scopo è costruire una base stabile, multi-tenant, estendibile e coerente con il contratto API condiviso con il front-end.

---

## 2. Responsabilità Back-End / DB

Lo sviluppatore back-end / DB è responsabile di:

- progettazione schema MySQL;
- migrazioni e seed iniziali;
- implementazione API Express;
- autenticazione JWT e autorizzazione RBAC;
- isolamento multi-tenant via `tenant_id`;
- upload file e gestione versioni su storage Docker locale;
- business logic di gare, checklist, task, approvazioni e audit;
- integrazione AI;
- scraping bandi e classificazione AI;
- chatbot con function calling verso API interne;
- documentazione OpenAPI aggiornata.

---

## 3. Standard Architetturali

### Pattern modulo

Ogni modulo back-end deve seguire questa struttura:

```
src/modules/{module}/
├── {module}.controller.js
├── {module}.service.js
├── {module}.queries.js
├── {module}.routes.js
├── {module}.validator.js
└── {module}.schema.js   # opzionale per DTO / swagger schema helpers
```

### Regole obbligatorie

- Il controller gestisce `req/res` e delega al service.
- Il service contiene la business logic.
- Il file `*.queries.js` contiene solo query SQL o query builder.
- Il middleware tenant deve essere applicato a tutte le route private.
- Tutte le delete sono **soft delete** salvo tabelle tecniche.
- Ogni update critico scrive in `audit_logs`.

---

## 4. Priorità di sviluppo

### Fase 1 — Foundation

#### Obiettivi
- Avviare progetto Express con struttura moduli.
- Configurare connessione MySQL pooled.
- Preparare Docker Compose.
- Implementare auth base e registrazione tenant.

#### Deliverable
- `backend/src/app.js`
- `backend/src/config/db.js`
- `backend/src/config/env.js`
- `backend/src/middleware/auth.middleware.js`
- `backend/src/middleware/tenant.middleware.js`
- `backend/src/middleware/rbac.middleware.js`
- `backend/src/modules/auth/*`
- `backend/src/modules/tenants/*`
- migrazioni iniziali DB

### Fase 2 — Core business

#### Obiettivi
- Gestione utenti tenant.
- CRUD gare.
- Checklist requisiti.
- Dashboard base.

#### Deliverable
- moduli `users`, `tenders`, `requirements`
- query dashboard KPI
- seed dati demo

### Fase 3 — Collaboration layer

#### Obiettivi
- Upload documenti e versioning.
- Task e approvazioni.
- Audit log automatico.

#### Deliverable
- moduli `documents`, `tasks`, `audit`
- stream download file
- trigger applicativi audit

### Fase 4 — AI & automation

#### Obiettivi
- AI service centralizzato.
- Requirement extraction e summary.
- Compliance check.
- Chatbot action-based.
- Scraping bandi.

#### Deliverable
- moduli `ai`, `chatbot`, `scraping`
- cron job scraping
- log utilizzo AI per tenant

### Fase 5 — Admin & hardening

#### Obiettivi
- Pannello superadmin.
- Subscription management.
- Rate limit, validazioni, test.

#### Deliverable
- modulo `admin`
- modulo `subscriptions`
- test integration principali

---

## 5. Schema Database Completo

### Convenzioni tabelle

- PK sempre `id BIGINT UNSIGNED AUTO_INCREMENT`
- FK in snake_case
- timestamp standard: `created_at`, `updated_at`
- soft delete: `deleted_at NULL`
- multi-tenant: `tenant_id` obbligatorio su quasi tutte le tabelle applicative
- campi enum preferibilmente `VARCHAR` con validazione applicativa, per maggiore flessibilità

### Tabelle core

#### `tenants`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| name | varchar(150) | nome azienda |
| slug | varchar(150) | univoco |
| vat_number | varchar(50) | opzionale |
| industry | varchar(100) | settore |
| country | varchar(80) | default IT |
| status | varchar(30) | active, suspended, disabled |
| ai_profile_json | json | criteri AI per matching bandi |
| created_at | datetime | |
| updated_at | datetime | |
| deleted_at | datetime null | |

#### `plans`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| code | varchar(50) | free, pro, enterprise |
| name | varchar(100) | |
| max_users | int | |
| max_tenders | int | |
| max_storage_mb | int | |
| max_ai_requests_month | int | |
| created_at | datetime | |
| updated_at | datetime | |

#### `subscriptions`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| plan_id | bigint | FK plans |
| status | varchar(30) | active, trial, expired, cancelled |
| starts_at | datetime | |
| ends_at | datetime | |
| auto_renew | tinyint(1) | |
| created_at | datetime | |
| updated_at | datetime | |

#### `users`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| email | varchar(190) | indice composto tenant+email |
| password_hash | varchar(255) | |
| first_name | varchar(100) | |
| last_name | varchar(100) | |
| avatar_url | varchar(255) | opzionale |
| status | varchar(30) | active, invited, disabled |
| last_login_at | datetime null | |
| created_at | datetime | |
| updated_at | datetime | |
| deleted_at | datetime null | |

#### `roles`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| code | varchar(50) | superadmin, manager, user |
| name | varchar(100) | |
| scope | varchar(30) | global, tenant |

#### `user_roles`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| user_id | bigint | FK users |
| role_id | bigint | FK roles |
| tenant_id | bigint null | null per superadmin globale |
| created_at | datetime | |

#### `groups`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| name | varchar(100) | |
| description | varchar(255) | |
| created_at | datetime | |
| updated_at | datetime | |
| deleted_at | datetime null | |

#### `group_members`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| group_id | bigint | FK groups |
| user_id | bigint | FK users |
| created_at | datetime | |

#### `invitations`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| email | varchar(190) | |
| role_code | varchar(50) | |
| token | varchar(255) | univoco |
| expires_at | datetime | |
| accepted_at | datetime null | |
| created_by | bigint | FK users |
| created_at | datetime | |

### Gare e checklist

#### `tenders`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| title | varchar(255) | |
| issuer | varchar(255) | ente |
| type | varchar(50) | tender, rfp, rfq |
| reference_code | varchar(100) | CIG/CUP o codice interno |
| description | text | |
| value_amount | decimal(15,2) | |
| currency | varchar(10) | EUR |
| publication_date | date null | |
| deadline_at | datetime | |
| status | varchar(30) | draft, active, submitted, won, lost, cancelled |
| source_type | varchar(30) | manual, scraped, imported |
| source_url | varchar(500) | opzionale |
| go_nogo_decision | varchar(20) | go, no_go, pending |
| go_nogo_score | decimal(5,2) | |
| created_by | bigint | FK users |
| created_at | datetime | |
| updated_at | datetime | |
| deleted_at | datetime null | |

#### `tender_assignments`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tender_id | bigint | FK tenders |
| user_id | bigint null | FK users |
| group_id | bigint null | FK groups |
| assignment_type | varchar(30) | owner, contributor, reviewer |
| created_at | datetime | |

#### `requirements`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| tender_id | bigint | FK tenders |
| title | varchar(255) | categoria/checklist name |
| source | varchar(30) | manual, ai |
| created_by | bigint | FK users |
| created_at | datetime | |
| updated_at | datetime | |

#### `requirement_items`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| requirement_id | bigint | FK requirements |
| tender_id | bigint | denormalizzato per query rapide |
| label | varchar(255) | |
| description | text | |
| item_type | varchar(50) | document, declaration, certification, answer |
| priority | varchar(30) | mandatory, optional |
| status | varchar(30) | pending, in_progress, completed, waived |
| due_at | datetime null | |
| assigned_user_id | bigint null | FK users |
| notes | text null | |
| ai_extracted | tinyint(1) | default 0 |
| created_at | datetime | |
| updated_at | datetime | |
| deleted_at | datetime null | |

### Documenti

#### `documents`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| tender_id | bigint | FK tenders |
| document_type | varchar(50) | capitolato, modulo, certificazione, bozza_risposta, generic |
| title | varchar(255) | |
| current_version_id | bigint null | FK document_versions |
| uploaded_by | bigint | FK users |
| created_at | datetime | |
| updated_at | datetime | |
| deleted_at | datetime null | |

#### `document_versions`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| document_id | bigint | FK documents |
| version_number | int | |
| original_filename | varchar(255) | |
| storage_path | varchar(500) | path nel volume Docker |
| mime_type | varchar(120) | |
| size_bytes | bigint | |
| checksum_sha256 | varchar(64) | |
| uploaded_by | bigint | FK users |
| created_at | datetime | |

### Task e approvazioni

#### `tasks`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| tender_id | bigint | FK tenders |
| title | varchar(255) | |
| description | text | |
| status | varchar(30) | todo, in_progress, review, done, blocked |
| priority | varchar(30) | low, medium, high, urgent |
| due_at | datetime null | |
| assigned_user_id | bigint null | FK users |
| assigned_group_id | bigint null | FK groups |
| created_by | bigint | FK users |
| created_at | datetime | |
| updated_at | datetime | |
| deleted_at | datetime null | |

#### `task_comments`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| task_id | bigint | FK tasks |
| user_id | bigint | FK users |
| body | text | |
| created_at | datetime | |

#### `approvals`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| task_id | bigint | FK tasks |
| status | varchar(30) | pending, approved, rejected |
| created_at | datetime | |
| updated_at | datetime | |

#### `approval_steps`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| approval_id | bigint | FK approvals |
| step_order | int | |
| approver_user_id | bigint | FK users |
| status | varchar(30) | pending, approved, rejected |
| decided_at | datetime null | |
| note | text null | |

### AI, scraping e chat

#### `ai_requests`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| user_id | bigint | FK users |
| tender_id | bigint null | FK tenders |
| request_type | varchar(50) | extraction, summary, qa, draft, compliance, go_nogo |
| model_name | varchar(100) | |
| prompt_tokens | int | |
| completion_tokens | int | |
| status | varchar(30) | success, failed |
| error_message | text null | |
| created_at | datetime | |

#### `scraping_sources`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| name | varchar(100) | |
| source_type | varchar(30) | rss, api, html |
| base_url | varchar(500) | |
| config_json | json | selettori, headers, filtri |
| is_active | tinyint(1) | |
| created_at | datetime | |
| updated_at | datetime | |

#### `scraping_jobs`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| source_id | bigint | FK scraping_sources |
| status | varchar(30) | queued, running, completed, failed |
| started_at | datetime null | |
| finished_at | datetime null | |
| items_found | int | |
| error_message | text null | |
| created_at | datetime | |

#### `scraped_tenders`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| source_id | bigint | FK scraping_sources |
| external_id | varchar(150) | univoco per source |
| title | varchar(255) | |
| issuer | varchar(255) | |
| summary | text | |
| source_url | varchar(500) | |
| publication_date | date null | |
| deadline_at | datetime null | |
| estimated_value | decimal(15,2) null | |
| raw_payload_json | json | dati grezzi scraper |
| ai_relevance_score | decimal(5,2) | |
| ai_tags_json | json | parole chiave / classificazione |
| status | varchar(30) | new, saved, dismissed |
| converted_tender_id | bigint null | FK tenders |
| created_at | datetime | |
| updated_at | datetime | |

#### `chat_sessions`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| user_id | bigint | FK users |
| title | varchar(255) | |
| context_type | varchar(50) | general, tender |
| context_id | bigint null | tender id opzionale |
| created_at | datetime | |
| updated_at | datetime | |

#### `chat_messages`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| session_id | bigint | FK chat_sessions |
| sender_type | varchar(20) | user, assistant, system |
| message_text | longtext | |
| tool_call_json | json null | azioni eseguite |
| created_at | datetime | |

### Audit e notifiche

#### `audit_logs`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint null | null per eventi globali |
| user_id | bigint null | FK users |
| action | varchar(100) | tender.created, task.updated, auth.login |
| entity_type | varchar(50) | |
| entity_id | bigint null | |
| diff_json | json null | before/after sintetico |
| ip_address | varchar(64) | |
| user_agent | varchar(255) | |
| created_at | datetime | |

#### `notifications`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| tenant_id | bigint | FK tenants |
| user_id | bigint | FK users |
| type | varchar(50) | reminder, assignment, approval, scraping |
| title | varchar(255) | |
| body | text | |
| read_at | datetime null | |
| created_at | datetime | |

#### `refresh_tokens`
| Campo | Tipo | Note |
|---|---|---|
| id | bigint | PK |
| user_id | bigint | FK users |
| token_hash | varchar(255) | |
| expires_at | datetime | |
| revoked_at | datetime null | |
| created_at | datetime | |

---

## 6. Indici DB consigliati

Creare almeno questi indici:

- `users (tenant_id, email)` unique
- `tenders (tenant_id, status, deadline_at)`
- `requirement_items (tenant_id, tender_id, status)`
- `documents (tenant_id, tender_id)`
- `tasks (tenant_id, tender_id, status, due_at)`
- `scraped_tenders (tenant_id, status, ai_relevance_score)`
- `chat_messages (session_id, created_at)`
- `audit_logs (tenant_id, created_at)`
- `notifications (user_id, read_at, created_at)`

---

## 7. Query Layer — Funzioni attese

### `auth.queries.js`
- `createTenantWithManager(payload, trx)`
- `findUserByEmail(email, tenantId)`
- `insertRefreshToken(userId, tokenHash, expiresAt)`
- `revokeRefreshToken(tokenHash)`

### `users.queries.js`
- `getUsersByTenant(tenantId, filters)`
- `getUserById(userId, tenantId)`
- `updateUserRole(userId, roleCode, tenantId)`
- `createInvitation(payload)`
- `getGroupsByTenant(tenantId)`

### `tenders.queries.js`
- `getTendersByTenant(tenantId, filters, pagination)`
- `getTenderById(tenderId, tenantId)`
- `insertTender(payload)`
- `updateTender(tenderId, tenantId, payload)`
- `softDeleteTender(tenderId, tenantId)`
- `assignUsersToTender(tenderId, assignments)`
- `getTenderDashboardStats(tenantId)`

### `requirements.queries.js`
- `getRequirementsByTender(tenderId, tenantId)`
- `insertRequirement(payload)`
- `insertRequirementItems(items)`
- `updateRequirementItem(itemId, tenantId, payload)`

### `documents.queries.js`
- `getDocumentsByTender(tenderId, tenantId)`
- `createDocument(payload, trx)`
- `createDocumentVersion(payload, trx)`
- `setCurrentDocumentVersion(documentId, versionId, trx)`
- `getDocumentVersionById(docId, tenantId)`
- `softDeleteDocument(docId, tenantId)`
- `getTenantStorageUsageMb(tenantId)`

### `tasks.queries.js`
- `getTasksByTender(tenderId, tenantId)`
- `createTask(payload)`
- `updateTask(taskId, tenantId, payload)`
- `createTaskComment(payload)`
- `createApprovalFlow(payload, trx)`
- `approveStep(stepId, userId, tenantId)`
- `rejectStep(stepId, userId, tenantId, note)`

### `ai.queries.js`
- `logAiRequest(payload)`
- `getMonthlyAiUsage(tenantId, yearMonth)`

### `scraping.queries.js`
- `getSourcesByTenant(tenantId)`
- `createScrapingJob(payload)`
- `insertScrapedTenders(items)`
- `getScrapedTendersByTenant(tenantId, filters)`
- `convertScrapedTenderToTender(scrapedId, tenantId, trx)`

### `chat.queries.js`
- `getChatSessions(userId, tenantId)`
- `createChatSession(payload)`
- `getMessagesBySession(sessionId, tenantId)`
- `insertChatMessage(payload)`

### `audit.queries.js`
- `insertAuditLog(payload)`
- `getAuditLogsByTenant(tenantId, filters)`
- `getGlobalAuditLogs(filters)`

---

## 8. API Contract — Requisiti implementativi

### Header obbligatori
- `Authorization: Bearer <token>` per tutte le route private
- `Content-Type: application/json` salvo upload multipart
- `X-Tenant-Id` **non** ammesso da client; il tenant deriva dal token, non dal front-end

### Validazione
Usare validatori dedicati per body, params e query.  
Le route non devono mai accettare campi extra silenziosamente se il payload è critico.

### Pagination standard
Per le liste usare:
- `page`
- `pageSize`
- `sortBy`
- `sortOrder`

### Filtri standard
Per le liste principali usare sempre query param coerenti:
- `status`
- `search`
- `from`
- `to`
- `type`
- `assignedTo`

---

## 9. Storage locale Docker

### Regole storage
- Root storage: `/storage`
- Pattern path file: `/storage/{tenant_id}/{tender_id}/{document_id}/v{n}_{safe_filename}`
- Mai esporre il path reale al front-end
- Download solo via controller autenticato
- Calcolare `checksum_sha256` su ogni upload
- Verificare quota storage tenant prima di salvare il file

### Endpoint upload
- `POST /api/tenders/:id/documents`
- multipart field: `file`
- body aggiuntivo: `title`, `documentType`

---

## 10. Chatbot Action Layer

Il chatbot non chiama direttamente il database.  
Deve invocare solo service interni controllati, ognuno con validazione RBAC.

### Azioni minime supportate
- `create_tender`
- `update_tender_status`
- `list_deadlines`
- `create_task`
- `assign_task`
- `add_requirement`
- `run_requirement_extraction`
- `run_compliance_check`
- `list_scraped_tenders`
- `save_scraped_tender`
- `create_reminder`

### Regole chatbot
- Ogni tool action deve produrre audit log.
- Ogni action deve essere tenant-scoped.
- Se l'utente non ha ruolo sufficiente, il chatbot risponde con rifiuto esplicito.
- Le azioni distruttive richiedono conferma applicativa o esplicita nel messaggio.

---

## 11. Scraping bandi

### Pipeline
1. Scheduler legge `scraping_sources` attive.
2. Viene creato un record in `scraping_jobs`.
3. Il parser estrae i risultati grezzi.
4. I risultati vengono deduplicati per `source_id + external_id`.
5. L'AI assegna score di rilevanza e tag.
6. I bandi entrano in `scraped_tenders` con stato `new`.
7. Si genera una notifica agli utenti manager del tenant.

### Requisiti tecnici
- timeout per sorgente
- retry controllato
- log errori per job
- parser separati per `rss`, `api`, `html`

---

## 12. Sicurezza

- Password con bcrypt o argon2.
- Refresh token salvati solo hashati.
- Rate limit su login e su endpoint AI.
- Sanitizzazione file upload e whitelist MIME.
- Nessuna query SQL costruita via string interpolation diretta.
- Tutti i record tenant-scoped devono essere filtrati da `tenant_id` nel query layer.
- Il `superadmin` opera su route dedicate, mai tramite bypass implicito nelle route tenant.

---

## 13. Test minimi richiesti

### Integration test
- register tenant + manager
- login + refresh
- accesso negato cross-tenant
- CRUD gara
- upload documento + nuova versione
- compliance check AI mockato
- scraping convert to tender
- chatbot create task

### DB test / migration test
- migrazioni eseguibili da zero
- seed demo coerente
- rollback almeno per ambiente dev

---

## 14. Deliverable finali back-end

Al completamento, il back-end deve consegnare:

- API Express complete e allineate a `openapi.yaml`
- migrazioni MySQL versionate
- seed demo
- storage locale Docker funzionante
- documentazione env e avvio locale
- suite test minima
- audit log attivo
- AI layer e scraping integrati
- chatbot action-based funzionante

---

## 15. Definition of Done back-end

Una feature back-end è completata solo se:

- ha schema DB o usa tabelle già approvate;
- espone endpoint documentato in OpenAPI;
- valida input e ruoli;
- rispetta `tenant_id`;
- scrive audit log se necessario;
- restituisce response standard;
- è testata almeno sul caso felice e sul caso forbidden/not found.
