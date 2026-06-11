import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { SectionCard } from '../../components/cards/SectionCard'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { ErrorState } from '../../components/feedback/ErrorState'
import { Loader } from '../../components/feedback/Loader'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { SubmitButton } from '../../components/forms/SubmitButton'
import Icon from '../../components/Icon'
import {
  APP_ROUTES, TENDER_STATUS_COLORS,
} from '../../utils/constants'
import { formatCurrency } from '../../utils/format'
import { formatDate } from '../../utils/date'
import { getTenderById } from '../../api/tenders.api'
import { getTasks, createTask, updateTask, deleteTask } from '../../api/tasks.api'
import { getRequirementsByTender } from '../../api/requirements.api'
import { getDocumentsByTender } from '../../api/documents.api'
import styles from './TenderDetailPage.module.css'

function normalizeTender(row) {
  if (!row) return null
  return {
    ...row,
    referenceCode: row.reference_code || '—',
    valueAmount: row.value_amount,
    deadlineAt: row.deadline_at,
    createdAt: row.created_at,
    category: row.category || row.type || '—',
    region: row.region || '—',
    contactName: row.contact_name || '—',
    contactEmail: row.contact_email || '—',
  }
}

function normalizeTask(row) {
  if (!row) return row
  return {
    ...row,
    dueAt: row.dueAt ?? row.due_at,
    assignee: row.assignee ?? row.assigned_user_name ?? '',
  }
}

