import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { KpiCard } from '../../components/cards/KpiCard'
import { SectionCard } from '../../components/cards/SectionCard'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { Loader } from '../../components/feedback/Loader'
import Icon from '../../components/Icon'
import { APP_ROUTES, TENDER_STATUS_COLORS } from '../../utils/constants'
import { formatCurrency } from '../../utils/format'
import { formatRelative, formatDate } from '../../utils/date'
import { getTenderDashboard, getTenders } from '../../api/tenders.api'
import { useAuth } from '../../hooks/useAuth'
import styles from './DashboardPage.module.css'

const recentActivities = [
  { id: 1, user: 'Marco Rossi', action: 'ha creato la gara', target: 'Fornitura software procurement', time: '2026-06-10T14:30:00Z', icon: 'plus' },
  { id: 2, user: 'Laura Bianchi', action: 'ha aggiornato lo stato', target: 'Manutenzione impianti', time: '2026-06-10T11:15:00Z', icon: 'edit' },
  { id: 3, user: 'Giuseppe Verdi', action: 'ha caricato il documento', target: 'Capitolato tecnico', time: '2026-06-09T16:45:00Z', icon: 'upload' },
  { id: 4, user: 'Anna Neri', action: 'ha completato il task', target: 'Analisi requisiti', time: '2026-06-09T09:20:00Z', icon: 'check' },
  { id: 5, user: 'Marco Rossi', action: 'ha inviato la gara', target: 'Servizi consulenza ICT', time: '2026-06-08T17:00:00Z', icon: 'send' },
]

