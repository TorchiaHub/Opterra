# Opterra — Credenziali di Accesso

## Superadmin (piattaforma)
| Campo | Valore |
|-------|--------|
| Email | `admin@tenderflow.app` |
| Password | `password123` |
| Ruolo | Superadmin |
| Accesso | http://localhost:5173/login |

## Utenti Demo (tenant: Acme Corp)
| Email | Password | Ruolo |
|-------|----------|-------|
| `test@acme.it` | `password123` | Manager |
| `laura.bianchi@acme.it` | `password123` | User |
| `mario.verdi@acme.it` | `password123` | User |

## Utenti Demo (tenant: Beta Srl)
| Email | Password | Ruolo |
|-------|----------|-------|
| `admin@beta.it` | `password123` | Manager |
| `anna.neri@beta.it` | `password123` | User |

## API
| Servizio | URL |
|----------|-----|
| Backend API | `http://localhost:3000/api` |
| Frontend | `http://localhost:5173` |
| MySQL | `localhost:3307` |

## OpenRouter (AI Chat)
Il sistema usa OpenRouter con modelli free. Configurare `OPENROUTER_API_KEY` in `.env` per abilitare le risposte AI reali.
