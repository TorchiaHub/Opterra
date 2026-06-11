# TenderFlow — Connessioni DB e API

> File generato automaticamente a supporto dello sviluppo back-end.  
> Contiene schema DB, tutte le query functions e tutte le API route con metodo, path, descrizione e vincoli.

---

## 1. Database — Schema Completo

### 1.1 Tabelle Core

#### `tenants`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| name | VARCHAR(150) | NOT NULL |
| slug | VARCHAR(150) | NOT NULL, UNIQUE |
| vat_number | VARCHAR(50) | NULL |
| industry | VARCHAR(100) | NULL |
| country | VARCHAR(80) | NOT NULL, DEFAULT 'IT' |
| status | VARCHAR(30) | NOT NULL, DEFAULT 'active' |
| ai_profile_json | JSON | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |
| deleted_at | DATETIME | NULL |

#### `plans`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| code | VARCHAR(50) | NOT NULL, UNIQUE |
| name | VARCHAR(100) | NOT NULL |
| max_users | INT | NOT NULL |
| max_tenders | INT | NOT NULL |
| max_storage_mb | INT | NOT NULL |
| max_ai_requests_month | INT | NOT NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |

#### `subscriptions`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| plan_id | BIGINT UNSIGNED | FK → plans.id |
| status | VARCHAR(30) | NOT NULL, DEFAULT 'active' |
| starts_at | DATETIME | NOT NULL |
| ends_at | DATETIME | NULL |
| auto_renew | TINYINT(1) | NOT NULL, DEFAULT 1 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |

#### `users`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| email | VARCHAR(190) | NOT NULL, UNIQUE (tenant_id, email) |
| password_hash | VARCHAR(255) | NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| avatar_url | VARCHAR(255) | NULL |
| status | VARCHAR(30) | NOT NULL, DEFAULT 'active' |
| last_login_at | DATETIME | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |
| deleted_at | DATETIME | NULL |

#### `roles`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| code | VARCHAR(50) | NOT NULL, UNIQUE |
| name | VARCHAR(100) | NOT NULL |
| scope | VARCHAR(30) | NOT NULL, DEFAULT 'tenant' |
| *Data seed* | | superadmin (global), manager (tenant), user (tenant) |

#### `user_roles`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| user_id | BIGINT UNSIGNED | FK → users.id |
| role_id | BIGINT UNSIGNED | FK → roles.id |
| tenant_id | BIGINT UNSIGNED | NULL (null per superadmin globale) |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

#### `groups`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| name | VARCHAR(100) | NOT NULL |
| description | VARCHAR(255) | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |
| deleted_at | DATETIME | NULL |

#### `group_members`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| group_id | BIGINT UNSIGNED | FK → groups.id |
| user_id | BIGINT UNSIGNED | FK → users.id |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

#### `invitations`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| email | VARCHAR(190) | NOT NULL |
| role_code | VARCHAR(50) | NOT NULL |
| token | VARCHAR(255) | NOT NULL, UNIQUE |
| expires_at | DATETIME | NOT NULL |
| accepted_at | DATETIME | NULL |
| created_by | BIGINT UNSIGNED | FK → users.id |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

#### `refresh_tokens`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| user_id | BIGINT UNSIGNED | FK → users.id |
| token_hash | VARCHAR(255) | NOT NULL, INDEX |
| expires_at | DATETIME | NOT NULL |
| revoked_at | DATETIME | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### 1.2 Tabelle Gare e Checklist

#### `tenders`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| title | VARCHAR(255) | NOT NULL |
| issuer | VARCHAR(255) | NOT NULL |
| type | VARCHAR(50) | NOT NULL (tender, rfp, rfq) |
| reference_code | VARCHAR(100) | NULL |
| description | TEXT | NULL |
| value_amount | DECIMAL(15,2) | NULL |
| currency | VARCHAR(10) | DEFAULT 'EUR' |
| publication_date | DATE | NULL |
| deadline_at | DATETIME | NOT NULL |
| status | VARCHAR(30) | NOT NULL (draft, active, submitted, won, lost, cancelled) |
| source_type | VARCHAR(30) | DEFAULT 'manual' |
| source_url | VARCHAR(500) | NULL |
| go_nogo_decision | VARCHAR(20) | DEFAULT 'pending' |
| go_nogo_score | DECIMAL(5,2) | NULL |
| created_by | BIGINT UNSIGNED | FK → users.id |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |
| deleted_at | DATETIME | NULL |
| INDEX | (tenant_id, status, deadline_at) |

#### `tender_assignments`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tender_id | BIGINT UNSIGNED | FK → tenders.id |
| user_id | BIGINT UNSIGNED | NULL, FK → users.id |
| group_id | BIGINT UNSIGNED | NULL, FK → groups.id |
| assignment_type | VARCHAR(30) | NOT NULL (owner, contributor, reviewer) |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

#### `requirements`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| tender_id | BIGINT UNSIGNED | FK → tenders.id |
| title | VARCHAR(255) | NOT NULL |
| source | VARCHAR(30) | NOT NULL (manual, ai) |
| created_by | BIGINT UNSIGNED | FK → users.id |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |

