import { getDb } from './database.js'
import * as queries from './queries.js'

export function seedDefaultSources() {
  const defaults = [
    {
      name: 'Consip — Bandi e Gare (Open Data)',
      source_type: 'consip',
      base_url: 'https://dati.consip.it/download/dataset',
      config_json: {
        years: [2026, 2025],
        keywords: ['software', 'informatica', 'piattaforma digitale', 'cloud', 'servizi IT', 'app', 'web', 'data center', 'cybersecurity'],
      },
      is_active: 1,
    },
    {
      name: 'Dati.gov.it — Bandi Regionali',
      source_type: 'datigovit',
      base_url: 'https://dati.gov.it/opendata/api',
      config_json: {
        queries: ['bandi gara software', 'appalti informatica', 'contratti digitali'],
      },
      is_active: 0,
    },
    {
      name: 'Gazzetta Ufficiale (HTML)',
      source_type: 'gazzetta',
      base_url: 'https://www.gazzettaufficiale.it',
      config_json: {
        keywords: ['appalto', 'gara', 'fornitura', 'servizio informatico'],
        maxPages: 2,
      },
      is_active: 0,
    },
    {
      name: 'TED — Tenders Electronic Daily (EU)',
      source_type: 'ted',
      base_url: 'https://ted.europa.eu',
      config_json: {
        cpvCodes: ['48000000', '72000000', '72200000', '72300000', '30200000'],
        maxPages: 3,
      },
      is_active: 0,
    },
  ]

  for (const source of defaults) {
    queries.upsertSource(source)
  }
  console.log(`Default sources seeded: ${defaults.length} sources`)
}