const tasks = [
  { id: 1, title: 'Completare checklist requisiti', tender: 'Fornitura software', dueAt: '2026-06-12T10:00:00Z', priority: 'high', status: 'todo' },
  { id: 2, title: 'Revisione offerta tecnica', tender: 'Consulenza ICT', dueAt: '2026-06-14T10:00:00Z', priority: 'high', status: 'in_progress' },
  { id: 3, title: 'Caricare documenti aggiuntivi', tender: 'Manutenzione impianti', dueAt: '2026-06-15T10:00:00Z', priority: 'medium', status: 'todo' },
  { id: 4, title: 'Verifica fatturato', tender: 'Arredi ufficio', dueAt: '2026-06-10T10:00:00Z', priority: 'low', status: 'done' },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashboardStats, tendersData] = await Promise.allSettled([
          getTenderDashboard(),
          getTenders({ pageSize: 5, sortBy: 'deadline_at', sortOrder: 'ASC' }),
        ])
        if (dashboardStats.status === 'fulfilled') setStats(dashboardStats.value)
        if (tendersData.status === 'fulfilled') setTenders(Array.isArray(tendersData.value) ? tendersData.value : tendersData.value?.data || [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const kpiData = [
    { label: t('private.dashboard.activeTenders'), value: stats?.active ?? '0', trend: stats?.active > 0 ? 2 : 0, trendLabel: t('private.dashboard.trendThisWeek'), icon: 'briefcase' },
    { label: t('private.dashboard.expiringSoon'), value: stats?.overdue ?? '0', trend: stats?.overdue > 0 ? -1 : 0, trendLabel: t('private.dashboard.trendUrgent'), icon: 'clock' },
    { label: t('private.dashboard.totalValue'), value: stats ? formatCurrency(stats.total_value) : '€0', trend: 8, trendLabel: t('private.dashboard.trendVsLastMonth'), icon: 'tag' },
    { label: t('private.dashboard.assignedTasks'), value: '23', trend: 5, trendLabel: t('private.dashboard.trendToComplete'), icon: 'checkCircle' },
  ]

  const priorityConfig = {
    high: { label: t('private.dashboard.priority.high'), color: 'danger', icon: 'circleAlert' },
    medium: { label: t('private.dashboard.priority.medium'), color: 'warning', icon: 'circleDot' },
    low: { label: t('private.dashboard.priority.low'), color: 'info', icon: 'circle' },
  }

  const taskStatusConfig = {
    todo: { label: t('private.dashboard.taskStatus.todo'), variant: 'neutral' },
    in_progress: { label: t('private.dashboard.taskStatus.inProgress'), variant: 'info' },
    done: { label: t('private.dashboard.taskStatus.done'), variant: 'success' },
  }

  if (loading) {
    return <Loader label={t('common.loading')} />
  }

  const displayTenders = tenders.length > 0 ? tenders : []

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: t('components.breadcrumbs.workspace'), to: APP_ROUTES.DASHBOARD },
        { label: t('private.dashboard.title') },
      ]} />
      <PageHeader
        title={`${t('private.dashboard.title')}${user?.firstName ? `, ${user.firstName}` : ''}`}
        subtitle={t('private.dashboard.subtitle')}
      />

      <div className={styles.kpiGrid}>
        {kpiData.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      <div className={styles.chartsSection}>
        <SectionCard title={t('private.dashboard.analysis')} icon="chart">
          <div className={styles.chartsPlaceholder}>
            <Icon name="layers" size={40} className={styles.chartsIcon} />
            <p className={styles.chartsText}>{t('private.dashboard.analysisPlaceholder')}</p>
            <span className={styles.chartsSub}>{t('private.dashboard.analysisPlaceholderSub')}</span>
          </div>
        </SectionCard>
      </div>

      <div className={styles.grid}>
        <SectionCard title={t('private.dashboard.expiringTenders')} noPadding>
          {displayTenders.length === 0 ? (
            <EmptyState icon="inbox" title={t('private.dashboard.noTenders')} message={t('private.dashboard.noTendersMessage')} />
          ) : (
            <div className={styles.list}>
              {displayTenders.map((tender, index) => (
                <div
                  key={tender.id}
                  className={styles.listItem}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => navigate(`/app/tenders/${tender.id}`)}
                >
                  <div className={styles.listInfo}>
                    <span className={styles.listTitle}>{tender.title}</span>
                    <span className={styles.listMeta}>{tender.issuer}</span>
                  </div>
                  <div className={styles.listRight}>
                    <StatusBadge
                      label={t(`status.${tender.status}`) || tender.status}
                      variant={TENDER_STATUS_COLORS[tender.status] || 'neutral'}
                    />
                    <div className={styles.listValue}>{formatCurrency(tender.value_amount)}</div>
                    <div className={styles.listDate}>
                      <Icon name="calendar" size={12} />
                      {formatRelative(tender.deadline_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title={t('private.dashboard.recentActivity')} noPadding>
          {recentActivities.length === 0 ? (
            <EmptyState icon="activity" title={t('private.dashboard.noActivity')} message={t('private.dashboard.noActivityMessage')} />
          ) : (
            <div className={styles.list}>
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className={styles.activityItem} style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className={styles.activityIcon}>
                    <Icon name={activity.icon} size={16} />
                  </div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityText}>
                      <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
                    </span>
                    <span className={styles.activityTime}>{formatRelative(activity.time)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className={styles.tasksSection}>
        <SectionCard title={t('private.dashboard.priorityTasks')} noPadding>
          {tasks.length === 0 ? (
            <EmptyState icon="inbox" title={t('private.dashboard.noTasks')} message={t('private.dashboard.noTasksMessage')} />
          ) : (
            <div className={styles.list}>
              {tasks.map((task, index) => (
                <div key={task.id} className={styles.taskItem} style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className={styles.taskLeft}>
                    <div className={styles.taskCheckbox}>
                      <Icon name={task.status === 'done' ? 'circleCheck' : 'circle'} size={18} />
                    </div>
                    <div className={styles.taskInfo}>
                      <span className={`${styles.taskTitle} ${task.status === 'done' ? styles.taskDone : ''}`}>
                        {task.title}
                      </span>
                      <span className={styles.taskMeta}>{task.tender}</span>
                    </div>
                  </div>
                  <div className={styles.taskRight}>
                    <StatusBadge label={taskStatusConfig[task.status].label} variant={taskStatusConfig[task.status].variant} />
                    <div className={styles.taskDue}>
                      <Icon name="calendar" size={12} />
                      {formatDate(task.dueAt)}
                    </div>
                    <div className={`${styles.taskPriority} ${styles[`priority${task.priority}`]}`}>
                      <Icon name={priorityConfig[task.priority].icon} size={12} />
                      {priorityConfig[task.priority].label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}