#### `requirement_items`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| requirement_id | BIGINT UNSIGNED | FK → requirements.id |
| tender_id | BIGINT UNSIGNED | FK → tenders.id (denormalizzato) |
| label | VARCHAR(255) | NOT NULL |
| description | TEXT | NULL |
| item_type | VARCHAR(50) | NOT NULL (document, declaration, certification, answer) |
| priority | VARCHAR(30) | NOT NULL (mandatory, optional) |
| status | VARCHAR(30) | NOT NULL DEFAULT 'pending' (pending, in_progress, completed, waived) |
| due_at | DATETIME | NULL |
| assigned_user_id | BIGINT UNSIGNED | NULL, FK → users.id |
| notes | TEXT | NULL |
| ai_extracted | TINYINT(1) | DEFAULT 0 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |
| deleted_at | DATETIME | NULL |
| INDEX | (tenant_id, tender_id, status) |

### 1.3 Tabelle Documenti

#### `documents`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| tender_id | BIGINT UNSIGNED | FK → tenders.id |
| document_type | VARCHAR(50) | NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| current_version_id | BIGINT UNSIGNED | NULL, FK → document_versions.id |
| uploaded_by | BIGINT UNSIGNED | FK → users.id |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |
| deleted_at | DATETIME | NULL |
| INDEX | (tenant_id, tender_id) |

#### `document_versions`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| document_id | BIGINT UNSIGNED | FK → documents.id |
| version_number | INT | NOT NULL |
| original_filename | VARCHAR(255) | NOT NULL |
| storage_path | VARCHAR(500) | NOT NULL |
| mime_type | VARCHAR(120) | NOT NULL |
| size_bytes | BIGINT | NOT NULL |
| checksum_sha256 | VARCHAR(64) | NOT NULL |
| uploaded_by | BIGINT UNSIGNED | FK → users.id |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### 1.4 Tabelle Task e Approvazioni

#### `tasks`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| tender_id | BIGINT UNSIGNED | FK → tenders.id |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULL |
| status | VARCHAR(30) | NOT NULL (todo, in_progress, review, done, blocked) |
| priority | VARCHAR(30) | NOT NULL (low, medium, high, urgent) |
| due_at | DATETIME | NULL |
| assigned_user_id | BIGINT UNSIGNED | NULL, FK → users.id |
| assigned_group_id | BIGINT UNSIGNED | NULL, FK → groups.id |
| created_by | BIGINT UNSIGNED | FK → users.id |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |
| deleted_at | DATETIME | NULL |
| INDEX | (tenant_id, tender_id, status, due_at) |

#### `task_comments`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| task_id | BIGINT UNSIGNED | FK → tasks.id |
| user_id | BIGINT UNSIGNED | FK → users.id |
| body | TEXT | NOT NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

#### `approvals`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| task_id | BIGINT UNSIGNED | FK → tasks.id |
| status | VARCHAR(30) | NOT NULL (pending, approved, rejected) |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |

#### `approval_steps`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| approval_id | BIGINT UNSIGNED | FK → approvals.id |
| step_order | INT | NOT NULL |
| approver_user_id | BIGINT UNSIGNED | FK → users.id |
| status | VARCHAR(30) | NOT NULL (pending, approved, rejected) |
| decided_at | DATETIME | NULL |
| note | TEXT | NULL |

### 1.5 Tabelle AI, Scraping e Chat

#### `ai_requests`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| user_id | BIGINT UNSIGNED | FK → users.id |
| tender_id | BIGINT UNSIGNED | NULL, FK → tenders.id |
| request_type | VARCHAR(50) | NOT NULL |
| model_name | VARCHAR(100) | NOT NULL |
| prompt_tokens | INT | NOT NULL |
| completion_tokens | INT | NOT NULL |
| status | VARCHAR(30) | NOT NULL |
| error_message | TEXT | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

#### `scraping_sources`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| name | VARCHAR(100) | NOT NULL |
| source_type | VARCHAR(30) | NOT NULL |
| base_url | VARCHAR(500) | NOT NULL |
| config_json | JSON | NULL |
| is_active | TINYINT(1) | DEFAULT 1 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |

#### `scraping_jobs`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| source_id | BIGINT UNSIGNED | FK → scraping_sources.id |
| status | VARCHAR(30) | NOT NULL |
| started_at | DATETIME | NULL |
| finished_at | DATETIME | NULL |
| items_found | INT | DEFAULT 0 |
| error_message | TEXT | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

#### `scraped_tenders`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| source_id | BIGINT UNSIGNED | FK → scraping_sources.id |
| external_id | VARCHAR(150) | NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| issuer | VARCHAR(255) | NULL |
| summary | TEXT | NULL |
| source_url | VARCHAR(500) | NULL |
| publication_date | DATE | NULL |
| deadline_at | DATETIME | NULL |
| estimated_value | DECIMAL(15,2) | NULL |
| raw_payload_json | JSON | NULL |
| ai_relevance_score | DECIMAL(5,2) | NULL |
| ai_tags_json | JSON | NULL |
| status | VARCHAR(30) | NOT NULL (new, saved, dismissed) |
| converted_tender_id | BIGINT UNSIGNED | NULL, FK → tenders.id |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |
| INDEX | (tenant_id, status, ai_relevance_score) |

