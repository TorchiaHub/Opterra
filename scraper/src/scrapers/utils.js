const SCRAPER_TIMEOUT = parseInt(process.env.SCRAPER_TIMEOUT) || 30000
const SCRAPER_DELAY_MS = parseInt(process.env.SCRAPER_DELAY_MS) || 2000

export async function fetchPage(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeout || SCRAPER_TIMEOUT)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'OpterraBot/1.0 (tender discovery; +https://opterra.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.5',
        ...options.headers,
      },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`)
    }
    return await response.text()
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms || SCRAPER_DELAY_MS))
}

export function normalizeText(text) {
  if (!text) return ''
  return text.replace(/\s+/g, ' ').trim()
}

export function parseDateString(str) {
  if (!str) return null
  const normalized = str.replace(/\s+/g, ' ').trim()
  const it = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/.exec(normalized)
  if (it) {
    const [, d, m, y] = it
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  const en = /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/.exec(normalized)
  if (en) {
    const [, y, m, d] = en
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  try {
    const d = new Date(normalized)
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  } catch { /* ignore */ }
  return null
}

export function parseValue(str) {
  if (!str) return null
  const cleaned = str.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.')
  const val = parseFloat(cleaned)
  return isNaN(val) ? null : val
}

export function extractCategory(title, description) {
  const text = `${title} ${description || ''}`.toLowerCase()
  const categories = [
    { keywords: ['informatica', 'software', 'piattaforma', 'digitale', 'cloud', 'app', 'sito web', 'web', 'it', 'tecnolog'], category: 'Informatica' },
    { keywords: ['lavori', 'edilizi', 'manutenzione edifici', 'costruzione', 'rstrutturaz', 'impian'], category: 'Edilizia' },
    { keywords: ['fornitura', 'arredi', 'attrezzature', 'macchinari', 'veicol', 'hardware', 'server', 'pc', 'workstation'], category: 'Fornitura' },
    { keywords: ['servizi', 'consulenz', 'assistenza', 'formaz', 'gestione', 'manutenzione', 'monitoragg'], category: 'Servizi' },
    { keywords: ['sicurezza', 'privacy', 'gdpr', 'cyber', 'sorveglianz'], category: 'Sicurezza' },
    { keywords: ['sanit', 'medic', 'ospedal', 'farmac', 'as'], category: 'Sanita' },
    { keywords: ['scuol', 'istruz', 'educat', 'univers'], category: 'Istruzione' },
    { keywords: ['trasporti', 'mobilita', 'logistic', 'trasporto'], category: 'Trasporti' },
    { keywords: ['energia', 'illuminaz', 'elettric', 'gas', 'fotovoltai'], category: 'Energia' },
    { keywords: ['acqua', 'fognatu', 'depuraz', 'idric'], category: 'Acqua e Ambiente' },
  ]
  for (const { keywords, category } of categories) {
    if (keywords.some(k => text.includes(k))) return category
  }
  return 'Altro'
}

export function extractRegion(text) {
  if (!text) return null
  const regions = [
    'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
    'Friuli Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
    'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
    'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto',
  ]
  const lower = text.toLowerCase()
  for (const r of regions) {
    if (lower.includes(r.toLowerCase())) return r
  }
  const provinces = [
    'Milano', 'Roma', 'Napoli', 'Torino', 'Palermo', 'Bologna',
    'Firenze', 'Bari', 'Catania', 'Venezia', 'Genova', 'Perugia',
    'Siena', 'Pisa', 'Lucca', 'Prato', 'Arezzo',
  ]
  for (const p of provinces) {
    if (lower.includes(p.toLowerCase())) return p
  }
  return null
}