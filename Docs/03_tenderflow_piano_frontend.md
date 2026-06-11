# TenderFlow — Piano di Sviluppo Front-End

> Versione 1.0 — Giugno 2026  
> Audience: sviluppatore front-end

---

## 1. Obiettivi del documento

Questo documento definisce il piano completo di sviluppo front-end di TenderFlow.  
L'obiettivo è costruire un'interfaccia React solida, modulare e coerente con l'API condivisa, mantenendo CSS Modules come standard stilistico del progetto.

---

## 2. Responsabilità Front-End

Lo sviluppatore front-end è responsabile di:

- setup architettura React;
- routing pubblico e privato;
- integrazione API tramite client condiviso;
- stato autenticazione utente;
- layout applicativo privato;
- pagine pubbliche del sito;
- moduli CRUD per gare, documenti, checklist e task;
- componenti AI e chatbot UI;
- gestione errori, loading state, empty state;
- coerenza visiva con CSS Modules;
- uso di mock API quando il back-end non è ancora pronto.

---

## 3. Stack e Convenzioni Front-End

### Stack previsto
| Area | Scelta |
|---|---|
| UI | React 18 |
| Routing | React Router |
| HTTP client | Axios |
| Styling | CSS Modules |
| State locale | React hooks |
| State condiviso | Context API o store leggero |
| Form | React Hook Form o equivalente |
| Tabelle/liste | componenti custom |
| Mock API | MSW |

### Convenzioni naming
- Componenti: `PascalCase`
- Hook: `useSomething`
- CSS Modules: `ComponentName.module.css`
- Pagine: `SomethingPage.jsx`
- API wrapper: `module.api.js`
- Mapper payload/response: `module.mapper.js` se necessario

---

## 4. Struttura cartelle consigliata

```
frontend/src/
├── api/
│   ├── client.js
│   ├── auth.api.js
│   ├── tenders.api.js
│   ├── requirements.api.js
│   ├── documents.api.js
│   ├── tasks.api.js
│   ├── ai.api.js
│   ├── chat.api.js
│   ├── scraping.api.js
│   └── admin.api.js
├── components/
│   ├── layout/
│   ├── tables/
│   ├── forms/
│   ├── cards/
│   ├── modals/
│   ├── chatbot/
│   └── feedback/
├── context/
│   ├── AuthContext.jsx
│   └── UIContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useApi.js
│   ├── useDebounce.js
│   └── usePermissions.js
├── pages/
│   ├── public/
│   ├── private/
│   └── admin/
├── utils/
│   ├── date.js
│   ├── format.js
│   ├── guards.js
│   └── constants.js
├── styles/
│   ├── variables.css
│   └── globals.css
├── App.jsx
└── main.jsx
```

---

## 5. Roadmap di sviluppo front-end

### Fase 1 — App shell e autenticazione

#### Task
- setup React + router + struttura cartelle
- configurazione Axios client con interceptor token
- `AuthContext` per sessione utente
- route pubbliche e private
- `ProtectedRoute`
- pagine `LoginPage` e `RegisterPage`
- layout base privato: sidebar, topbar, content area

#### Deliverable
- accesso autenticato funzionante
- redirect automatici post login
- gestione logout
- pagina 404

### Fase 2 — Dashboard e gare

#### Task
- `DashboardPage` con KPI card e liste sintetiche
- `TendersListPage` con tabella, filtri, ricerca, badge stato
- `CreateTenderModal` o pagina dedicata
- `TenderDetailPage` con struttura a tab
- overview gara con dati principali

#### Deliverable
- flusso completo lista -> dettaglio -> modifica gara
- componenti riusabili per status badge e data badge

### Fase 3 — Checklist e task

#### Task
- `ChecklistPage` integrata nel dettaglio gara
- progress bar completamento requisiti
- editor item requisito
- `TasksPage` con vista lista o kanban
- form task con assegnazione utente/gruppo
- commenti task

#### Deliverable
- gestione operativa del lavoro collaborativo
- stati task aggiornabili da UI

### Fase 4 — Documenti

#### Task
- `DocumentsPage`
- drag-and-drop uploader
- lista file con tipo, versione, uploader, data
- azione download
- visual feedback upload/error

#### Deliverable
- upload documento reale verso API
- refresh lista documenti e versioning

### Fase 5 — AI UX

#### Task
- card summary bando
- pannello compliance check
- sezione go/no-go
- box Q&A documenti
- generazione bozza risposta
- stato loading, retry e fallback per servizi AI

#### Deliverable
- AI integrata come supporto reale, non decorativo
- feedback chiaro su risultato AI e azioni successive

### Fase 6 — Chatbot e scraping

#### Task
- `ChatbotDrawer` persistente
- cronologia chat e input messaggi
- rendering risposte assistant
- gestione action result del chatbot
- `BandiBrowserPage` con filtri e rilevanza
- CTA "Salva come gara"

#### Deliverable
- esperienza conversazionale integrata nel workspace
- ricerca bandi visualizzabile e utilizzabile dal tenant

### Fase 7 — Admin e area pubblica