#### `chat_sessions`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| user_id | BIGINT UNSIGNED | FK → users.id |
| title | VARCHAR(255) | NULL |
| context_type | VARCHAR(50) | NOT NULL |
| context_id | BIGINT UNSIGNED | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |

#### `chat_messages`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| session_id | BIGINT UNSIGNED | FK → chat_sessions.id |
| sender_type | VARCHAR(20) | NOT NULL |
| message_text | LONGTEXT | NOT NULL |
| tool_call_json | JSON | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| INDEX | (session_id, created_at) |

### 1.6 Tabelle Audit e Notifiche

#### `audit_logs`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | NULL |
| user_id | BIGINT UNSIGNED | NULL, FK → users.id |
| action | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(50) | NOT NULL |
| entity_id | BIGINT UNSIGNED | NULL |
| diff_json | JSON | NULL |
| ip_address | VARCHAR(64) | NULL |
| user_agent | VARCHAR(255) | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| INDEX | (tenant_id, created_at) |

#### `notifications`
| Colonna | Tipo | Vincoli |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| tenant_id | BIGINT UNSIGNED | FK → tenants.id |
| user_id | BIGINT UNSIGNED | FK → users.id |
| type | VARCHAR(50) | NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| body | TEXT | NULL |
| read_at | DATETIME | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| INDEX | (user_id, read_at, created_at) |

---

## 2. Query Layer

Ogni modulo ha un file `{modulo}.queries.js` con funzioni isolate per le query SQL.

### 2.1 `auth.queries.js`

| Funzione | Parametri | Descrizione | SQL |
|---|---|---|---|
| `createTenantWithManager` | `(payload, trx)` | Crea tenant + utente manager + ruolo + subscription free | `INSERT INTO tenants ... INSERT INTO users ... INSERT INTO user_roles ... INSERT INTO subscriptions` |
| `findUserByEmail` | `(email, tenantId)` | Cerca utente per email + tenant con ruolo | `SELECT u.*, r.code FROM users u JOIN user_roles ur JOIN roles r WHERE u.email=? AND u.tenant_id=? AND u.deleted_at IS NULL` |
| `findUserByEmailGlobal` | `(email)` | Cerca utente su tutti i tenant | `SELECT u.*, r.code FROM users u JOIN user_roles ur JOIN roles r WHERE u.email=? AND u.deleted_at IS NULL` |
| `insertRefreshToken` | `(userId, tokenHash, expiresAt)` | Salva refresh token hashato | `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)` |
| `revokeRefreshToken` | `(tokenHash)` | Revoca refresh token | `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash=? AND revoked_at IS NULL` |
| `findRefreshToken` | `(tokenHash)` | Trova refresh token valido non revocato | `SELECT * FROM refresh_tokens WHERE token_hash=? AND revoked_at IS NULL AND expires_at > NOW()` |
| `updateLastLogin` | `(userId)` | Aggiorna timestamp ultimo login | `UPDATE users SET last_login_at = NOW() WHERE id=?` |
| `getUserById` | `(id)` | Ottiene utente con ruolo | `SELECT u.*, r.code FROM users u JOIN user_roles ur JOIN roles r WHERE u.id=? AND u.deleted_at IS NULL` |
| `getTenantBySlug` | `(slug)` | Cerca tenant per slug | `SELECT * FROM tenants WHERE slug=? AND deleted_at IS NULL` |

### 2.2 `tenants.queries.js`

| Funzione | Parametri | Descrizione | SQL |
|---|---|---|---|
| `getTenantById` | `(id)` | Ottiene tenant per ID | `SELECT * FROM tenants WHERE id=? AND deleted_at IS NULL` |
| `getTenantBySlug` | `(slug)` | Cerca tenant per slug | `SELECT * FROM tenants WHERE slug=? AND deleted_at IS NULL` |
| `updateTenant` | `(id, payload)` | Aggiorna campi tenant | `UPDATE tenants SET ... WHERE id=? AND deleted_at IS NULL` |

### 2.3 `users.queries.js`

