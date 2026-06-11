import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import os from 'os'
import * as controller from './documents.controller.js'
import verifyToken from '../../middleware/auth.middleware.js'
import resolveTenant from '../../middleware/tenant.middleware.js'
import { requireRole } from '../../middleware/rbac.middleware.js'

const upload = multer({
  dest: path.join(os.tmpdir(), 'tenderflow-uploads'),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip', 'image/png', 'image/jpeg',
      'text/plain', 'text/csv',
    ]
    cb(null, allowed.includes(file.mimetype))
  },
})

const router = Router()

router.use(verifyToken, resolveTenant)

router.get('/:id/documents', controller.listDocuments)
router.post('/:id/documents', upload.single('file'), controller.uploadDocument)
router.post('/:id/documents/:docId/versions', requireRole('user'), upload.single('file'), controller.addVersion)
router.get('/documents/:docId/download', controller.downloadDocument)
router.get('/documents/:docId/versions', controller.getVersions)
router.delete('/documents/:docId', requireRole('manager'), controller.deleteDocument)

export default router
