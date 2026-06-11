import { Router } from 'express'
import * as queries from '../db/queries.js'

const router = Router()

router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const jobs = queries.getJobs(limit)
    res.json({ success: true, data: jobs })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

router.get('/:sourceId', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const jobs = queries.getJobsBySourceId(Number(req.params.sourceId), limit)
    res.json({ success: true, data: jobs })
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  }
})

export default router