| Funzione | Parametri | Descrizione | SQL |
|---|---|---|---|
| `getUsersByTenant` | `(tenantId, filters)` | Lista utenti del tenant con filtri (status, search) | `SELECT u.id, u.first_name, u.last_name, u.email, r.code as role_code FROM users u JOIN user_roles ur JOIN roles r WHERE u.tenant_id=? AND u.deleted_at IS NULL` |
| `getUserById` | `(userId, tenantId)` | Dettaglio utente tenant-scoped | `SELECT u.*, r.code FROM users u JOIN user_roles ur JOIN roles r WHERE u.id=? AND u.tenant_id=? AND u.deleted_at IS NULL LIMIT 1` |
| `updateUserRole` | `(userId, roleCode, tenantId)` | Sostituisce ruolo (DELETE + INSERT) | `DELETE FROM user_roles WHERE user_id=? AND tenant_id=?` + `INSERT INTO user_roles (user_id, role_id, tenant_id) VALUES (?, (SELECT id FROM roles WHERE code=?), ?)` |
| `softDeleteUser` | `(userId, tenantId)` | Soft delete + disabilita utente | `UPDATE users SET deleted_at=NOW(), status='disabled' WHERE id=? AND tenant_id=? AND deleted_at IS NULL` |
| `createInvitation` | `(payload)` | Crea invito con token random 48 byte | `INSERT INTO invitations (tenant_id, email, role_code, token, expires_at, created_by) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), ?)` |
| `getGroupsByTenant` | `(tenantId)` | Lista gruppi con conteggio membri | `SELECT g.*, COUNT(gm.id) as member_count FROM groups g LEFT JOIN group_members gm ON gm.group_id=g.id WHERE g.tenant_id=? AND g.deleted_at IS NULL GROUP BY g.id` |
| `createGroup` | `(tenantId, name, description)` | Crea gruppo | `INSERT INTO groups (tenant_id, name, description) VALUES (?, ?, ?)` |
| `addGroupMember` | `(groupId, userId, tenantId)` | Aggiunge utente a gruppo (con controllo duplicato) | `SELECT id FROM group_members WHERE group_id=? AND user_id=? LIMIT 1` + `INSERT INTO group_members (group_id, user_id) VALUES (?, ?)` se non esiste |

### 2.4 `tenders.queries.js`

| Funzione | Parametri | Descrizione | SQL |
|---|---|---|---|
| `getTendersByTenant` | `(tenantId, filters, pagination)` | Lista gare paginata con filtri (status, type, search, from, to, sortBy, sortOrder). Include assignments_count, requirements_count, completed_requirements | `SELECT t.*, (SELECT COUNT(*) FROM tender_assignments ...) as assignments_count, (SELECT COUNT(*) FROM requirement_items ...) FROM tenders WHERE tenant_id=? AND deleted_at IS NULL ... ORDER BY ... LIMIT ? OFFSET ?` |
| `getTenderById` | `(tenderId, tenantId)` | Dettaglio gara con assignments (JSON array) e conteggio requisiti | `SELECT t.*, (SELECT JSON_ARRAYAGG(...) FROM tender_assignments ...) as assignments, (SELECT COUNT(*) FROM requirement_items ...) as completed_requirements ... WHERE t.id=? AND t.tenant_id=? AND t.deleted_at IS NULL` |
| `insertTender` | `(payload)` | Crea nuova gara con tutti i campi | `INSERT INTO tenders (tenant_id, title, issuer, type, reference_code, description, value_amount, currency, publication_date, deadline_at, status, source_type, source_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` |
| `updateTender` | `(tenderId, tenantId, payload)` | Aggiorna solo i campi forniti (dinamico) | `UPDATE tenders SET ... WHERE id=? AND tenant_id=? AND deleted_at IS NULL` |
| `softDeleteTender` | `(tenderId, tenantId)` | Soft delete gara | `UPDATE tenders SET deleted_at=NOW() WHERE id=? AND tenant_id=? AND deleted_at IS NULL` |
| `updateTenderStatus` | `(tenderId, tenantId, status)` | Aggiorna solo lo stato | `UPDATE tenders SET status=? WHERE id=? AND tenant_id=? AND deleted_at IS NULL` |
| `assignUsersToTender` | `(tenderId, assignments)` | Assegna utenti/gruppi a gara (INSERT multipli) | `INSERT INTO tender_assignments (tender_id, user_id, group_id, assignment_type) VALUES (?, ?, ?, ?)` per ogni assignment |
| `getTenderDashboardStats` | `(tenantId)` | Statistiche KPI: total, draft, active, submitted, won, lost, cancelled, overdue, total_value, won_value | `SELECT COUNT(*) as total, SUM(CASE WHEN status='draft' THEN 1 ELSE 0 END) as draft, ..., SUM(CASE WHEN deadline_at<NOW() AND status IN ('draft','active') THEN 1 ELSE 0 END) as overdue, COALESCE(SUM(value_amount),0) as total_value, ... FROM tenders WHERE tenant_id=? AND deleted_at IS NULL` |

### 2.5 `requirements.queries.js`

| Funzione | Parametri | Descrizione | SQL |
|---|---|---|---|
| `getRequirementsByTender` | `(tenderId, tenantId)` | Lista requisiti raggruppati con items. Raggruppa in struttura: `[{id, title, source, items: [{id, label, status, ...}]}]` | `SELECT r.*, ri.* FROM requirements r LEFT JOIN requirement_items ri ON ri.requirement_id=r.id AND ri.deleted_at IS NULL WHERE r.tender_id=? AND r.tenant_id=? AND r.deleted_at IS NULL ORDER BY r.id, ri.id` |
| `insertRequirement` | `(payload)` | Crea categoria requisito | `INSERT INTO requirements (tenant_id, tender_id, title, source, created_by) VALUES (?, ?, ?, ?, ?)` |
| `insertRequirementItems` | `(items)` | Inserisce multipli item in un'unica query | `INSERT INTO requirement_items (tenant_id, requirement_id, tender_id, label, description, item_type, priority) VALUES (?, ?, ?, ?, ?, ?, ?)` (batch) |
| `updateRequirementItem` | `(itemId, tenantId, payload)` | Aggiorna campi dinamici di un item | `UPDATE requirement_items SET ... WHERE id=? AND tenant_id=? AND deleted_at IS NULL` |
| `softDeleteRequirementItem` | `(itemId, tenantId)` | Soft delete item requisito | `UPDATE requirement_items SET deleted_at=NOW() WHERE id=? AND tenant_id=? AND deleted_at IS NULL` |
| `getRequirementItemById` | `(itemId, tenantId)` | Dettaglio item con nome categoria | `SELECT ri.*, r.title as requirement_title FROM requirement_items ri JOIN requirements r ON r.id=ri.requirement_id WHERE ri.id=? AND ri.tenant_id=? AND ri.deleted_at IS NULL LIMIT 1` |

