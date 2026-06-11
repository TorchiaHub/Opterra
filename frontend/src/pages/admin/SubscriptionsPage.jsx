import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { DataTable } from '../../components/tables/DataTable'
import { SectionCard } from '../../components/cards/SectionCard'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { Loader } from '../../components/feedback/Loader'
import { SubmitButton } from '../../components/forms/SubmitButton'
import Icon from '../../components/Icon'
import { APP_ROUTES } from '../../utils/constants'
import { getPlans } from '../../api/admin.api'
import styles from './SubscriptionsPage.module.css'

export function SubscriptionsPage() {
  const { t } = useTranslation()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPlans() {
      try {
        setLoading(true)
        setError(null)
        const data = await getPlans()
        const priceByCode = { free: 0, pro: 49, enterprise: 199 }
        setPlans((Array.isArray(data) ? data : []).map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.code,
          price: priceByCode[plan.code] ?? 0,
          users: plan.max_users,
          tenders: plan.max_tenders,
          features: [
            `${plan.max_storage_mb} MB storage`,
            `${plan.max_ai_requests_month} AI req/mese`,
          ],
          status: 'active',
        })))
      } catch (err) {
        setError(err.message || t('admin.subscriptions.loadError'))
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [t])

  const toggleStatus = (id) => {
    setPlans(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'active' ? 'disabled' : 'active' } : p
    ))
  }

  const columns = [
    { label: t('admin.subscriptions.columns.plan'), render: row => (
      <div className={styles.planCell}>
        <span className={styles.planIcon}>
          <Icon name="layers" size={16} />
        </span>
        <div className={styles.planInfo}>
          <span className={styles.planName}>{row.name}</span>
          <span className={styles.planDesc}>{row.description}</span>
        </div>
      </div>
    )},
    { label: t('admin.subscriptions.columns.price'), render: row => (
      <span className={styles.price}>
        {row.price === 0 ? t('admin.subscriptions.free') : t('admin.subscriptions.pricePerMonth', { price: row.price })}
      </span>
    )},
    { label: t('admin.subscriptions.columns.users'), render: row => (
      <span className={styles.countCell}>
        <Icon name="users" size={14} />
        {row.users}
      </span>
    )},
    { label: t('admin.subscriptions.columns.tenders'), render: row => (
      <span className={styles.countCell}>
        <Icon name="tenders" size={14} />
        {row.tenders}
      </span>
    )},
    { label: t('admin.subscriptions.columns.features'), render: row => (
      <div className={styles.features}>
        {row.features.map((f, i) => (
          <span key={i} className={styles.featureTag}>
            <Icon name="check" size={10} />
            {f}
          </span>
        ))}
      </div>
    )},
    { label: t('admin.subscriptions.columns.status'), render: row => (
      <StatusBadge
        label={row.status === 'active' ? t('admin.subscriptions.status.active') : t('admin.subscriptions.status.disabled')}
        variant={row.status === 'active' ? 'success' : 'neutral'}
      />
    )},
    { label: t('admin.subscriptions.columns.actions'), render: row => (
      <div className={styles.actionsCell}>
        <button className={styles.actionBtn} type="button" title={t('admin.subscriptions.actionTitles.editPlan')}>
          <Icon name="edit" size={16} />
        </button>
        <button
          className={`${styles.toggleBtn} ${row.status === 'active' ? styles.toggleActive : styles.toggleDisabled}`}
          type="button"
          onClick={() => toggleStatus(row.id)}
          title={row.status === 'active' ? t('admin.subscriptions.actionTitles.disable') : t('admin.subscriptions.actionTitles.enable')}
        >
          <Icon name={row.status === 'active' ? 'circleCheck' : 'circleX'} size={16} />
          <span>{row.status === 'active' ? t('admin.subscriptions.status.active') : t('admin.subscriptions.status.disabled')}</span>
        </button>
      </div>
    )},
  ]

  if (error) {
    return (
      <div className={styles.page}>
        <Breadcrumbs items={[
          { label: t('components.breadcrumbs.admin'), to: APP_ROUTES.ADMIN_DASHBOARD },
          { label: t('admin.subscriptions.title') },
        ]} />
        <PageHeader
          title={t('admin.subscriptions.title')}
          subtitle={t('admin.subscriptions.subtitle')}
        />
        <EmptyState
          title={t('admin.subscriptions.loadError')}
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
        { label: t('admin.subscriptions.title') },
      ]} />
      <PageHeader
        title={t('admin.subscriptions.title')}
        subtitle={t('admin.subscriptions.subtitle')}
        actions={
          <SubmitButton variant="primary" onClick={() => {}}>
            <Icon name="plus" size={16} />
            <span>{t('admin.subscriptions.newPlan')}</span>
          </SubmitButton>
        }
      />

      <SectionCard title={t('admin.subscriptions.availablePlans')} noPadding>
        {loading ? (
          <Loader label={t('admin.subscriptions.loadingPlans')} />
        ) : (
          <DataTable
            columns={columns}
            data={plans}
            emptyState={
              <EmptyState
                title={t('admin.subscriptions.emptyTitle')}
                message={t('admin.subscriptions.emptyMessage')}
                icon="inbox"
              />
            }
          />
        )}
      </SectionCard>
    </div>
  )
}