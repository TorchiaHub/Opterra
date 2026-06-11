import * as service from './audit.service.js'

async function getLogs(req, res, next) {
  try {
    const filters = {
      action: req.query.action,
      entityType: req.query.entityType,
      from: req.query.from,
      to: req.query.to,
    }
    const pagination = {
      page: req.query.page,
      pageSize: req.query.pageSize,
    }
    const result = await service.getLogs(req.tenantId, filters, pagination)
    res.json({ success: true, data: result.data, meta: result.meta })
  } catch (err) { next(err) }
}

async function exportLogs(req, res, next) {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
    }
    const rows = await service.getExport(req.tenantId, filters)

    const header = 'Data,Azione,Tipo,ID Entità,Utente\n'
    const csv = rows.map(r =>
      `"${r.created_at}","${r.action}","${r.entity_type}","${r.entity_id}","${r.user_name}"`
    ).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"')
    res.send('\uFEFF' + header + csv)
  } catch (err) { next(err) }
}

export { getLogs, exportLogs }