### 2.6 `documents.queries.js`

| Funzione | Parametri | Descrizione | SQL |
|---|---|---|---|
| `getDocumentsByTender` | `(tenderId, tenantId)` | Lista documenti di una gara | `SELECT * FROM documents WHERE tender_id=? AND tenant_id=? AND deleted_at IS NULL` |
| `createDocument` | `(payload, trx)` | Crea record documento | `INSERT INTO documents (tenant_id, tender_id, document_type, title, uploaded_by) VALUES (?, ?, ?, ?, ?)` |
| `createDocumentVersion` | `(payload, trx)` | Crea versione documento | `INSERT INTO document_versions (tenant_id, document_id, version_number, ...) VALUES (?, ?, ?, ...)` |
| `setCurrentDocumentVersion` | `(documentId, versionId, trx)` | Aggiorna current_version_id | `UPDATE documents SET current_version_id=? WHERE id=?` |
| `getDocumentVersionById` | `(docId, tenantId)` | Ottiene versione per download | `SELECT * FROM document_versions WHERE document_id=? AND tenant_id=? ORDER BY version_number DESC LIMIT 1` |
| `softDeleteDocument` | `(docId, tenantId)` | Soft delete documento | `UPDATE documents SET deleted_at=NOW() WHERE id=? AND tenant_id=?` |
| `getTenantStorageUsageMb` | `(tenantId)` | Calcolo spazio usato dal tenant | `SELECT COALESCE(SUM(size_bytes), 0)/1024/1024 as usage_mb FROM document_versions dv JOIN documents d ON d.id=dv.document_id WHERE d.tenant_id=? AND d.deleted_at IS NULL` |

### 2.7 `tasks.queries.js`

| Funzione | Parametri | Descrizione | SQL |
|---|---|---|---|
| `getTasksByTender` | `(tenderId, tenantId)` | Lista task di una gara | `SELECT * FROM tasks WHERE tender_id=? AND tenant_id=? AND deleted_at IS NULL` |
| `createTask` | `(payload)` | Crea task | `INSERT INTO tasks (tenant_id, tender_id, title, description, status, priority, ...) VALUES (?, ?, ?, ?, ?, ?, ...)` |
| `updateTask` | `(taskId, tenantId, payload)` | Aggiorna task | `UPDATE tasks SET ... WHERE id=? AND tenant_id=? AND deleted_at IS NULL` |
| `createTaskComment` | `(payload)` | Aggiunge commento a task | `INSERT INTO task_comments (tenant_id, task_id, user_id, body) VALUES (?, ?, ?, ?)` |
| `createApprovalFlow` | `(payload, trx)` | Crea flusso approvazione con step | `INSERT INTO approvals ... INSERT INTO approval_steps ...` |
| `approveStep` | `(stepId, userId, tenantId)` | Approva step | `UPDATE approval_steps SET status='approved', decided_at=NOW() WHERE id=? AND approver_user_id=? AND tenant_id=?` |
| `rejectStep` | `(stepId, userId, tenantId, note)` | Rifiuta step | `UPDATE approval_steps SET status='rejected', decided_at=NOW(), note=? WHERE id=? AND approver_user_id=? AND tenant_id=?` |

### 2.8 `ai.queries.js`

| Funzione | Parametri | Descrizione | SQL |
|---|---|---|---|
| `logAiRequest` | `(payload)` | Logga richiesta AI con esito | `INSERT INTO ai_requests (tenant_id, user_id, tender_id, request_type, model_name, prompt_tokens, completion_tokens, status, error_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` |
| `getMonthlyAiUsage` | `(tenantId, yearMonth)` | Utilizzo AI mensile per tenant | `SELECT COUNT(*) as count, COALESCE(SUM(prompt_tokens+completion_tokens),0) as total_tokens FROM ai_requests WHERE tenant_id=? AND DATE_FORMAT(created_at, '%Y-%m')=? AND status='success'` |

### 2.9 `scraping.queries.js`

