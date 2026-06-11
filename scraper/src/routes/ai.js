import { Router } from 'express'
import { analyzeTender, extractRequirementsFromText } from '../services/ai.service.js'

const router = Router()

router.post('/analyze', async (req, res) => {
  try {
    const { title, description, estimated_value, category } = req.body
    if (!title) {
      return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'title obbligatorio' } })
    }
    const analysis = await analyzeTender(title, description || '', estimated_value, category)
    res.json({ success: true, data: analysis })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

router.post('/extract-requirements', async (req, res) => {
  try {
    const { text } = req.body
    if (!text) {
      return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'text obbligatorio' } })
    }
    const requirements = await extractRequirementsFromText(text)
    res.json({ success: true, data: requirements })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

router.post('/analyze/:tenderId', async (req, res) => {
  try {
    const { getScrapedTenderById } = await import('../db/queries.js')
    const tender = getScrapedTenderById(Number(req.params.tenderId))
    if (!tender) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bando non trovato' } })
    }
    const analysis = await analyzeTender(tender.title, tender.summary || '', tender.estimated_value, tender.category)
    res.json({ success: true, data: analysis })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

export default router