#### Task
- `AdminDashboard`
- `TenantsPage`
- `SubscriptionsPage`
- `GlobalAuditPage`
- landing pubblica premium: `HomePage`, `FeaturesPage`, `PricingPage`, `DemoRequestPage`

#### Deliverable
- demo portfolio completa anche lato presentazione prodotto

---

## 6. Pagine da sviluppare

### Area pubblica
| Pagina | Route | Scopo |
|---|---|---|
| `HomePage` | `/` | Presentazione prodotto |
| `FeaturesPage` | `/features` | Moduli e benefici |
| `PricingPage` | `/pricing` | Piani subscription |
| `DemoRequestPage` | `/demo` | Form richiesta demo |
| `LoginPage` | `/login` | Accesso utenti |
| `RegisterPage` | `/register` | Creazione tenant |

### Area privata tenant
| Pagina | Route | Ruolo minimo |
|---|---|---|
| `DashboardPage` | `/app/dashboard` | user |
| `TendersListPage` | `/app/tenders` | user |
| `TenderDetailPage` | `/app/tenders/:id` | user |
| `UsersPage` | `/app/users` | manager |
| `AuditLogPage` | `/app/audit` | manager |
| `BandiBrowserPage` | `/app/discovery` | user |
| `SettingsPage` | `/app/settings` | user |

### Area admin globale
| Pagina | Route | Ruolo minimo |
|---|---|---|
| `AdminDashboard` | `/admin/dashboard` | superadmin |
| `TenantsPage` | `/admin/tenants` | superadmin |
| `SubscriptionsPage` | `/admin/subscriptions` | superadmin |
| `GlobalAuditPage` | `/admin/audit` | superadmin |

---

## 7. Componenti condivisi principali

### Layout
- `AppLayout`
- `Sidebar`
- `Topbar`
- `Breadcrumbs`
- `PageHeader`
- `SectionCard`

### Feedback UI
- `Loader`
- `EmptyState`
- `ErrorState`
- `StatusBadge`
- `PriorityBadge`
- `Toast`
- `ConfirmModal`

### Tabelle e liste
- `DataTable`
- `FilterBar`
- `SearchInput`
- `Pagination`
- `SortButton`

### Form
- `TextInput`
- `Textarea`
- `Select`
- `DateTimeInput`
- `FileDropzone`
- `SubmitButton`

### AI / chat
- `AiSummaryCard`
- `CompliancePanel`
- `GoNoGoCard`
- `QaPanel`
- `DraftAssistantPanel`
- `ChatbotDrawer`
- `ChatMessageList`
- `ChatComposer`
- `ActionResultCard`

---

## 8. Integrazione API

### Client HTTP
Creare `api/client.js` con:
- `baseURL = import.meta.env.VITE_API_BASE_URL`
- interceptor request per token access
- interceptor response per gestione 401 con refresh token
- wrapper standard error parsing

### File API attesi
- `auth.api.js`
- `users.api.js`
- `tenders.api.js`
- `requirements.api.js`
- `documents.api.js`
- `tasks.api.js`
- `ai.api.js`
- `chat.api.js`
- `scraping.api.js`
- `audit.api.js`
- `admin.api.js`

### Metodi front-end attesi

#### `auth.api.js`
- `login(payload)`
- `registerCompany(payload)`
- `refreshToken()`
- `logout()`
- `getMe()`

#### `tenders.api.js`
- `getTenders(params)`
- `getTenderById(id)`
- `createTender(payload)`
- `updateTender(id, payload)`
- `updateTenderStatus(id, status)`
- `assignTender(id, payload)`
- `getTenderDashboard()`

#### `requirements.api.js`
- `getRequirementsByTender(tenderId)`
- `createRequirement(tenderId, payload)`
- `updateRequirementItem(itemId, payload)`
- `deleteRequirementItem(itemId)`

#### `documents.api.js`
- `getDocumentsByTender(tenderId)`
- `uploadDocument(tenderId, formData)`
- `downloadDocument(docId)`
- `getDocumentVersions(docId)`
- `deleteDocument(docId)`

#### `tasks.api.js`
- `getTasksByTender(tenderId)`
- `createTask(tenderId, payload)`
- `updateTask(taskId, payload)`
- `createTaskComment(taskId, payload)`
- `getApprovalState(taskId)`
- `approveStep(taskId, stepId)`
- `rejectStep(taskId, stepId, payload)`

#### `ai.api.js`
- `extractRequirements(payload)`
- `runComplianceCheck(payload)`
- `generateSummary(payload)`
- `runGoNoGo(payload)`
- `askTenderQuestion(payload)`
- `generateDraft(payload)`

#### `chat.api.js`
- `getChatSessions()`
- `createChatSession(payload)`
- `getChatMessages(sessionId)`
- `sendChatMessage(sessionId, payload)`

#### `scraping.api.js`
- `getDiscoveredTenders(params)`
- `updateDiscoveredTenderStatus(id, payload)`
- `convertDiscoveredTender(id)`
- `getSources()`
- `createSource(payload)`
- `deleteSource(id)`

