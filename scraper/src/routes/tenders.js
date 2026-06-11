import { Router } from 'express'
import * as queries from '../db/queries.js'

const router = Router()

router.get('/', (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      source_type: req.query.source_type,
      search: req.query.search,
      min_score: req.query.min_score,
      category: req.query.category,
      limit: req.query.limit || 100,
    }
    const tenders = queries.getScrapedTenders(filters)
    res.json({ success: true, data: tenders })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

router.get('/stats', (_req, res) => {
  try {
    const stats = queries.getScrapedTendersStats()
    res.json({ success: true, data: stats })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

router.get('/:id', (req, res) => {
  try {
    const tender = queries.getScrapedTenderById(Number(req.params.id))
    if (!tender) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bando non trovato' } })
    res.json({ success: true, data: tender })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body
    const valid = ['new', 'saved', 'dismissed']
    if (!status || !valid.includes(status)) {
      return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: `status deve essere: ${valid.join(', ')}` } })
    }
    queries.updateScrapedTenderStatus(Number(req.params.id), status)
    const tender = queries.getScrapedTenderById(Number(req.params.id))
    res.json({ success: true, data: tender })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

router.delete('/:id', (req, res) => {
  try {
    queries.deleteScrapedTender(Number(req.params.id))
    res.json({ success: true, data: { message: 'Bando eliminato' } })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

export default router