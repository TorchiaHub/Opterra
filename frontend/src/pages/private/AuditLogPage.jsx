import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { DataTable } from '../../components/tables/DataTable'
import { FilterBar } from '../../components/tables/FilterBar'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { Loader } from '../../components/feedback/Loader'
import { SubmitButton } from '../../components/forms/SubmitButton'
import Icon from '../../components/Icon'
import { APP_ROUTES } from '../../utils/constants'
import { getAuditLogs, exportAuditLogs } from '../../api/audit.api'
import styles from './AuditLogPage.module.css'

function deriveActionVerb(action = '') {
  const verb = action.split('.').pop() || ''
  if (verb.includes('creat')) return 'create'
  if (verb.includes('updat') || verb.includes('changed') || verb.includes('edit')) return 'update'
  if (verb.includes('delet') || verb.includes('remov')) return 'delete'
  if (verb.includes('upload')) return 'upload'
  if (verb.includes('invit')) return 'invite'
  if (verb.includes('login')) return 'login'
  if (verb.includes('logout')) return 'logout'
  if (verb.includes('export')) return 'export'
  return verb || 'update'
}

export function AuditLogPage() {
  const { t } = useTranslation()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (dateFrom) params.from = dateFrom
      if (dateTo) params.to = `${dateTo} 23:59:59`
      const data = await getAuditLogs(params)
      setLogs((Array.isArray(data) ? data : []).map(row => ({
        id: row.id,
        createdAt: row.created_at,
        user: row.user_name || '—',
        email: row.user_email || '',
        action: deriveActionVerb(row.action),
        actionRaw: row.action,
        resource: row.entity_type || '—',
        resourceName: row.entity_id ? `#${row.entity_id}` : '—',
        ip: row.ip_address || '—',
      })))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  async function handleExport() {
    try {
      const blob = await exportAuditLogs()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'audit-log.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
    }
  }

  const actionConfig = {
    create: { label: t('private.auditLog.actionLabels.create'), icon: 'plus', variant: 'success' },
    update: { label: t('private.auditLog.actionLabels.update'), icon: 'edit', variant: 'info' },
    delete: { label: t('private.auditLog.actionLabels.delete'), icon: 'trash', variant: 'danger' },
    upload: { label: t('private.auditLog.actionLabels.upload'), icon: 'upload', variant: 'info' },
    login: { label: t('private.auditLog.actionLabels.login'), icon: 'checkCircle', variant: 'success' },
    logout: { label: t('private.auditLog.actionLabels.logout'), icon: 'logout', variant: 'neutral' },
    invite: { label: t('private.auditLog.actionLabels.invite'), icon: 'user', variant: 'pending' },
    export: { label: t('private.auditLog.actionLabels.export'), icon: 'download', variant: 'warning' },
  }

  const filtered = logs.filter(log => {
    const q = search.toLowerCase()
    if (search && !(log.user || '').toLowerCase().includes(q) && !(log.resourceName || '').toLowerCase().includes(q) && !(log.actionRaw || '').toLowerCase().includes(q)) return false
    if (actionFilter && log.action !== actionFilter) return false
    return true
  })

  const columns = [
    {
      label: t('private.auditLog.columns.date'),
      key: 'createdAt',
      render: row => (
        <span className={styles.dateCell}>
          <Icon name="calendar" size={12} />
          {new Date(row.createdAt).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      ),
      width: '160px',
    },
    {
      label: t('private.auditLog.columns.user'),
      key: 'user',
      render: row => (
        <div className={styles.userCell}>
          <div className={styles.userAvatar}>
            <Icon name="user" size={16} />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{row.user}</span>
            <span className={styles.userEmail}>{row.email}</span>
          </div>
        </div>
      ),
      width: '25%',
    },
    {
      label: t('private.auditLog.columns.action'),
      key: 'action',
      render: row => {
        const config = actionConfig[row.action] || { label: row.action, icon: 'circle', variant: 'neutral' }
        return (
          <span className={styles.actionCell}>
            <Icon name={config.icon} size={14} />
            <StatusBadge label={config.label} variant={config.variant} showDot={false} />
          </span>
        )
      },
    },
    {
      label: t('private.auditLog.columns.resource'),
      key: 'resource',
      render: row => (
        <div className={styles.resourceCell}>
          <span className={styles.resourceType}>{row.resource}</span>
          <span className={styles.resourceName}>{row.resourceName}</span>
        </div>
      ),
    },
    {
      label: t('private.auditLog.columns.ip'),
      key: 'ip',
      render: row => (
        <span className={styles.ipCell}>
          <Icon name="shield" size={12} />
          {row.ip}
        </span>
      ),
      width: '120px',
    },
  ]

  function handleClearFilters() {
    setSearch('')
    setActionFilter('')
    setDateFrom('')
    setDateTo('')
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
        <EmptyState
          icon="alertCircle"
          title={t('common.error')}
          message={error.message}
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: t('components.breadcrumbs.workspace'), to: APP_ROUTES.DASHBOARD },
        { label: t('private.auditLog.title') },
      ]} />
      <PageHeader
        title={t('private.auditLog.title')}
        subtitle={t('private.auditLog.subtitle')}
        actions={
          <SubmitButton variant="secondary" onClick={handleExport} className={styles.exportBtn}>
            <Icon name="download" size={16} />
            <span>{t('private.auditLog.export')}</span>
          </SubmitButton>
        }
      />

      <div className={styles.dateFilter}>
        <div className={styles.dateInputGroup}>
          <span className={styles.dateLabel}>
            <Icon name="calendar" size={14} />
            {t('private.auditLog.dateFrom')}
          </span>
          <input
            type="date"
            className={styles.dateInput}
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
        </div>
        <div className={styles.dateInputGroup}>
          <span className={styles.dateLabel}>
            <Icon name="calendar" size={14} />
            {t('private.auditLog.dateTo')}
          </span>
          <input
            type="date"
            className={styles.dateInput}
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />
        </div>
        {(dateFrom || dateTo) && (
          <button className={styles.clearDateBtn} onClick={() => { setDateFrom(''); setDateTo(''); }}>
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onClear={handleClearFilters}
        searchPlaceholder={t('private.auditLog.searchPlaceholder')}
        filters={[
          {
            placeholder: t('private.auditLog.allActions'),
            value: actionFilter,
            onChange: setActionFilter,
            options: Object.entries(actionConfig).map(([value, config]) => ({ value, label: config.label })),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        emptyState={
          <EmptyState
            icon="audit"
            title={t('private.auditLog.emptyTitle')}
            message={t('private.auditLog.emptyMessage')}
          />
        }
      />
    </div>
  )
}