| Funzione | Parametri | Descrizione | SQL |
|---|---|---|---|
| `getSourcesByTenant` | `(tenantId)` | Sorgenti scraping del tenant | `SELECT * FROM scraping_sources WHERE tenant_id=? ORDER BY name ASC` |
| `createSource` | `(payload)` | Crea nuova sorgente scraping | `INSERT INTO scraping_sources (tenant_id, name, source_type, base_url, config_json, is_active) VALUES (?, ?, ?, ?, ?, ?)` |
| `deleteSource` | `(sourceId, tenantId)` | Elimina sorgente | `DELETE FROM scraping_sources WHERE id=? AND tenant_id=?` |
| `createScrapingJob` | `(payload)` | Crea job scraping in stato queued | `INSERT INTO scraping_jobs (tenant_id, source_id, status) VALUES (?, ?, 'queued')` |
| `insertScrapedTenders` | `(items)` | Inserisce bandi scrapati con deduplica per source_id+external_id | `INSERT INTO scraped_tenders (...) VALUES ... ON DUPLICATE KEY UPDATE title=VALUES(title), updated_at=NOW()` |
| `getScrapedTendersByTenant` | `(tenantId, filters)` | Lista bandi con filtri (status, search, minScore), join con source | `SELECT st.*, ss.name as source_name FROM scraped_tenders st JOIN scraping_sources ss ON ss.id=st.source_id WHERE st.tenant_id=? ... ORDER BY st.created_at DESC` |
| `updateScrapedTenderStatus` | `(scrapedId, status, tenantId)` | Cambia stato bando (new/saved/dismissed) | `UPDATE scraped_tenders SET status=? WHERE id=? AND tenant_id=?` |
| `convertScrapedTenderToTender` | `(scrapedId, tenantId, userId, trx)` | Converte bando in gara reale + aggiorna status | `INSERT INTO tenders SELECT ... FROM scraped_tenders WHERE id=?` + `UPDATE scraped_tenders SET converted_tender_id=?, status='saved'` |

### 2.10 `chat.queries.js`

| Funzione | Parametri | Descrizione | SQL |
|---|---|---|---|
| `getChatSessions` | `(userId, tenantId)` | Sessioni chat utente con anteprima ultimo messaggio | `SELECT cs.*, (SELECT message_text FROM chat_messages WHERE session_id=cs.id ORDER BY created_at DESC LIMIT 1) as last_message FROM chat_sessions cs WHERE cs.user_id=? AND cs.tenant_id=? ORDER BY cs.updated_at DESC` |
| `createChatSession` | `(payload)` | Nuova sessione chat | `INSERT INTO chat_sessions (tenant_id, user_id, title, context_type, context_id) VALUES (?, ?, ?, ?, ?)` |
| `getMessagesBySession` | `(sessionId, tenantId)` | Messaggi sessione ordinati per data | `SELECT * FROM chat_messages WHERE session_id=? AND tenant_id=? ORDER BY created_at ASC` |
| `insertChatMessage` | `(payload)` | Inserisce messaggio utente/assistant/system | `INSERT INTO chat_messages (tenant_id, session_id, sender_type, message_text, tool_call_json) VALUES (?, ?, ?, ?, ?)` |
| `getSessionById` | `(sessionId, tenantId)` | Verifica esistenza e proprietario sessione | `SELECT * FROM chat_sessions WHERE id=? AND tenant_id=? LIMIT 1` |
| `updateSessionTimestamp` | `(sessionId)` | Aggiorna updated_at della sessione | `UPDATE chat_sessions SET updated_at=NOW() WHERE id=?` |

### 2.11 `audit.queries.js`

| Funzione | Parametri | Descrizione | SQL |
|---|---|---|---|
| `insertAuditLog` | `(payload)` | Inserisce entry audit | `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, diff_json, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)` |
| `getAuditLogsByTenant` | `(tenantId, filters, pagination)` | Log audit del tenant con paginazione e filtri (action, entityType, from, to) | `SELECT al.*, CONCAT(u.first_name,' ',u.last_name) as user_name FROM audit_logs al LEFT JOIN users u ON u.id=al.user_id WHERE al.tenant_id=? ... ORDER BY al.created_at DESC LIMIT ? OFFSET ?` |
| `getGlobalAuditLogs` | `(filters, pagination)` | Log audit globali con join tenant (superadmin) | `SELECT al.*, CONCAT(u.first_name,' ',u.last_name) as user_name, t.name as tenant_name FROM audit_logs al LEFT JOIN users u ON u.id=al.user_id LEFT JOIN tenants t ON t.id=al.tenant_id WHERE 1=1 ... ORDER BY al.created_at DESC LIMIT ? OFFSET ?` |
| `getAuditExportByTenant` | `(tenantId, filters)` | Export CSV log tenant | `SELECT al.created_at, al.action, al.entity_type, al.entity_id, CONCAT(u.first_name,' ',u.last_name) as user_name FROM audit_logs al LEFT JOIN users u ON u.id=al.user_id WHERE al.tenant_id=? ... ORDER BY al.created_at DESC` |

---

## 3. API Routes

### 3.1 Auth — `/api/auth`

| Metodo | Path | Descrizione | Auth | Ruolo |
|---|---|---|---|---|
| POST | `/api/auth/register` | Registra azienda + crea tenant + manager | No | Public |
| POST | `/api/auth/login` | Login → access + refresh token | No | Public |
| POST | `/api/auth/refresh` | Rinnova access token | No | Public |
| POST | `/api/auth/logout` | Revoca refresh token | Bearer | Auth |

