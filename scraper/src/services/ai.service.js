import { getDb } from '../db/database.js'

const AI_API_KEY = process.env.AI_API_KEY || ''
const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini'

export async function analyzeTender(title, description, estimatedValue, category) {
  if (!AI_API_KEY) {
    return mockAnalysis(title, description)
  }

  try {
    const prompt = buildAnalysisPrompt(title, description, estimatedValue, category)
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: PROMPT_SYSTEM },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })

    const json = await response.json()
    const content = json.choices?.[0]?.message?.content || ''

    try {
      return JSON.parse(content)
    } catch {
      return { relevanceScore: 50, tags: [], summary: content, goNogo: 'caution', reasoning: content }
    }
  } catch (err) {
    console.error(`[AI] Analysis failed: ${err.message}`)
    return mockAnalysis(title, description)
  }
}

export async function extractRequirementsFromText(text) {
  if (!AI_API_KEY) {
    return mockRequirements()
  }

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: 'Sei un esperto di gare d\'appalto italiane. Estrai i requisiti dal bando. Restituisci un array JSON con oggetti {label, description, priority: "mandatory"|"important"|"optional"}.' },
          { role: 'user', content: text },
        ],
        max_tokens: 1000,
        temperature: 0.2,
      }),
    })

    const json = await response.json()
    const content = json.choices?.[0]?.message?.content || '[]'
    try {
      return JSON.parse(content)
    } catch {
      return mockRequirements()
    }
  } catch {
    return mockRequirements()
  }
}

const PROMPT_SYSTEM = `Sei un analista di gare d'appalto italiano. Analizza ogni bando e restituisci SOLO JSON valido con questa struttura:
{
  "relevanceScore": <numero 0-100 che indica quanto il bando è rilevante per un'azienda IT italiana>,
  "tags": [<array di tag/category brevi>],
  "summary": "<riassunto in 2-3 frasi>",
  "goNogo": "<go|nogo|caution>",
  "reasoning": "<motivazione breve>",
  "estimatedComplexity": "<low|medium|high>",
  "keyRisks": [<array di rischi principali>],
  "opportunities": [<array di opportunità>]
}`

function buildAnalysisPrompt(title, description, estimatedValue, category) {
  let prompt = `Titolo: ${title}`
  if (description) prompt += `\nDescrizione: ${description}`
  if (estimatedValue) prompt += `\nValore stimato: €${estimatedValue.toLocaleString('it-IT')}`
  if (category) prompt += `\nCategoria: ${category}`
  prompt += '\n\nAnalizza questo bando per rilevanza per un\'azienda IT italiana (sviluppo software, piattaforme digitali, cloud, consulenza informatica).'
  return prompt
}

function mockAnalysis(title, description) {
  const text = `${title} ${description || ''}`.toLowerCase()
  let score = 50
  if (text.includes('software') || text.includes('digitale') || text.includes('piattaforma') || text.includes('cloud') || text.includes('informatic')) score = 75 + Math.floor(Math.random() * 20)
  else if (text.includes('fornitura') || text.includes('servizi') || text.includes('consulenz')) score = 55 + Math.floor(Math.random() * 15)
  else score = 30 + Math.floor(Math.random() * 25)

  return {
    relevanceScore: score,
    tags: extractTags(text),
    summary: `Bando rilevante per settore IT: ${title}. ${score >= 70 ? 'Opportunità interessante per aziende di sviluppo software.' : 'Valutare con attenzione la rilevanza.'}`,
    goNogo: score >= 70 ? 'go' : score >= 50 ? 'caution' : 'nogo',
    reasoning: `Score ${score}/100 analizzato automaticamente senza AI.`,
    estimatedComplexity: score >= 70 ? 'medium' : 'low',
    keyRisks: ['Analisi basata su euristiche (AI non configurata)'],
    opportunities: score >= 70 ? ['Alta rilevanza per settore IT'] : [],
  }
}

function extractTags(text) {
  const tags = []
  const tagMap = {
    'software': 'Software', 'digitale': 'Digitale', 'cloud': 'Cloud', 'piattaforma': 'Piattaforma',
    'informatic': 'IT', 'web': 'Web', 'app': 'App', 'sicurezz': 'Sicurezza', 'privacy': 'Privacy',
    'gdpr': 'GDPR', 'fornitura': 'Fornitura', 'lavori': 'Lavori', 'edilizi': 'Edilizia',
    'consulenz': 'Consulenza', 'formaz': 'Formazione', 'server': 'Server', 'hosting': 'Hosting',
    'manutenzione': 'Manutenzione', 'sanit': 'Sanita', 'scuol': 'Istruzione',
  }
  for (const [keyword, tag] of Object.entries(tagMap)) {
    if (text.includes(keyword) && !tags.includes(tag)) tags.push(tag)
    if (tags.length >= 5) break
  }
  return tags
}

function mockRequirements() {
  return [
    { label: 'DGUE', description: 'Documento di gara unico europeo', priority: 'mandatory' },
    { label: 'Cauzione provvisoria', description: '2% del valore appalto', priority: 'mandatory' },
    { label: 'Certificazione SOA', description: 'Categoria prevalente richiesta', priority: 'important' },
    { label: 'Bilancio approvato', description: 'Ultimo triennio approvato', priority: 'mandatory' },
  ]
}