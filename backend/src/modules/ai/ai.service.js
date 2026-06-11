import * as queries from './ai.queries.js'
import { log as auditLog } from '../audit/audit.service.js'
import logger from '../../config/logger.js'

const AI_DISABLED_MESSAGE = 'AI non configurato. Imposta OPENAI_API_KEY per abilitare.'

function getModelName() {
  return 'openai'
}

async function checkAiLimit(tenantId) {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const usage = await queries.getMonthlyAiUsage(tenantId, yearMonth)
  const maxRequests = 500
  if (usage.count >= maxRequests) {
    throw Object.assign(new Error('Limite richieste AI mensile superato.'), {
      statusCode: 429, code: 'AI_RATE_LIMIT',
    })
  }
}

async function callAi(payload, userId, tenantId, req) {
  await checkAiLimit(tenantId)

  let result
  try {
    result = await executeAiAction(payload)
    await queries.logAiRequest({
      tenantId, userId,
      tenderId: payload.tenderId,
      requestType: payload.requestType,
      modelName: getModelName(),
      promptTokens: result.promptTokens || 0,
      completionTokens: result.completionTokens || 0,
      status: 'success',
    })
    auditLog(`ai.${payload.requestType}`, 'ai_request', null, userId, tenantId, null, req)
    return result.data
  } catch (err) {
    await queries.logAiRequest({
      tenantId, userId,
      tenderId: payload.tenderId,
      requestType: payload.requestType,
      modelName: getModelName(),
      promptTokens: 0,
      completionTokens: 0,
      status: 'failed',
      errorMessage: err.message,
    })
    throw err
  }
}

async function executeAiAction(payload) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return mockAiResponse(payload)
  }

  const systemPrompts = {
    'extract-requirements': 'Estrai i requisiti dal seguente bando di gara. Restituisci un array JSON con label, description, itemType e priority.',
    summary: 'Fai un riassunto strutturato del seguente bando di gara in markdown.',
    'compliance-check': 'Analizza la conformità della checklist rispetto ai documenti caricati. Identifica gap e rischi.',
    'go-nogo': 'Valuta la convenienza di partecipare alla gara. Assegna uno score 0-100 e raccomanda go/no_go con motivazioni.',
    qa: 'Rispondi alla domanda basandoti sul contesto della gara.',
    draft: 'Genera una bozza di risposta per la sezione richiesta basandoti sui documenti della gara.',
  }

  const prompt = systemPrompts[payload.requestType] || 'Rispondi alla richiesta.'
  const userMessage = payload.text || ''

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 2000,
      }),
    })

    const json = await response.json()
    return {
      data: json.choices?.[0]?.message?.content || 'Nessuna risposta.',
      promptTokens: json.usage?.prompt_tokens || 0,
      completionTokens: json.usage?.completion_tokens || 0,
    }
  } catch (err) {
    logger.error('OpenAI API call failed', { error: err.message })
    return mockAiResponse(payload)
  }
}

function mockAiResponse(payload) {
  const mocks = {
    'extract-requirements': JSON.stringify([
      { label: 'DGUE', description: 'Documento di gara unico europeo', itemType: 'document', priority: 'mandatory' },
      { label: 'Cauzione provvisoria', description: '2% del valore appalto', itemType: 'document', priority: 'mandatory' },
      { label: 'Certificazione SOA', description: 'Categoria prevalente', itemType: 'certification', priority: 'mandatory' },
      { label: 'Bilancio approvato', description: 'Ultimo triennio', itemType: 'document', priority: 'mandatory' },
    ]),
    summary: '## Riassunto Bando\n\n### Oggetto\nContratto per fornitura beni/servizi.\n\n### Scadenza\n' + new Date().toISOString() + '\n\n### Importo\nDa definire\n\n### Requisiti\nVedi checklist.',
    'compliance-check': '## Compliance Check\n\n### Status: ⚠️ Parziale\n\n✅ Documentazione amministrativa presente\n❌ Certificazione SOA mancante\n⚠️ Cauzione provvisoria da verificare',
    'go-nogo': '{\n  "score": 72,\n  "decision": "go",\n  "summary": "Gara con alto potenziale. Valore interessante e requisiti allineati."\n}',
    qa: 'Basandomi sui documenti disponibili, il bando richiede la documentazione standard prevista dal D.Lgs 50/2016. Per questa gara è necessaria anche la certificazione SOA categoria OG1.',
    draft: '## Bozza Risposta\n\nIn riferimento alla gara in oggetto, la scrivente società dichiara di possedere i requisiti richiesti...',
  }

  return {
    data: mocks[payload.requestType] || 'AI non configurata. Attiva OpenAI per risultati reali.',
    promptTokens: 0,
    completionTokens: 0,
  }
}

async function extractRequirements(payload, userId, tenantId, req) {
  return callAi({ ...payload, requestType: 'extract-requirements' }, userId, tenantId, req)
}

async function summary(payload, userId, tenantId, req) {
  return callAi({ ...payload, requestType: 'summary' }, userId, tenantId, req)
}

async function complianceCheck(payload, userId, tenantId, req) {
  return callAi({ ...payload, requestType: 'compliance-check' }, userId, tenantId, req)
}

async function goNogo(payload, userId, tenantId, req) {
  return callAi({ ...payload, requestType: 'go-nogo' }, userId, tenantId, req)
}

async function qa(payload, userId, tenantId, req) {
  return callAi({ ...payload, requestType: 'qa' }, userId, tenantId, req)
}

async function draft(payload, userId, tenantId, req) {
  return callAi({ ...payload, requestType: 'draft' }, userId, tenantId, req)
}

export { extractRequirements, summary, complianceCheck, goNogo, qa, draft, mockAiResponse, checkAiLimit }
