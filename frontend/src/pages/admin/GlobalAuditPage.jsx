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
import { formatDateTime } from '../../utils/date'
import { getGlobalAudit } from '../../api/admin.api'
import styles from './GlobalAuditPage.module.css'

const typeVariant = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  system: 'neutral',
  submit: 'pending',
  auth: 'warning',
  export: 'info',
}

const typeIcon = {
  create: 'plus',
  update: 'edit',
  delete: 'trash',
  system: 'refresh',
  submit: 'send',
  auth: 'lock',
  export: 'download',
}

function deriveType(action = '') {
  const verb = action.split('.').pop() || ''
  if (verb.includes('creat') || verb.includes('invited')) return 'create'
  if (verb.includes('updat') || verb.includes('changed') || verb.includes('edit')) return 'update'
  if (verb.includes('delet') || verb.includes('remov')) return 'delete'
  if (verb.includes('submit')) return 'submit'
  if (verb.includes('login') || verb.includes('logout') || verb.includes('auth')) return 'auth'
  if (verb.includes('export')) return 'export'
  return 'system'
}

function normalizeAuditRow(row) {
  return {
    id: row.id,
    tenant: row.tenant_name || '—',
    user: row.user_name || '—',
    actionLabel: row.action || '—',
    target: row.entity_type ? `${row.entity_type}${row.entity_id ? ` #${row.entity_id}` : ''}` : '—',
    type: deriveType(row.action),
    timestamp: row.created_at,
  }
}

export function GlobalAuditPage() {
  const { t } = useTranslation()
  const [audit, setAudit] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [tenantFilter, setTenantFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const fetchAudit = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (tenantFilter) params.tenant = tenantFilter
      if (typeFilter) params.type = typeFilter
      const data = await getGlobalAudit(params)
      setAudit((Array.isArray(data) ? data : []).map(normalizeAuditRow))
    } catch (err) {
      setError(err.message || t('admin.globalAudit.loadError'))
    } finally {
      setLoading(false)
    }
  }, [tenantFilter, typeFilter, t])

  useEffect(() => {
    fetchAudit()
  }, [fetchAudit])

  const handleExport = () => {
    try {
      const headers = ['Tenant', 'User', 'Action', 'Target', 'Type', 'Timestamp']
      const rows = filtered.map(row => [row.tenant, row.user, row.actionLabel, row.target, row.type, row.timestamp])
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'audit-log.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  const tenants = [...new Set(audit.map(a => a.tenant).filter(t => t !== '—'))]

  const filtered = audit.filter(a => {
    const q = search.toLowerCase()
    const matchSearch =
      (a.user || '').toLowerCase().includes(q) ||
      (a.actionLabel || '').toLowerCase().includes(q) ||
      (a.target || '').toLowerCase().includes(q)
    const matchTenant = tenantFilter ? a.tenant === tenantFilter : true
    const matchType = typeFilter ? a.type === typeFilter : true
    return matchSearch && matchTenant && matchType
  })

  function handleClearFilters() {
    setSearch('')
    setTenantFilter('')
    setTypeFilter('')
  }

  const columns = [
    { label: t('admin.globalAudit.columns.action'), render: row => (
      <div className={styles.actionCell}>
        <span className={`${styles.actionIcon} ${styles[`type_${row.type}`]}`}>
          <Icon name={typeIcon[row.type] || 'info'} size={14} />
        </span>
        <div className={styles.actionInfo}>
          <span className={styles.actionLabel}>{row.actionLabel}</span>
          <span className={styles.actionTarget}>{row.target}</span>
        </div>
      </div>
    )},
    { label: t('admin.globalAudit.columns.tenant'), render: row => (
      <span className={row.tenant === '—' ? styles.muted : styles.tenant}>
        {row.tenant === '—' ? (
          <span className={styles.systemTag}>
            <Icon name="shield" size={12} />
            {t('admin.globalAudit.systemTag')}
          </span>
        ) : (
          <span className={styles.tenantTag}>
            <Icon name="building" size={12} />
            {row.tenant}
          </span>
        )}
      </span>
    )},
    { label: t('admin.globalAudit.columns.user'), render: row => (
      <span className={styles.userCell}>
        <Icon name="user" size={14} />
        {row.user}
      </span>
    )},
    { label: t('admin.globalAudit.columns.type'), render: row => (
      <StatusBadge
        label={t(`admin.globalAudit.typeOptions.${row.type}`)}
        variant={typeVariant[row.type] || 'neutral'}
      />
    )},
    { label: t('admin.globalAudit.columns.dateTime'), render: row => (
      <span className={styles.timestamp}>
        <Icon name="clock" size={12} />
        {formatDateTime(row.timestamp)}
      </span>
    )},
  ]

  if (error) {
    return (
      <div className={styles.page}>
        <Breadcrumbs items={[
          { label: t('components.breadcrumbs.admin'), to: APP_ROUTES.ADMIN_DASHBOARD },
          { label: t('admin.globalAudit.title') },
        ]} />
        <PageHeader
          title={t('admin.globalAudit.title')}
          subtitle={t('admin.globalAudit.subtitle')}
        />
        <EmptyState
          title={t('admin.globalAudit.loadError')}
          message={error}
          icon="alertCircle"
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: t('components.breadcrumbs.admin'), to: APP_ROUTES.ADMIN_DASHBOARD },
        { label: t('admin.globalAudit.title') },
      ]} />
      <PageHeader
        title={t('admin.globalAudit.title')}
        subtitle={t('admin.globalAudit.subtitle')}
        actions={
          <SubmitButton variant="secondary" onClick={handleExport}>
            <Icon name="download" size={16} />
            <span>{t('admin.globalAudit.export')}</span>
          </SubmitButton>
        }
      />

      <div className={styles.toolbar}>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          onClear={handleClearFilters}
          searchPlaceholder={t('admin.globalAudit.searchPlaceholder')}
          filters={[
            {
              placeholder: t('admin.globalAudit.tenantPlaceholder'),
              value: tenantFilter,
              onChange: setTenantFilter,
              options: tenants.map(t => ({ label: t, value: t })),
            },
            {
              placeholder: t('admin.globalAudit.typePlaceholder'),
              value: typeFilter,
              onChange: setTypeFilter,
              options: [
                { label: t('admin.globalAudit.typeOptions.create'), value: 'create' },
                { label: t('admin.globalAudit.typeOptions.update'), value: 'update' },
                { label: t('admin.globalAudit.typeOptions.delete'), value: 'delete' },
                { label: t('admin.globalAudit.typeOptions.system'), value: 'system' },
                { label: t('admin.globalAudit.typeOptions.submit'), value: 'submit' },
                { label: t('admin.globalAudit.typeOptions.auth'), value: 'auth' },
                { label: t('admin.globalAudit.typeOptions.export'), value: 'export' },
              ],
            },
          ]}
        />
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <Loader label={t('admin.globalAudit.loadingLogs')} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyState={
              <EmptyState
                title={t('admin.globalAudit.emptyTitle')}
                message={t('admin.globalAudit.emptyMessage')}
                icon="search"
              />
            }
          />
        )}
      </div>
    </div>
  )
}