### 3.2 Tenant — `/api/me/tenant`

| Metodo | Path | Descrizione | Auth | Ruolo |
|---|---|---|---|---|
| GET | `/api/me/tenant` | Profilo tenant corrente | Bearer | Auth |
| PATCH | `/api/me/tenant` | Aggiorna profilo tenant | Bearer | manager |

### 3.3 Users — `/api/users`

| Metodo | Path | Descrizione | Auth | Ruolo |
|---|---|---|---|---|
| GET | `/api/users` | Lista utenti del tenant | Bearer | manager |
| POST | `/api/users/invite` | Invita utente via email | Bearer | manager |
| PATCH | `/api/users/:id/role` | Cambia ruolo utente | Bearer | manager |
| DELETE | `/api/users/:id` | Rimuove utente dal tenant | Bearer | manager |
| GET | `/api/users/groups` | Lista gruppi | Bearer | manager |
| POST | `/api/users/groups` | Crea gruppo | Bearer | manager |
| POST | `/api/users/groups/:id/members` | Aggiungi membro a gruppo | Bearer | manager |

### 3.4 Tenders — `/api/tenders`

| Metodo | Path | Descrizione | Auth | Ruolo |
|---|---|---|---|---|
| GET | `/api/tenders` | Lista gare (filtri: status, type, deadline) | Bearer | user |
| POST | `/api/tenders` | Crea nuova gara | Bearer | manager |
| GET | `/api/tenders/:id` | Dettaglio gara | Bearer | user (assegnato) |
| PATCH | `/api/tenders/:id` | Aggiorna gara | Bearer | manager |
| DELETE | `/api/tenders/:id` | Elimina gara (soft) | Bearer | manager |
| PATCH | `/api/tenders/:id/status` | Cambia stato gara | Bearer | manager |
| GET | `/api/tenders/dashboard` | KPI dashboard gare | Bearer | user |
| POST | `/api/tenders/:id/assign` | Assegna utenti/gruppi | Bearer | manager |

### 3.5 Requirements — `/api/tenders/:id/requirements`

| Metodo | Path | Descrizione | Auth | Ruolo |
|---|---|---|---|---|
| GET | `/api/tenders/:id/requirements` | Lista requisiti gara | Bearer | user |
| POST | `/api/tenders/:id/requirements` | Aggiungi requisito | Bearer | manager |
| PATCH | `/api/requirements/:itemId` | Aggiorna stato/note item | Bearer | user |
| DELETE | `/api/requirements/:itemId` | Elimina item | Bearer | manager |

### 3.6 Documents — `/api/tenders/:id/documents`

| Metodo | Path | Descrizione | Auth | Ruolo |
|---|---|---|---|---|
| GET | `/api/tenders/:id/documents` | Lista documenti gara | Bearer | user |
| POST | `/api/tenders/:id/documents` | Upload file (multipart) | Bearer | user |
| GET | `/api/documents/:docId/download` | Download file (stream) | Bearer | user |
| GET | `/api/documents/:docId/versions` | Lista versioni | Bearer | user |
| DELETE | `/api/documents/:docId` | Soft delete documento | Bearer | manager |

### 3.7 Tasks — `/api/tenders/:id/tasks`

| Metodo | Path | Descrizione | Auth | Ruolo |
|---|---|---|---|---|
| GET | `/api/tenders/:id/tasks` | Lista task gara | Bearer | user |
| POST | `/api/tenders/:id/tasks` | Crea task | Bearer | manager |
| PATCH | `/api/tasks/:taskId` | Aggiorna task (stato, assegnatario) | Bearer | user |
| DELETE | `/api/tasks/:taskId` | Elimina task | Bearer | manager |
| POST | `/api/tasks/:taskId/comments` | Aggiungi commento | Bearer | user |
| GET | `/api/tasks/:taskId/approvals` | Stato workflow approvazione | Bearer | user |
| POST | `/api/tasks/:taskId/approvals/:stepId/approve` | Approva step | Bearer | user (step owner) |
| POST | `/api/tasks/:taskId/approvals/:stepId/reject` | Rifiuta step | Bearer | user (step owner) |

### 3.8 AI — `/api/ai`

| Metodo | Path | Descrizione | Auth | Ruolo |
|---|---|---|---|---|
| POST | `/api/ai/extract-requirements` | Estrae requisiti da file bando | Bearer | user |
| POST | `/api/ai/compliance-check` | Gap analysis checklist vs documenti | Bearer | user |
| POST | `/api/ai/summary` | Sintesi bando in markdown | Bearer | user |
| POST | `/api/ai/go-nogo` | Score e raccomandazione partecipazione | Bearer | manager |
| POST | `/api/ai/qa` | Q&A RAG sui documenti gara | Bearer | user |
| POST | `/api/ai/draft` | Bozza sezione risposta | Bearer | user |

### 3.9 Chatbot — `/api/chat`

| Metodo | Path | Descrizione | Auth | Ruolo |
|---|---|---|---|---|
| GET | `/api/chat/sessions` | Lista sessioni chat | Bearer | user |
| POST | `/api/chat/sessions` | Nuova sessione | Bearer | user |
| GET | `/api/chat/sessions/:id/messages` | Messaggi sessione | Bearer | user |
| POST | `/api/chat/sessions/:id/messages` | Invia messaggio (esegue azioni) | Bearer | user |