function formatBytes(bytes) {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let v = Number(bytes)
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function TenderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [tender, setTender] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [showNewTask, setShowNewTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', assignee: '', dueAt: '' })
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [requirements, setRequirements] = useState([])
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    const fetchTender = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getTenderById(id)
        setTender(normalizeTender(result))
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTender()
  }, [id])

  useEffect(() => {
    if (!id) return
    const fetchTasks = async () => {
      setTasksLoading(true)
      try {
        const result = await getTasks(id)
        setTasks(Array.isArray(result) ? result.map(normalizeTask) : [])
      } catch {
        setTasks([])
      } finally {
        setTasksLoading(false)
      }
    }
    fetchTasks()
  }, [id])

  useEffect(() => {
    if (!id) return
    getRequirementsByTender(id)
      .then(rows => setRequirements((Array.isArray(rows) ? rows : []).map(r => ({
        id: r.id,
        title: r.label || r.title || '',
        category: r.item_type || '—',
        status: r.status,
        priority: r.priority,
      }))))
      .catch(() => setRequirements([]))
    getDocumentsByTender(id)
      .then(rows => setDocuments((Array.isArray(rows) ? rows : []).map(d => ({
        id: d.id,
        name: d.title || d.original_filename || '—',
        size: formatBytes(d.size_bytes),
        uploadedBy: d.uploaded_by_name || '—',
        uploadedAt: d.created_at,
      }))))
      .catch(() => setDocuments([]))
  }, [id])

  async function handleCreateTask() {
    if (!newTask.title.trim()) return
    try {
      const created = await createTask(id, {
        title: newTask.title.trim(),
        priority: newTask.priority,
        assignee: newTask.assignee.trim() || undefined,
        dueAt: newTask.dueAt || undefined,
        status: 'todo',
      })
      setTasks(prev => [...prev, normalizeTask(created)])
      setNewTask({ title: '', priority: 'medium', assignee: '', dueAt: '' })
      setShowNewTask(false)
    } catch {
      // silently fail
    }
  }

  async function handleUpdateTask(taskId, payload) {
    try {
      const updated = await updateTask(id, taskId, payload)
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...normalizeTask(updated) } : t))
    } catch {
      // silently fail
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      await deleteTask(id, taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setConfirmDeleteId(null)
    } catch {
      // silently fail
    }
  }

  function handleToggleStatus(task) {
    const next = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo'
    handleUpdateTask(task.id, { status: next })
  }

  function handleStartEdit(task) {
    setEditingId(task.id)
    setEditingTitle(task.title)
  }

  function handleSaveEdit(taskId) {
    if (editingTitle.trim() && editingTitle !== tasks.find(t => t.id === taskId)?.title) {
      handleUpdateTask(taskId, { title: editingTitle.trim() })
    }
    setEditingId(null)
    setEditingTitle('')
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditingTitle('')
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <ErrorState
          title={t('private.tenderDetail.errorTitle')}
          message={t('private.tenderDetail.errorMessage')}
          onRetry={() => {
            setLoading(true)
            setError(null)
            getTenderById(id)
              .then(setTender)
              .catch(setError)
              .finally(() => setLoading(false))
          }}
        />
      </div>
    )
  }

  if (!tender) {
    return (
      <div className={styles.page}>
        <EmptyState
          icon="inbox"
          title={t('private.tenderDetail.notFoundTitle')}
          message={t('private.tenderDetail.notFoundMessage')}
        />
      </div>
    )
  }

  const TABS = [
    { label: t('private.tenderDetail.tabs.overview'), icon: 'layout' },
    { label: t('private.tenderDetail.tabs.requirements'), icon: 'checkCircle' },
    { label: t('private.tenderDetail.tabs.documents'), icon: 'file' },
    { label: t('private.tenderDetail.tabs.tasks'), icon: 'check' },
    { label: t('private.tenderDetail.tabs.ai'), icon: 'robot' },
  ]

  const priorityConfig = {
    high: { label: t('private.tenderDetail.priority.high'), color: 'danger' },
    medium: { label: t('private.tenderDetail.priority.medium'), color: 'warning' },
    low: { label: t('private.tenderDetail.priority.low'), color: 'info' },
  }

  const aiTypeConfig = {
    opportunity: { icon: 'star', color: 'success', label: t('private.tenderDetail.aiTypes.opportunity') },
    risk: { icon: 'alert', color: 'danger', label: t('private.tenderDetail.aiTypes.risk') },
    suggestion: { icon: 'sparkles', color: 'info', label: t('private.tenderDetail.aiTypes.suggestion') },
  }

  const aiInsights = tender.aiInsights ?? []

  const completedReqs = requirements.filter(r => r.status === 'completed').length
  const totalReqs = requirements.length
  const remaining = totalReqs - completedReqs
  const progress = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: t('components.breadcrumbs.workspace'), to: APP_ROUTES.DASHBOARD },
        { label: t('nav.tenders'), to: APP_ROUTES.TENDERS },
        { label: tender.title },
      ]} />
      <PageHeader
        title={tender.title}
        subtitle={tender.issuer}
        actions={
          <div className={styles.headerActions}>
            <StatusBadge
              label={t(`status.${tender.status}`)}
              variant={TENDER_STATUS_COLORS[tender.status]}
            />
            <button className={styles.iconBtn} onClick={() => {}} title={t('private.tenderDetail.editButton')}>
              <Icon name="edit" size={18} />
            </button>
          </div>
        }
      />

      <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <button
            key={i}
            className={`${styles.tab} ${i === activeTab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(i)}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className={styles.overviewGrid}>
          <SectionCard title={t('private.tenderDetail.details')}>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="tag" size={14} /> {t('private.tenderDetail.fields.code')}
                </span>
                <span className={styles.infoValue}>{tender.referenceCode}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="building" size={14} /> {t('private.tenderDetail.fields.issuer')}
                </span>
                <span className={styles.infoValue}>{tender.issuer}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="file" size={14} /> {t('private.tenderDetail.fields.type')}
                </span>
                <span className={styles.infoValue}>{tender.type?.toUpperCase()}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="tag" size={14} /> {t('private.tenderDetail.fields.category')}
                </span>
                <span className={styles.infoValue}>{tender.category}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="tag" size={14} /> {t('private.tenderDetail.fields.value')}
                </span>
                <span className={styles.infoValue}>{formatCurrency(tender.valueAmount)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="calendar" size={14} /> {t('private.tenderDetail.fields.deadline')}
                </span>
                <span className={styles.infoValue}>{formatDate(tender.deadlineAt)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="globe" size={14} /> {t('private.tenderDetail.fields.region')}
                </span>
                <span className={styles.infoValue}>{tender.region}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="clock" size={14} /> {t('private.tenderDetail.fields.createdOn')}
                </span>
                <span className={styles.infoValue}>{formatDate(tender.createdAt)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="user" size={14} /> {t('private.tenderDetail.fields.contact')}
                </span>
                <span className={styles.infoValue}>{tender.contactName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="mail" size={14} /> {t('private.tenderDetail.fields.email')}
                </span>
                <span className={styles.infoValue}>{tender.contactEmail}</span>
              </div>
            </div>
          </SectionCard>

          <div className={styles.overviewRight}>
            <SectionCard title={t('private.tenderDetail.description')}>
              <p className={styles.description}>{tender.description}</p>
            </SectionCard>

            <SectionCard title={t('private.tenderDetail.progress')}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }}>
                  <span className={styles.progressLabel}>{progress}%</span>
                </div>
              </div>
              <div className={styles.progressMeta}>
                <span>{t('private.tenderDetail.progressCompleted', { completed: completedReqs, total: totalReqs })}</span>
                <span className={styles.progressRemaining}>{t('private.tenderDetail.progressRemaining', { remaining })}</span>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <SectionCard title={t('private.tenderDetail.tabs.requirements')} actions={
          <div className={styles.progressHeader}>
            <div className={styles.progressBarSmall}>
              <div className={styles.progressFillSmall} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressText}>{progress}%</span>
          </div>
        }>
          <div className={styles.requirementsList}>
            {requirements.map((req, index) => (
              <div key={req.id} className={styles.reqItem} style={{ animationDelay: `${index * 0.04}s` }}>
                <div className={styles.reqCheckbox}>
                  <Icon name={req.status === 'completed' ? 'circleCheck' : req.status === 'in_progress' ? 'circleDot' : 'circle'} size={20} />
                </div>
                <div className={styles.reqInfo}>
                  <span className={`${styles.reqTitle} ${req.status === 'completed' ? styles.reqCompleted : ''}`}>
                    {req.title}
                  </span>
                  <div className={styles.reqMeta}>
                    <span className={styles.reqCategory}>{req.category}</span>
                    <StatusBadge label={t(`status.${req.status}`)} variant={req.status === 'completed' ? 'success' : req.status === 'in_progress' ? 'info' : 'neutral'} showDot={false} />
                  </div>
                </div>
                <div className={styles.reqPriority}>
                  <span className={`${styles.priorityBadge} ${styles[`priority${req.priority}`]}`}>
                    {req.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {activeTab === 2 && (
        <SectionCard title={t('private.tenderDetail.tabs.documents')} actions={
          <SubmitButton variant="secondary" onClick={() => {}} className={styles.uploadBtn}>
            <Icon name="upload" size={16} />
            <span>{t('private.tenderDetail.upload')}</span>
          </SubmitButton>
        }>
          <div className={styles.documentsList}>
            {documents.length === 0 ? (
              <EmptyState icon="file" title={t('private.tenderDetail.noDocuments')} message={t('private.tenderDetail.noDocumentsMessage')} />
            ) : (
              documents.map((doc, index) => (
                <div key={doc.id} className={styles.docItem} style={{ animationDelay: `${index * 0.04}s` }}>
                  <div className={styles.docIcon}>
                    <Icon name="file" size={24} />
                  </div>
                  <div className={styles.docInfo}>
                    <span className={styles.docName}>{doc.name}</span>
                    <span className={styles.docMeta}>
                      {doc.size} · {t('private.tenderDetail.uploadedBy')} {doc.uploadedBy} · {formatDate(doc.uploadedAt)}
                    </span>
                  </div>
                  <div className={styles.docActions}>
                    <button className={styles.docActionBtn} title={t('private.tenderDetail.download')}>
                      <Icon name="download" size={16} />
                    </button>
                    <button className={styles.docActionBtn} title={t('private.tenderDetail.deleteDoc')}>
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      )}

      {activeTab === 3 && (
        <SectionCard title={t('private.tenderDetail.tabs.tasks')} actions={
          <button className={styles.newTaskBtn} onClick={() => setShowNewTask(prev => !prev)}>
            <Icon name="plus" size={16} />
            <span>{t('private.tenderDetail.newTask')}</span>
          </button>
        }>
          {showNewTask && (
            <div className={styles.newTaskForm}>
              <div className={styles.newTaskFormRow}>
                <input
                  className={styles.newTaskInput}
                  placeholder={t('private.tenderDetail.taskTitlePlaceholder')}
                  value={newTask.title}
                  onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                />
                <select
                  className={styles.newTaskSelect}
                  value={newTask.priority}
                  onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">{priorityConfig.low.label}</option>
                  <option value="medium">{priorityConfig.medium.label}</option>
                  <option value="high">{priorityConfig.high.label}</option>
                </select>
              </div>
              <div className={styles.newTaskFormRow}>
                <input
                  className={styles.newTaskInput}
                  placeholder={t('private.tenderDetail.taskAssigneePlaceholder')}
                  value={newTask.assignee}
                  onChange={e => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                />
                <input
                  className={styles.newTaskInput}
                  type="date"
                  value={newTask.dueAt}
                  onChange={e => setNewTask(prev => ({ ...prev, dueAt: e.target.value }))}
                />
              </div>
              <div className={styles.newTaskActions}>
                <button className={styles.cancelBtn} onClick={() => { setShowNewTask(false); setNewTask({ title: '', priority: 'medium', assignee: '', dueAt: '' }) }}>
                  {t('common.cancel')}
                </button>
                <button className={styles.saveBtn} onClick={handleCreateTask}>
                  {t('common.save')}
                </button>
              </div>
            </div>
          )}
          {tasksLoading ? (
            <Loader />
          ) : tasks.length === 0 && !showNewTask ? (
            <EmptyState
              icon="check"
              title={t('private.tenderDetail.noTasks')}
              message={t('private.tenderDetail.noTasksMessage')}
            />
          ) : (
            <div className={styles.kanbanBoard}>
              {['todo', 'in_progress', 'done'].map(status => (
                <div key={status} className={styles.kanbanColumn}>
                  <div className={styles.kanbanHeader}>
                    <StatusBadge label={t(`status.${status}`)} variant={status === 'done' ? 'success' : status === 'in_progress' ? 'info' : 'neutral'} />
                    <span className={styles.kanbanCount}>
                      {tasks.filter(t => t.status === status).length}
                    </span>
                  </div>
                  <div className={styles.kanbanCards}>
                    {tasks
                      .filter(t => t.status === status)
                      .map((task, index) => (
                        <div key={task.id} className={styles.kanbanCard} style={{ animationDelay: `${index * 0.05}s` }}>
                          <div className={styles.kanbanCardTop}>
                            <button
                              className={styles.kanbanCheckbox}
                              onClick={() => handleToggleStatus(task)}
                              title={t('private.tenderDetail.toggleStatus')}
                            >
                              <Icon
                                name={task.status === 'done' ? 'circleCheck' : task.status === 'in_progress' ? 'circleDot' : 'circle'}
                                size={20}
                              />
                            </button>
                            <span className={`${styles.kanbanPriority} ${styles[`priority${task.priority}`]}`}>
                              {(priorityConfig[task.priority] || priorityConfig.medium).label}
                            </span>
                            <button
                              className={styles.kanbanDeleteBtn}
                              onClick={() => setConfirmDeleteId(task.id)}
                              title={t('private.tenderDetail.deleteTask')}
                            >
                              <Icon name="trash" size={14} />
                            </button>
                          </div>
                          {editingId === task.id ? (
                            <input
                              className={styles.editInput}
                              value={editingTitle}
                              onChange={e => setEditingTitle(e.target.value)}
                              onBlur={() => handleSaveEdit(task.id)}
                              onKeyDown={e => e.key === 'Enter' ? handleSaveEdit(task.id) : e.key === 'Escape' ? handleCancelEdit() : null}
                              autoFocus
                            />
                          ) : (
                            <span
                              className={styles.kanbanCardTitle}
                              onClick={() => handleStartEdit(task)}
                              style={{ cursor: 'pointer' }}
                            >
                              {task.title}
                            </span>
                          )}
                          <div className={styles.kanbanCardFooter}>
                            <span className={styles.kanbanAssignee}>
                              <Icon name="user" size={12} />
                              {task.assignee || '-'}
                            </span>
                            <span className={styles.kanbanDue}>
                              <Icon name="calendar" size={12} />
                              {task.dueAt ? formatDate(task.dueAt) : '-'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      <ConfirmModal
        open={confirmDeleteId !== null}
        title={t('components.confirmModal.defaultTitle')}
        message={t('components.confirmModal.defaultMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => handleDeleteTask(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        danger
      />

      {activeTab === 4 && (
        <SectionCard title={t('private.tenderDetail.aiInsights')}>
          <div className={styles.aiList}>
            {aiInsights.map((insight, index) => (
              <div key={insight.id} className={styles.aiCard} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`${styles.aiIcon} ${styles[`ai${insight.type}`]}`}>
                  <Icon name={aiTypeConfig[insight.type].icon} size={24} />
                </div>
                <div className={styles.aiContent}>
                  <div className={styles.aiHeader}>
                    <span className={styles.aiTitle}>{insight.title}</span>
                    <span className={`${styles.aiBadge} ${styles[`ai${insight.type}`]}`}>
                      {aiTypeConfig[insight.type].label}
                    </span>
                  </div>
                  <p className={styles.aiDescription}>{insight.description}</p>
                  <div className={styles.aiConfidence}>
                    <div className={styles.aiConfidenceBar}>
                      <div className={styles.aiConfidenceFill} style={{ width: `${insight.confidence}%` }} />
                    </div>
                    <span className={styles.aiConfidenceLabel}>{t('private.tenderDetail.confidence', { percent: insight.confidence })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}