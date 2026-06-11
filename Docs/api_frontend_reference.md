# API Frontend → Backend — Reference Completa

> Questo documento elenca **tutte le chiamate API** che il frontend TenderFlow esegue verso il backend, organizzate per modulo.
> Base URL: `VITE_API_BASE_URL` (default: `http://localhost:3000/api`)

---

## Indice

1. [Auth](#1-auth)
2. [Profilo](#2-profilo)
3. [Gare (Tenders)](#3-gare-tenders)
4. [Requisiti / Checklist](#4-requisiti--checklist)
5. [Documenti](#5-documenti)
6. [Task](#6-task)
7. [AI](#7-ai)
8. [Chatbot](#8-chatbot)
9. [Scraping Bandi](#9-scraping-bandi)
10. [Audit Log](#10-audit-log)
11. [Utenti (Tenant-scoped)](#11-utenti-tenant-scoped)
12. [Admin (Superadmin)](#12-admin-superadmin)
13. [Interceptor — Refresh Token](#13-interceptor--refresh-token)

---

## 1. Auth

**File:** `src/api/auth.api.js`

| # | Funzione Frontend | Metodo | Path | Body | Store |
|---|---|---|---|---|---|
| 1.1 | `login({ email, password })` | `POST` | `/api/auth/login` | `{ email, password }` | Salva `accessToken` e `refreshToken` in `localStorage` |
| 1.2 | `registerCompany(payload)` | `POST` | `/api/auth/register` | `{ companyName, firstName, lastName, email, password }` | Salva `accessToken` e `refreshToken` in `localStorage` |
| 1.3 | `refreshToken()` | `POST` | `/api/auth/refresh` | `{ refreshToken }` | Aggiorna `accessToken` in `localStorage` |
| 1.4 | `logout()` | `POST` | `/api/auth/logout` | — | Rimuove `accessToken` e `refreshToken` da `localStorage` |
| 1.5 | `getMe()` | `GET` | `/api/me` | — | — |

**Risposta attesa (login/register):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": 1,
      "tenantId": 12,
      "email": "manager@acme.it",
      "firstName": "Mario",
      "lastName": "Rossi",
      "role": "manager"
    }
  }
}
```

**Risposta attesa (getMe):**
```json
{
  "success": true,
  "data": {
    "id": 1, "tenantId": 12, "email": "manager@acme.it",
    "firstName": "Mario", "lastName": "Rossi", "role": "manager"
  }
}
```

---

## 2. Profilo

**File:** `src/api/auth.api.js` (stesso file)

| # | Funzione Frontend | Metodo | Path |
|---|---|---|---|
| 2.1 | `getMe()` | `GET` | `/api/me` |

*(Le route `PATCH /api/me`, `PATCH /api/me/password` non hanno ancora un wrapper dedicato ma sono definite nell'API spec)*

---

## 3. Gare (Tenders)

**File:** `src/api/tenders.api.js`

| # | Funzione Frontend | Metodo | Path | Body / Query |
|---|---|---|---|---|
| 3.1 | `getTenders(params)` | `GET` | `/api/tenders` | `?status=&type=&deadline=&search=` |
| 3.2 | `getTenderById(id)` | `GET` | `/api/tenders/:id` | — |
| 3.3 | `createTender(payload)` | `POST` | `/api/tenders` | `{ title, issuer, type, deadlineAt, valueAmount, ... }` |
| 3.4 | `updateTender(id, payload)` | `PATCH` | `/api/tenders/:id` | `{ title, issuer, ... }` |
| 3.5 | `updateTenderStatus(id, status)` | `PATCH` | `/api/tenders/:id/status` | `{ status }` |
| 3.6 | `assignTender(id, payload)` | `POST` | `/api/tenders/:id/assign` | `{ userIds, groupIds }` |
| 3.7 | `getTenderDashboard()` | `GET` | `/api/tenders/dashboard` | — |

**Risposta attesa (lista):**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "title": "Fornitura software procurement",
      "issuer": "Comune di Milano",
      "type": "rfp",
      "status": "active",
      "deadlineAt": "2026-07-12T10:00:00Z",
      "valueAmount": 120000.00,
      "goNoGoDecision": "pending"
    }
  ],
  "meta": { "page": 1, "total": 42 }
}
```

---

## 4. Requisiti / Checklist

**File:** `src/api/requirements.api.js`

| # | Funzione Frontend | Metodo | Path | Body |
|---|---|---|---|---|
| 4.1 | `getRequirementsByTender(tenderId)` | `GET` | `/api/tenders/:tenderId/requirements` | — |
| 4.2 | `createRequirement(tenderId, payload)` | `POST` | `/api/tenders/:tenderId/requirements` | `{ label, priority, dueAt, assignedUserId }` |
| 4.3 | `updateRequirementItem(itemId, payload)` | `PATCH` | `/api/requirements/:itemId` | `{ status, note, assignedUserId, dueAt }` |
| 4.4 | `deleteRequirementItem(itemId)` | `DELETE` | `/api/requirements/:itemId` | — |

**Risposta attesa (item):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "label": "DURC in corso di validità",
    "priority": "mandatory",
    "status": "pending",
    "assignedUserId": 15,
    "dueAt": null
  }
}
```

---

## 5. Documenti

**File:** `src/api/documents.api.js`

| # | Funzione Frontend | Metodo | Path | Note |
|---|---|---|---|---|
| 5.1 | `getDocumentsByTender(tenderId)` | `GET` | `/api/tenders/:tenderId/documents` | — |
| 5.2 | `uploadDocument(tenderId, formData)` | `POST` | `/api/tenders/:tenderId/documents` | `Content-Type: multipart/form-data` |
| 5.3 | `downloadDocument(docId)` | `GET` | `/api/documents/:docId/download` | `responseType: 'blob'` |
| 5.4 | `getDocumentVersions(docId)` | `GET` | `/api/documents/:docId/versions` | — |
| 5.5 | `deleteDocument(docId)` | `DELETE` | `/api/documents/:docId` | — |

---

## 6. Task

**File:** `src/api/tasks.api.js`

| # | Funzione Frontend | Metodo | Path | Body |
|---|---|---|---|---|
| 6.1 | `getTasksByTender(tenderId)` | `GET` | `/api/tenders/:tenderId/tasks` | — |
| 6.2 | `createTask(tenderId, payload)` | `POST` | `/api/tenders/:tenderId/tasks` | `{ title, description, status, assignedUserId, dueAt }` |
| 6.3 | `updateTask(taskId, payload)` | `PATCH` | `/api/tasks/:taskId` | `{ status, assignedUserId, ... }` |
| 6.4 | `deleteTask(taskId)` | `DELETE` | `/api/tasks/:taskId` | — |
| 6.5 | `createTaskComment(taskId, payload)` | `POST` | `/api/tasks/:taskId/comments` | `{ text }` |
| 6.6 | `getApprovalState(taskId)` | `GET` | `/api/tasks/:taskId/approvals` | — |
| 6.7 | `approveStep(taskId, stepId)` | `POST` | `/api/tasks/:taskId/approvals/:stepId/approve` | — |
| 6.8 | `rejectStep(taskId, stepId, payload)` | `POST` | `/api/tasks/:taskId/approvals/:stepId/reject` | `{ reason }` |

---

## 7. AI

**File:** `src/api/ai.api.js`

| # | Funzione Frontend | Metodo | Path | Body |
|---|---|---|---|---|
| 7.1 | `extractRequirements(payload)` | `POST` | `/api/ai/extract-requirements` | `{ documentId }` o `{ text }` |
| 7.2 | `runComplianceCheck(payload)` | `POST` | `/api/ai/compliance-check` | `{ tenderId }` |
| 7.3 | `generateSummary(payload)` | `POST` | `/api/ai/summary` | `{ tenderId }` o `{ text }` |
| 7.4 | `runGoNoGo(payload)` | `POST` | `/api/ai/go-nogo` | `{ tenderId }` |
| 7.5 | `askTenderQuestion(payload)` | `POST` | `/api/ai/qa` | `{ tenderId, question }` |
| 7.6 | `generateDraft(payload)` | `POST` | `/api/ai/draft` | `{ tenderId, sectionId, instructions }` |

---

## 8. Chatbot

**File:** `src/api/chat.api.js`

| # | Funzione Frontend | Metodo | Path | Body |
|---|---|---|---|---|
| 8.1 | `getChatSessions()` | `GET` | `/api/chat/sessions` | — |
| 8.2 | `createChatSession(payload)` | `POST` | `/api/chat/sessions` | `{ title }` |
| 8.3 | `getChatMessages(sessionId)` | `GET` | `/api/chat/sessions/:sessionId/messages` | — |
| 8.4 | `sendChatMessage(sessionId, payload)` | `POST` | `/api/chat/sessions/:sessionId/messages` | `{ text }` |

**Risposta attesa (message):**
```json
{
  "success": true,
  "data": {
    "id": 9,
    "senderType": "assistant",
    "messageText": "Ho creato il task richiesto.",
    "toolCall": {
      "action": "create_task",
      "result": { "taskId": 87 }
    },
    "createdAt": "2026-06-11T10:00:00Z"
  }
}
```

---

## 9. Scraping Bandi

**File:** `src/api/scraping.api.js`

| # | Funzione Frontend | Metodo | Path | Body / Query |
|---|---|---|---|---|
| 9.1 | `getDiscoveredTenders(params)` | `GET` | `/api/scraping/tenders` | `?status=&source=&relevance=` |
| 9.2 | `updateDiscoveredTenderStatus(id, payload)` | `PATCH` | `/api/scraping/tenders/:id/status` | `{ status }` (new/saved/dismissed) |
| 9.3 | `convertDiscoveredTender(id)` | `POST` | `/api/scraping/tenders/:id/convert` | — |
| 9.4 | `getSources()` | `GET` | `/api/scraping/sources` | — |
| 9.5 | `createSource(payload)` | `POST` | `/api/scraping/sources` | `{ name, url, type }` |
| 9.6 | `deleteSource(id)` | `DELETE` | `/api/scraping/sources/:id` | — |

---

## 10. Audit Log

**File:** `src/api/audit.api.js`

| # | Funzione Frontend | Metodo | Path | Query |
|---|---|---|---|---|
| 10.1 | `getAuditLogs(params)` | `GET` | `/api/audit` | `?page=&limit=&action=&userId=` |
| 10.2 | `exportAuditLogs()` | `GET` | `/api/audit/export` | `responseType: 'blob'` (CSV) |

---

## 11. Utenti (Tenant-scoped)

**File:** `src/api/users.api.js`

| # | Funzione Frontend | Metodo | Path | Body |
|---|---|---|---|---|
| 11.1 | `getUsers()` | `GET` | `/api/users` | — |
| 11.2 | `inviteUser(payload)` | `POST` | `/api/users/invite` | `{ email, role }` |
| 11.3 | `updateUserRole(id, role)` | `PATCH` | `/api/users/:id/role` | `{ role }` |
| 11.4 | `deleteUser(id)` | `DELETE` | `/api/users/:id` | — |
| 11.5 | `getGroups()` | `GET` | `/api/users/groups` | — |
| 11.6 | `createGroup(payload)` | `POST` | `/api/users/groups` | `{ name }` |
| 11.7 | `addGroupMember(groupId, payload)` | `POST` | `/api/users/groups/:groupId/members` | `{ userId }` |

---

## 12. Admin (Superadmin)

**File:** `src/api/admin.api.js`

| # | Funzione Frontend | Metodo | Path | Body / Query |
|---|---|---|---|---|
| 12.1 | `getTenants(params)` | `GET` | `/api/admin/tenants` | `?page=&status=&search=` |
| 12.2 | `getTenantById(id)` | `GET` | `/api/admin/tenants/:id` | — |
| 12.3 | `updateTenantStatus(id, status)` | `PATCH` | `/api/admin/tenants/:id/status` | `{ status }` |
| 12.4 | `getSubscriptions(params)` | `GET` | `/api/admin/subscriptions` | `?page=&status=` |
| 12.5 | `updateSubscription(id, payload)` | `PATCH` | `/api/admin/subscriptions/:id` | `{ plan, status }` |
| 12.6 | `getGlobalAudit(params)` | `GET` | `/api/admin/audit` | `?page=&tenantId=&action=` |
| 12.7 | `getGlobalUsers(params)` | `GET` | `/api/admin/users` | `?page=&tenantId=` |

---

## 13. Interceptor — Refresh Token

**File:** `src/api/client.js`

Il client Axios implementa un meccanismo automatico di refresh token:

1. **Request interceptor:** Legge `tenderflow_access_token` dal `localStorage` e lo inietta come `Authorization: Bearer <token>`.
2. **Response interceptor (401):**
   - Se la richiesta riceve `401` e non è già un retry:
     - Blocca le richieste concorrenti in una coda (`failedQueue`)
     - Chiama `POST /api/auth/refresh` con `{ refreshToken }`
     - Se successo: aggiorna `tenderflow_access_token`, riprocessa la coda, riprova la richiesta originale
     - Se fallisce: svuota `localStorage` (token, refresh token, user) e redirect a `/login`

```json
// Richiesta di refresh
POST /api/auth/refresh
Body: { "refreshToken": "eyJ..." }

// Risposta successo
{
  "success": true,
  "data": { "accessToken": "eyJ..." }
}
```

---

## Riepilogo statistico

| Modulo | Endpoint |
|---|---|
| Auth | 5 |
| Gare | 7 |
| Requisiti | 4 |
| Documenti | 5 |
| Task | 8 |
| AI | 6 |
| Chatbot | 4 |
| Scraping | 6 |
| Audit | 2 |
| Utenti | 7 |
| Admin | 7 |
| **Totale** | **61** |
