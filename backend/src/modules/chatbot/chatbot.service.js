import * as queries from './chatbot.queries.js'
import * as aiService from '../ai/ai.service.js'
import { log as auditLog } from '../audit/audit.service.js'
import logger from '../../config/logger.js'

async function listSessions(userId, tenantId) {
  return queries.getChatSessions(userId, tenantId)
}

async function createSession(payload, userId, tenantId) {
  const sessionId = await queries.createChatSession({
    tenantId,
    userId,
    title: payload.title || 'Nuova chat',
    contextType: payload.contextType || 'general',
    contextId: payload.contextId || null,
  })

  await queries.insertChatMessage({
    tenantId,
    sessionId,
    senderType: 'system',
    messageText: 'Chat avviata. Come posso aiutarti?',
  })

  logger.info('Chat session created', { sessionId, userId, tenantId })
  return queries.getChatSessions(userId, tenantId)
}

async function getMessages(sessionId, userId, tenantId) {
  const session = await queries.getSessionById(sessionId, tenantId)
  if (!session) {
    throw Object.assign(new Error('Sessione non trovata.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }
  if (session.user_id !== userId) {
    throw Object.assign(new Error('Accesso negato a questa sessione.'), {
      statusCode: 403, code: 'FORBIDDEN',
    })
  }
  return queries.getMessagesBySession(sessionId, tenantId)
}

async function sendMessage(sessionId, text, userId, tenantId, req) {
  const session = await queries.getSessionById(sessionId, tenantId)
  if (!session) {
    throw Object.assign(new Error('Sessione non trovata.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }
  if (session.user_id !== userId) {
    throw Object.assign(new Error('Accesso negato a questa sessione.'), {
      statusCode: 403, code: 'FORBIDDEN',
    })
  }

  await queries.insertChatMessage({
    tenantId, sessionId,
    senderType: 'user',
    messageText: text,
  })

  const toolCall = await processUserIntent(text, userId, tenantId, req)

  const response = toolCall
    ? await executeToolCall(toolCall, userId, tenantId, req)
    : await generateAiResponse(text, session, tenantId)

  await queries.insertChatMessage({
    tenantId, sessionId,
    senderType: 'assistant',
    messageText: response.text,
    toolCallJson: response.toolCall,
  })

  await queries.updateSessionTimestamp(sessionId)
  auditLog('chat.message_sent', 'chat_session', sessionId, userId, tenantId,
    { intent: toolCall?.action || 'general_qa' }, req)

  return { messages: await queries.getMessagesBySession(sessionId, tenantId) }
}

function processUserIntent(text) {
  const lower = text.toLowerCase()

  if (lower.includes('crea') && (lower.includes('gara') || lower.includes('tender'))) return { action: 'create_tender' }
  if (lower.includes('stato') && lower.includes('gara')) return { action: 'update_tender_status' }
  if (lower.includes('scadenz') || lower.includes('deadline')) return { action: 'list_deadlines' }
  if (lower.includes('task') && (lower.includes('crea') || lower.includes('aggiungi'))) return { action: 'create_task' }
  if (lower.includes('assegna') || lower.includes('assign')) return { action: 'assign_task' }
  if (lower.includes('requisito') || lower.includes('checklist')) return { action: 'add_requirement' }
  if (lower.includes('estra') && lower.includes('requisito')) return { action: 'run_requirement_extraction' }
  if (lower.includes('compliance') || lower.includes('conformit')) return { action: 'run_compliance_check' }
  if (lower.includes('bandi') || lower.includes('scraping')) return { action: 'list_scraped_tenders' }
  if (lower.includes('salva') && lower.includes('bando')) return { action: 'save_scraped_tender' }
  if (lower.includes('promemoria') || lower.includes('ricorda')) return { action: 'create_reminder' }

  return null
}

async function executeToolCall(toolCall, userId, tenantId, req) {
  const messages = {
    'create_tender': 'Per creare una nuova gara, vai su Gare > Nuova Gara. Qui puoi inserire titolo, ente, scadenza e valore.',
    'update_tender_status': 'Puoi aggiornare lo stato di una gara dalla pagina Dettaglio Gara > Cambia Stato.',
    'list_deadlines': 'Ecco le tue scadenze imminenti. Controlla la Dashboard per una vista completa.',
    'create_task': 'Crea un nuovo task dalla sezione Task della gara. Specifica titolo, priorità e assegnatario.',
    'assign_task': 'Assegna un task esistente modificando il campo Assegnatario nel Dettaglio Task.',
    'add_requirement': 'Aggiungi un requisito alla checklist dalla sezione Requisiti della gara.',
    'run_requirement_extraction': 'Usa AI > Estrai Requisiti per analizzare automaticamente un bando.',
    'run_compliance_check': 'Usa AI > Compliance Check per verificare la conformità dei documenti.',
    'list_scraped_tenders': 'I bandi trovati sono nella sezione Bandi. Usa i filtri per cercare.',
    'save_scraped_tender': 'Salva un bando come gara cliccando "Converti in Gara" dal Dettaglio Bando.',
    'create_reminder': 'Imposta un promemoria specificando data e descrizione.',
  }

  return {
    text: messages[toolCall.action] || 'Non ho riconosciuto l\'azione richiesta.',
    toolCall: { action: toolCall.action },
  }
}

async function generateAiResponse(text, session, tenantId) {
  const context = session.context_type === 'tender' && session.context_id
    ? ` (contesto: gara #${session.context_id})`
    : ''

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey === 'sk-placeholder') {
    return {
      text: `AI chat non configurata. Imposta OPENROUTER_API_KEY nel file .env${context}`,
      toolCall: null,
    }
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://tenderflow.app',
        'X-Title': 'TenderFlow',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openrouter/free',
        messages: [
          { role: 'system', content: 'Sei un assistente specializzato in gare d\'appalto pubbliche italiane. Rispondi in modo conciso e professionale in italiano.' },
          { role: 'user', content: text },
        ],
        max_tokens: 1000,
      }),
    })

    const json = await response.json()
    const content = json.choices?.[0]?.message?.content || 'Nessuna risposta disponibile.'
    return { text: `${content}${context}`, toolCall: null }
  } catch (err) {
    logger.error('OpenRouter API call failed', { error: err.message })
    return {
      text: `AI chat non configurata. Imposta OPENROUTER_API_KEY nel file .env${context}`,
      toolCall: null,
    }
  }
}

export { listSessions, createSession, getMessages, sendMessage }
