import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { KpiCard } from '../../components/cards/KpiCard'
import { SectionCard } from '../../components/cards/SectionCard'
import { DataTable } from '../../components/tables/DataTable'
import { EmptyState } from '../../components/feedback/EmptyState'
import { Loader } from '../../components/feedback/Loader'
import { SubmitButton } from '../../components/forms/SubmitButton'
import Icon from '../../components/Icon'
import { APP_ROUTES } from '../../utils/constants'
import { formatDate } from '../../utils/date'
import { getTenants, getGlobalAudit } from '../../api/admin.api'
import { useAuth } from '../../hooks/useAuth'
import styles from './AdminDashboard.module.css'

export function AdminDashboard() {
  const { t } = useTranslation()
  const { tenant } = useAuth()
  const [activity, setActivity] = useState([])
  const [stats, setStats] = useState({ activeTenants: 0, totalUsers: 0, tendersCreated: 0, revenueMRR: '€ 0' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [tenantsData, auditData] = await Promise.all([
        getTenants({ pageSize: 100 }),
        getGlobalAudit({ pageSize: 10 }),
      ])
      const tenants = Array.isArray(tenantsData) ? tenantsData : []
      const audit = Array.isArray(auditData) ? auditData : []
      setActivity(audit.map(row => ({
        id: row.id,
        user: row.user_name || '—',
        actionLabel: row.action,
        tenant: row.tenant_name || '—',
        timestamp: row.created_at,
      })))
      const activeTenants = tenants.filter(t => t.status === 'active').length
      const totalUsers = tenants.reduce((sum, t) => sum + Number(t.user_count || 0), 0)
      const tendersCreated = tenants.reduce((sum, t) => sum + Number(t.tender_count || 0), 0)
      setStats({ activeTenants, totalUsers, tendersCreated, revenueMRR: `€ ${((activeTenants * 750) / 1000).toFixed(1)}K` })
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || t('admin.dashboard.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = loadData

  const kpiCards = [
    { label: t('admin.dashboard.activeTenants'), value: String(stats.activeTenants), trend: 3, trendLabel: t('admin.dashboard.thisMonth'), icon: 'building' },
    { label: t('admin.dashboard.totalUsers'), value: String(stats.totalUsers), trend: 12, trendLabel: t('admin.dashboard.thisMonth'), icon: 'users' },
    { label: t('admin.dashboard.tendersCreated'), value: String(stats.tendersCreated), trend: 8, trendLabel: t('admin.dashboard.thisMonth'), icon: 'tenders' },
    { label: t('admin.dashboard.revenueMRR'), value: stats.revenueMRR, trend: 15, trendLabel: t('admin.dashboard.growth'), icon: 'briefcase' },
  ]

  const activityColumns = [
    { label: t('admin.dashboard.columns.user'), render: row => (
      <div className={styles.userCell}>
        <span className={styles.userAvatar}>
          <Icon name="user" size={14} />
        </span>
        {row.user}
      </div>
    )},
    { label: t('admin.dashboard.columns.action'), key: 'actionLabel' },
    { label: t('admin.dashboard.columns.tenant'), render: row => (
      <span className={row.tenant === '—' ? styles.muted : ''}>{row.tenant}</span>
    )},
    { label: t('admin.dashboard.columns.date'), render: row => formatDate(row.timestamp) },
  ]

  if (error) {
    return (
      <div className={styles.page}>
        <Breadcrumbs items={[
          { label: t('components.breadcrumbs.admin'), to: APP_ROUTES.ADMIN_DASHBOARD },
          { label: t('admin.dashboard.title') },
        ]} />
        <PageHeader
          title={t('admin.dashboard.title')}
          subtitle={t('admin.dashboard.subtitle')}
        />
        <EmptyState
          title={t('admin.dashboard.loadError')}
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
        { label: t('admin.dashboard.title') },
      ]} />
      <PageHeader
        title={t('admin.dashboard.title')}
        subtitle={t('admin.dashboard.subtitle')}
        actions={
          <SubmitButton variant="secondary" onClick={handleRefresh} disabled={loading}>
            <Icon name="refresh" size={16} />
            <span>{t('admin.dashboard.refresh')}</span>
          </SubmitButton>
        }
      />

      <div className={styles.stats}>
        {kpiCards.map((kpi, i) => (
          <div key={i} className={styles.kpiWrapper} style={{ animationDelay: `${i * 0.06}s` }}>
            <KpiCard {...kpi} />
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        <SectionCard
          title={t('admin.dashboard.recentActivity')}
          actions={
            <button className={styles.linkBtn} type="button">
              <span>{t('admin.dashboard.viewAll')}</span>
              <Icon name="arrowRight" size={14} />
            </button>
          }
        >
          {loading ? (
            <Loader label={t('admin.dashboard.loadingActivity')} />
          ) : (
            <DataTable
              columns={activityColumns}
              data={activity}
              emptyState={
                <EmptyState
                  title={t('admin.dashboard.noActivity')}
                  message={t('admin.dashboard.noActivityMessage')}
                  icon="inbox"
                />
              }
            />
          )}
        </SectionCard>

        <SectionCard
          title={t('admin.dashboard.distribution')}
          actions={
            <button className={styles.linkBtn} type="button">
              <span>{t('admin.dashboard.details')}</span>
              <Icon name="arrowRight" size={14} />
            </button>
          }
        >
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartIcon}>
              <Icon name="layout" size={48} />
            </div>
            <p className={styles.chartLabel}>{t('admin.dashboard.chartPlaceholder')}</p>
            <p className={styles.chartSub}>{t('admin.dashboard.chartPlaceholderSub')}</p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}