---

## 9. Contratti dati lato UI

### Auth user object
```json
{
  "id": 1,
  "tenantId": 12,
  "email": "manager@acme.it",
  "firstName": "Mario",
  "lastName": "Rossi",
  "role": "manager"
}
```

### Tender list item
```json
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
```

### Requirement item
```json
{
  "id": 1,
  "label": "DURC in corso di validità",
  "priority": "mandatory",
  "status": "pending",
  "assignedUserId": 15,
  "dueAt": null
}
```

### Chat message
```json
{
  "id": 9,
  "senderType": "assistant",
  "messageText": "Ho creato il task richiesto.",
  "toolCall": {
    "action": "create_task",
    "result": { "taskId": 87 }
  },
  "createdAt": "2026-06-11T10:00:00Z"
}
```

---

## 10. UX rules obbligatorie

- Ogni pagina dati deve avere stato `loading`, `empty`, `error`.
- Le azioni distruttive richiedono `ConfirmModal`.
- I filtri devono essere persistenti almeno nello stato della pagina.
- I badge stato devono essere coerenti in tutta l'app.
- La data va mostrata in formato leggibile locale.
- Le risposte AI devono essere distinguibili visivamente dalle azioni manuali dell'utente.
- Il chatbot deve poter rimanere aperto durante la navigazione interna.

---

## 11. CSS Modules — regole di progetto

### Organizzazione
- un file `.module.css` per ogni componente rilevante;
- classi locali e semanticamente chiare;
- variabili globali in `styles/variables.css`;
- reset e tipografia base in `styles/globals.css`.

### Nomenclatura classi
Preferire classi come:
- `container`
- `header`
- `content`
- `actions`
- `card`
- `badge`
- `sidebar`
- `messageAssistant`
- `messageUser`

### Regole visive
- UI business premium, non consumer playful
- spaziatura consistente 8/12/16/24/32
- forte leggibilità tabellare
- colori di stato accessibili
- contrasto elevato per ambienti enterprise

---

## 12. Piano pagina per pagina

### `DashboardPage`
Contenuti:
- KPI cards
- gare in scadenza
- task assegnati
- attività recenti
- eventuali suggerimenti AI

API:
- `GET /api/tenders/dashboard`
- `GET /api/tasks?...assignedTo=me`

### `TendersListPage`
Contenuti:
- tabella gare
- filtri stato, tipo, scadenza
- ricerca full-text base
- CTA nuova gara per manager

API:
- `GET /api/tenders`
- `POST /api/tenders`

### `TenderDetailPage`
Tab previste:
- overview
- checklist
- documenti
- task
- AI insights
- timeline/audit sintetico

API:
- `GET /api/tenders/:id`
- `GET /api/tenders/:id/requirements`
- `GET /api/tenders/:id/documents`
- `GET /api/tenders/:id/tasks`

### `BandiBrowserPage`
Contenuti:
- lista bandi trovati
- score rilevanza
- stato new/saved/dismissed
- conversione in gara

API:
- `GET /api/scraping/tenders`
- `PATCH /api/scraping/tenders/:id/status`
- `POST /api/scraping/tenders/:id/convert`

### `ChatbotDrawer`
Contenuti:
- lista sessioni
- thread messaggi
- input composer
- card con risultato azione
- reminder e notifiche conversazionali

API:
- `GET /api/chat/sessions`
- `POST /api/chat/sessions`
- `GET /api/chat/sessions/:id/messages`
- `POST /api/chat/sessions/:id/messages`

---

## 13. Mock development strategy

Finché il back-end non espone una route stabile:

- usare MSW per mockare endpoint e payload;
- replicare già il formato standard `success/data/meta`;
- usare fixture condivise in `src/mocks/fixtures/`;
- mantenere i nomi dei campi identici a OpenAPI.

Questo permette sviluppo parallelo senza blocchi.

---

## 14. Test minimi front-end

### Da coprire
- login/logout
- protezione route private
- render lista gare
- cambio filtri
- apertura dettaglio gara
- upload documento con feedback UI
- cambio stato task
- invio messaggio chatbot
- rendering result action chatbot

### Tipi di test
- unit test per componenti base critici
- integration test per pagine principali
- smoke test navigazione

---

## 15. Deliverable finali front-end

Al completamento, il front-end deve consegnare:

- area pubblica completa;
- app privata tenant completa;
- area admin globale;
- integrazione API reale;
- CSS Modules coerenti e modulari;
- gestione chatbot integrata;
- UX robusta con loading/error/empty state;
- mock di sviluppo mantenibili;
- README front-end con istruzioni avvio.

---

## 16. Definition of Done front-end

Una feature front-end è completata solo se:

- usa route e payload conformi all'API spec;
- ha stato loading, error ed empty se necessario;
- rispetta i ruoli e nasconde le azioni non consentite;
- usa CSS Modules coerenti;
- funziona con dati reali o mock equivalenti;
- è testata sul caso principale;
- non introduce naming fuori standard rispetto ai documenti condivisi.