export function seedDemoTenders() {
  const demoTenders = [
    {
      source_id: 1,
      external_id: 'consip-AQ2026-SOFTWARE-001',
      title: 'AQ SOFTWARE PER GESTIONE DEL CICLO DI VITA DEGLI APPALTI — Fornitura piattaforma procurement',
      issuer: 'Consip S.p.A.',
      summary: 'Strumento: Convenzione. Procedura: aperta. Categoria: Informatica, servizi IT e digitali. Criterio: offerta economicamente più vantaggiosa.',
      source_url: 'https://www.acquistinretepa.it/',
      publication_date: '2026-03-15',
      deadline_at: '2026-09-30T23:59:00',
      estimated_value: 2500000,
      category: 'Informatica',
      region: 'Italia',
      ai_relevance_score: 96,
      ai_tags_json: ['Software', 'Piattaforma', 'Procurement', 'Digitale', 'Cloud'],
      ai_summary: 'Eccellente opportunità per aziende specializzate in piattaforme di procurement digitale. Importo molto alto (€2.5M), procedura aperta, criterio economicamente più vantaggioso. Altamente rilevante per il settore IT.',
      ai_analysis_json: { goNogo: 'go', reasoning: 'Alta rilevanza IT, valore molto alto, procedura aperta', keyRisks: ['Concorrenza elevata', 'Requisiti possibili ISO 27001'], opportunities: ['Primo contratto con Consip', 'Referenza nazionale'] },
    },
    {
      source_id: 1,
      external_id: 'consip-AQ2026-CLOUD-002',
      title: 'AQ SERVIZI CLOUD — Infrastruttura IaaS/PaaS per Pubbliche Amministrazioni',
      issuer: 'Consip S.p.A.',
      summary: 'Strumento: Accordo Quadro. Procedura: aperta. Categoria: Informatica, servizi IT e digitali. Base asta €45.000.000.',
      source_url: 'https://www.acquistinretepa.it/',
      publication_date: '2026-02-20',
      deadline_at: '2026-12-31T23:59:00',
      estimated_value: 45000000,
      category: 'Cloud',
      region: 'Italia',
      ai_relevance_score: 98,
      ai_tags_json: ['Cloud', 'IaaS', 'PaaS', 'Infrastruttura', 'PA'],
      ai_summary: 'Gara strategica per servizi cloud destinata a tutte le PA. Importo colossale (€45M). Perfetta per provider cloud con certificazioni SOX/ISO.',
      ai_analysis_json: { goNogo: 'go', reasoning: 'Massima rilevanza, valore altissimo, settore cloud in crescita', keyRisks: ['Requisiti SOX/ISO 27001 stringenti', 'Durata pluriennale'], opportunities: ['Contratto quadro nazionale', 'Mercato cloud PA in forte crescita'] },
    },
    {
      source_id: 1,
      external_id: 'consip-C2026-SICUREZZA-003',
      title: 'C2026 CYBERSECURITY — Servizi di cybersecurity e SOC per Amministrazioni Centrali',
      issuer: 'Consip S.p.A.',
      summary: 'Convenzione per servizi di cybersecurity, SOC, vulnerability assessment e incident response. Categoria: Informatica e sicurezza.',
      source_url: 'https://www.acquistinretepa.it/',
      publication_date: '2026-04-10',
      deadline_at: '2026-08-15T23:59:00',
      estimated_value: 8500000,
      category: 'Sicurezza',
      region: 'Italia',
      ai_relevance_score: 89,
      ai_tags_json: ['Cybersecurity', 'SOC', 'Sicurezza', 'Vulnerability'],
      ai_summary: 'Gara per servizi di cybersecurity. Rilevante per aziende con competenze SOC e penetration testing.',
      ai_analysis_json: { goNogo: 'go', reasoning: 'Settore cybersecurity in forte crescita, rilevanza IT diretta', keyRisks: ['Competenze specializzate richieste', 'Certificazioni security'], opportunities: ['Mercato cybersecurity PA in espansione'] },
    },
    {
      source_id: 1,
      external_id: 'consip-C2026-ICT-004',
      title: 'C2026 MANUTENZIONE SOFTWARE — Servizi di manutenzione evolutiva e correttiva',
      issuer: 'Consip S.p.A.',
      summary: 'Convenzione per servizi di manutenzione software, assistenza tecnica e sviluppo applicazioni personalizzate. Categoria: Informatica.',
      source_url: 'https://www.acquistinretepa.it/',
      publication_date: '2026-05-05',
      deadline_at: '2026-11-30T23:59:00',
      estimated_value: 1200000,
      category: 'Informatica',
      region: 'Italia',
      ai_relevance_score: 82,
      ai_tags_json: ['Manutenzione', 'Software', 'Sviluppo', 'Applicazioni'],
      ai_summary: 'Gara per servizi di manutenzione e sviluppo software. Buona opportunità per software house e system integrator.',
      ai_analysis_json: { goNogo: 'go', reasoning: 'Rilevanza IT alta, valore medio, buon punto di ingresso', keyRisks: ['Concorrenza da grandi system integrator'], opportunities: ['Contratti ricorrenti', 'Possibile espansione'] },
    },
    {
      source_id: 1,
      external_id: 'consip-C2026-MOBILITA-005',
      title: 'AQ AUTOBUS A METANO — Autobus urbani ed extraurbani alimentazione CNG/LNG',
      issuer: 'Consip S.p.A.',
      summary: 'Strumento: Accordo Quadro. Procedura: aperta. Categoria: Veicoli, mobilità e trasporti.',
      source_url: 'https://www.acquistinretepa.it/',
      publication_date: '2026-03-23',
      deadline_at: '2026-07-26T23:59:00',
      estimated_value: 21181100,
      category: 'Trasporti',
      region: 'Italia',
      ai_relevance_score: 12,
      ai_tags_json: ['Trasporti', 'Veicoli', 'Autobus'],
      ai_summary: 'Gara per autobus. Nessuna rilevanza per aziende IT. Ignorare.',
      ai_analysis_json: { goNogo: 'nogo', reasoning: 'Settore automotive, nessuna rilevanza IT', keyRisks: ['Fuori dal core business'], opportunities: [] },
    },
    {
      source_id: 1,
      external_id: 'consip-AQ2026-APPAR-DIAG-006',
      title: 'AQ APPARECCHIATURE DI DIAGNOSTICA PER IMMAGINI — Tomografi RM 3 Tesla',
      issuer: 'Consip S.p.A.',
      summary: 'Accordo quadro per apparecchiature diagnostica per immagini ad alta fascia. Categoria: Sanità, ricerca e welfare.',
      source_url: 'https://www.acquistinretepa.it/',
      publication_date: '2026-10-23',
      deadline_at: '2026-09-17T23:59:00',
      estimated_value: 142312500,
      category: 'Sanita',
      region: 'Italia',
      ai_relevance_score: 8,
      ai_tags_json: ['Sanità', 'Diagnostica', 'Equipaggiamento'],
      ai_summary: 'Gara per apparecchiature di diagnostica medica. Non rilevante per IT.',
      ai_analysis_json: { goNogo: 'nogo', reasoning: 'Settore sanità-equipaggiamento, nessuna rilevanza IT', keyRisks: ['Completamente fuori scope'], opportunities: [] },
    },
    {
      source_id: 1,
      external_id: 'consip-C2026-DIGITALE-007',
      title: 'AQ PIATTAFORMA DIGITALE PER LA GESTIONE DEI PROCESSI ACQUISITIVI',
      issuer: 'Consip S.p.A.',
      summary: 'Accordo quadro per fornitura di piattaforma digitale integrata per la gestione dei processi acquisitivi delle Pubbliche Amministrazioni. Categoria: Informatica, servizi IT e digitali.',
      source_url: 'https://www.acquistinretepa.it/',
      publication_date: '2026-06-01',
      deadline_at: '2026-12-15T23:59:00',
      estimated_value: 3800000,
      category: 'Informatica',
      region: 'Italia',
      ai_relevance_score: 95,
      ai_tags_json: ['Piattaforma', 'Digitale', 'Procurement', 'PA', 'SaaS'],
      ai_summary: 'Gara perfettamente allineata con il core business di Opterra. Piattaforma digitale per gestione processi acquisitivi PA. Valore significativo.',
      ai_analysis_json: { goNogo: 'go', reasoning: 'Core business match, piattaforma procurement digitale per PA, valore rilevante', keyRisks: ['Concorrenza da grandi player', 'Requisiti eDGUE e compliance PA'], opportunities: ['Contratto strategico', 'Possibile preview di Opterra sul mercato PA'] },
    },
  ]

  for (const tender of demoTenders) {
    try {
      queries.insertScrapedTender(tender)
    } catch { /* already exists */ }
  }
  console.log(`Demo tenders seeded: ${demoTenders.length} tenders`)
}

if (process.argv[1] && process.argv[1].includes('seed.js')) {
  const { runMigrations } = await import('./migrate.js')
  runMigrations()
  seedDefaultSources()
  seedDemoTenders()
  console.log('Seeding completed.')
  process.exit(0)
}