### 3.10 Scraping — `/api/scraping`

| Metodo | Path | Descrizione | Auth | Ruolo |
|---|---|---|---|---|
| GET | `/api/scraping/tenders` | Lista bandi trovati | Bearer | user |
| PATCH | `/api/scraping/tenders/:id/status` | Cambia stato (new/saved/dismissed) | Bearer | user |
| POST | `/api/scraping/tenders/:id/convert` | Converti in gara reale | Bearer | manager |
| GET | `/api/scraping/sources` | Lista sorgenti configurate | Bearer | manager |
| POST | `/api/scraping/sources` | Aggiungi sorgente | Bearer | manager |
| DELETE | `/api/scraping/sources/:id` | Rimuovi sorgente | Bearer | manager |

### 3.11 Audit — `/api/audit`

| Metodo | Path | Descrizione | Auth | Ruolo |
|---|---|---|---|---|
| GET | `/api/audit` | Log attività tenant | Bearer | manager |
| GET | `/api/audit/export` | Export CSV log tenant | Bearer | manager |

### 3.12 Admin — `/api/admin` (superadmin only)

| Metodo | Path | Descrizione | Auth | Ruolo |
|---|---|---|---|---|
| GET | `/api/admin/tenants` | Lista tutti i tenant | Bearer | superadmin |
| GET | `/api/admin/tenants/:id` | Dettaglio tenant | Bearer | superadmin |
| PATCH | `/api/admin/tenants/:id/status` | Abilita/disabilita tenant | Bearer | superadmin |
| GET | `/api/admin/subscriptions` | Lista sottoscrizioni | Bearer | superadmin |
| PATCH | `/api/admin/subscriptions/:id` | Modifica piano | Bearer | superadmin |
| GET | `/api/admin/audit` | Log globali tutti i tenant | Bearer | superadmin |
| GET | `/api/admin/users` | Lista globale utenti | Bearer | superadmin |

---

## 4. Audit Log Integration

Ogni operazione critica nei service chiama `audit.service.log(action, entityType, entityId, userId, tenantId, diff, req)`.

| Modulo | Azione | Evento |
|---|---|---|
| Auth | Login | `auth.login` |
| Auth | Registrazione tenant | `auth.register` |
| Tenders | Creazione gara | `tender.created` |
| Tenders | Modifica gara | `tender.updated` |
| Tenders | Eliminazione gara | `tender.deleted` |
| Tenders | Cambio stato | `tender.status_changed` |
| Tenders | Assegnazione | `tender.assigned` |
| Requirements | Aggiunta requisito | `requirement.created` |
| Requirements | Aggiornamento item | `requirement_item.updated` |
| Requirements | Eliminazione item | `requirement_item.deleted` |
| Users | Cambio ruolo | `user.role_changed` |
| Users | Rimozione utente | `user.removed` |
| Users | Invito | `user.invited` |
| AI | Richiesta AI completata | `ai.extract-requirements`, `ai.summary`, `ai.compliance-check`, `ai.go-nogo`, `ai.qa`, `ai.draft` |
| Chatbot | Messaggio inviato | `chat.message_sent` |
| Scraping | Sorgente creata | `scraping.source_created` |
| Scraping | Sorgente eliminata | `scraping.source_deleted` |
| Scraping | Stato bando cambiato | `scraping.tender_status_changed` |
| Scraping | Bando convertito in gara | `scraping.tender_converted` |

---

## 5. Storage Pattern

```
/storage/{tenant_id}/{tender_id}/{document_id}/v{version}_{sanitized_filename}
```

- Upload via `POST /api/tenders/:id/documents` (multipart field: `file`)
- MIME whitelist: pdf, doc, docx, xls, xlsx, zip, png, jpeg, txt, csv
- Limite: 50 MB per file, 1024 MB per tenant (free plan)
- SHA-256 checksum calcolato su ogni upload
- Download solo via controller autenticato (`GET /api/tenders/documents/:docId/download`)
- Riassegnazione file su disco con `fs.renameSync` dopo validazione

---

## 6. Middleware

| Middleware | File | Funzione |
|---|---|---|
| JWT verify | `auth.middleware.js` | Estrae token Bearer, verifica con `jsonwebtoken`, popola `req.user` |
| resolveTenant | `tenant.middleware.js` | Legge `req.user.tenantId` e lo inietta in `req.tenantId` |
| requireRole(minRole) | `rbac.middleware.js` | Confronta `req.user.role` con gerarchia: superadmin(3) > manager(2) > user(1) |
| requireSuperadmin | `rbac.middleware.js` | Blocca se ruolo !== superadmin |
| errorHandler | `errorHandler.middleware.js` | Catch globale errori, logga con winston, risposta standard |

---

## 5. Formato Risposte

```
// Successo
{ "success": true, "data": { ... }, "meta": { "page": 1, "total": 42 } }

// Errore
{ "success": false, "error": { "code": "TENDER_NOT_FOUND", "message": "..." } }
```
