import { Router } from 'express'
import * as queries from '../db/queries.js'
import { runSource, runAllActive } from '../scrapers/orchestrator.js'

const router = Router()

router.get('/sources', (_req, res) => {
  try {
    const sources = queries.getSources()
    res.json({ success: true, data: sources })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

router.get('/sources/:id', (req, res) => {
  try {
    const source = queries.getSourceById(Number(req.params.id))
    if (!source) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sorgente non trovata' } })
    res.json({ success: true, data: source })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

router.post('/sources', (req, res) => {
  try {
    const { name, source_type, base_url, config_json, is_active } = req.body
    if (!name || !source_type || !base_url) {
      return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'name, source_type e base_url obbligatori' } })
    }
    const validTypes = ['consip', 'datigovit', 'mepa', 'gazzetta', 'ted', 'custom']
    if (!validTypes.includes(source_type)) {
      return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: `source_type deve essere: ${validTypes.join(', ')}` } })
    }
    const id = queries.upsertSource({ name, source_type, base_url, config_json, is_active: is_active !== false })
    const source = queries.getSourceById(id)
    res.status(201).json({ success: true, data: source })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

router.delete('/sources/:id', (req, res) => {
  try {
    const result = queries.deleteSource(Number(req.params.id))
    if (result.changes === 0) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sorgente non trovata' } })
    res.json({ success: true, data: { message: 'Sorgente rimossa' } })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

router.post('/sources/:id/run', async (req, res) => {
  try {
    const source = queries.getSourceById(Number(req.params.id))
    if (!source) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sorgente non trovata' } })
    const result = await runSource(source.id)
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

router.post('/run-all', async (_req, res) => {
  try {
    const results = await runAllActive()
    res.json({ success: true, data: results })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

export default router