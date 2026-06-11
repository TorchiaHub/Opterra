import { useState, useEffect } from 'react'
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
import { formatDate } from '../../utils/date'
import { getTenants, updateTenantStatus } from '../../api/admin.api'
import styles from './TenantsPage.module.css'

export function TenantsPage() {
  const { t } = useTranslation()
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    async function fetchTenants() {
      try {
        setLoading(true)
        setError(null)
        const data = await getTenants({ search, status: statusFilter })
        setTenants((Array.isArray(data) ? data : []).map(row => ({
          id: row.id,
          name: row.name,
          email: row.slug || '',
          users: Number(row.user_count || 0),
          tenders: Number(row.tender_count || 0),
          status: row.status,
          createdAt: row.created_at,
        })))
      } catch (err) {
        setError(err.message || t('admin.tenants.loadError'))
      } finally {
        setLoading(false)
      }
    }
    fetchTenants()
  }, [search, statusFilter, t])

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    try {
      await updateTenantStatus(id, newStatus)
      setTenants(prev => prev.map(t =>
        t.id === id ? { ...t, status: newStatus } : t
      ))
    } catch (err) {
      setError(err.message || t('admin.tenants.updateError'))
    }
  }

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase()
    const matchSearch =
      (t.name || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q)
    const matchStatus = statusFilter ? t.status === statusFilter : true
    return matchSearch && matchStatus
  })

  const columns = [
    { label: t('admin.tenants.columns.company'), render: row => (
      <div className={styles.tenantCell}>
        <span className={styles.tenantIcon}>
          <Icon name="building" size={16} />
        </span>
        <div className={styles.tenantInfo}>
          <span className={styles.tenantName}>{row.name}</span>
          <span className={styles.tenantEmail}>{row.email}</span>
        </div>
      </div>
    )},
    { label: t('admin.tenants.columns.users'), render: row => (
      <span className={styles.countCell}>
        <Icon name="users" size={14} />
        {row.users}
      </span>
    )},
    { label: t('admin.tenants.columns.tenders'), render: row => (
      <span className={styles.countCell}>
        <Icon name="tenders" size={14} />
        {row.tenders}
      </span>
    )},
    { label: t('admin.tenants.columns.status'), render: row => (
      <StatusBadge
        label={row.status === 'active' ? t('admin.tenants.status.active') : t('admin.tenants.status.disabled')}
        variant={row.status === 'active' ? 'success' : 'neutral'}
      />
    )},
    { label: t('admin.tenants.columns.registered'), render: row => formatDate(row.createdAt) },
    { label: t('admin.tenants.columns.actions'), render: row => (
      <div className={styles.actionsCell}>
        <button className={styles.actionBtn} type="button" title={t('admin.tenants.actionTitles.edit')}>
          <Icon name="edit" size={16} />
        </button>
        <button
          className={`${styles.toggleBtn} ${row.status === 'active' ? styles.toggleActive : styles.toggleDisabled}`}
          type="button"
          onClick={() => toggleStatus(row.id, row.status)}
          title={row.status === 'active' ? t('admin.tenants.actionTitles.disable') : t('admin.tenants.actionTitles.enable')}
        >
          <Icon name={row.status === 'active' ? 'circleCheck' : 'circleX'} size={16} />
          <span>{row.status === 'active' ? t('admin.tenants.status.active') : t('admin.tenants.status.disabled')}</span>
        </button>
      </div>
    )},
  ]

  function handleClearFilters() {
    setSearch('')
    setStatusFilter('')
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Breadcrumbs items={[
          { label: t('components.breadcrumbs.admin'), to: APP_ROUTES.ADMIN_DASHBOARD },
          { label: t('admin.tenants.title') },
        ]} />
        <PageHeader
          title={t('admin.tenants.title')}
          subtitle={t('admin.tenants.subtitle')}
        />
        <EmptyState
          title={t('admin.tenants.loadError')}
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
        { label: t('admin.tenants.title') },
      ]} />
      <PageHeader
        title={t('admin.tenants.title')}
        subtitle={t('admin.tenants.subtitle')}
        actions={
          <SubmitButton variant="primary" onClick={() => {}}>
            <Icon name="plus" size={16} />
            <span>{t('admin.tenants.newTenant')}</span>
          </SubmitButton>
        }
      />

      <div className={styles.toolbar}>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          onClear={handleClearFilters}
          searchPlaceholder={t('admin.tenants.searchPlaceholder')}
          filters={[
            {
              placeholder: t('admin.tenants.allStatuses'),
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: t('admin.tenants.status.active'), value: 'active' },
                { label: t('admin.tenants.status.disabled'), value: 'suspended' },
              ],
            },
          ]}
        />
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <Loader label={t('admin.tenants.loadingTenants')} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyState={
              <EmptyState
                title={t('admin.tenants.emptyTitle')}
                message={t('admin.tenants.emptyMessage')}
                icon="search"
              />
            }
          />
        )}
      </div>
    </div>
  )
}