import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { KpiCard } from '../../components/cards/KpiCard'
import { SectionCard } from '../../components/cards/SectionCard'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { Loader } from '../../components/feedback/Loader'
import { SubmitButton } from '../../components/forms/SubmitButton'
import Icon from '../../components/Icon'
import { APP_ROUTES, TENDER_STATUS_COLORS } from '../../utils/constants'
import { formatCurrency } from '../../utils/format'
import { formatRelative, formatDate } from '../../utils/date'
import { getTenderDashboard, getTenders } from '../../api/tenders.api'
import { getTasks, updateTask } from '../../api/tasks.api'
import { getAuditLogs } from '../../api/audit.api'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import styles from './DashboardPage.module.css'

const ACTIVITY_ICONS = {
  created: 'plus',
  updated: 'edit',
  deleted: 'trash',
  uploaded: 'upload',
  invited: 'user',
  status_changed: 'refresh',
  assigned: 'users',
  message_sent: 'chat',
}

function activityIconFor(action = '') {
  const verb = action.split('.').pop() || ''
  return ACTIVITY_ICONS[verb] || 'activity'
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { canViewAudit } = usePermissions()
  const [stats, setStats] = useState(null)
  const [tenders, setTenders] = useState([])
  const [tasks, setTasks] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, tendersRes] = await Promise.allSettled([
        getTenderDashboard(),
        getTenders({ pageSize: 10, sortBy: 'deadline_at', sortOrder: 'ASC' }),
      ])
      const tenderList = tendersRes.status === 'fulfilled' && Array.isArray(tendersRes.value)
        ? tendersRes.value
        : []
      if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      setTenders(tenderList)

      // Tasks reali dalle gare più vicine alla scadenza
      const taskTenders = tenderList.slice(0, 6)
      const taskResults = await Promise.allSettled(taskTenders.map(td => getTasks(td.id)))
      const allTasks = taskResults.flatMap((res, i) =>
        res.status === 'fulfilled' && Array.isArray(res.value)
          ? res.value.map(task => ({
              id: task.id,
              tenderId: taskTenders[i].id,
              tender: taskTenders[i].title,
              title: task.title,
              status: task.status || 'todo',
              priority: task.priority || 'medium',
              dueAt: task.due_at,
            }))
          : []
      )
      allTasks.sort((a, b) => {
        if ((a.status === 'done') !== (b.status === 'done')) return a.status === 'done' ? 1 : -1
        return new Date(a.dueAt || '2999-01-01') - new Date(b.dueAt || '2999-01-01')
      })
      setTasks(allTasks.slice(0, 6))

      // Attività recenti: audit log per i manager, storico gare per gli altri
      if (canViewAudit) {
        try {
          const logs = await getAuditLogs({ pageSize: 6 })
          setActivities((Array.isArray(logs) ? logs : []).map(row => ({
            id: `audit-${row.id}`,
            user: row.user_name || '—',
            action: row.action || '',
            target: row.entity_type ? `${row.entity_type} #${row.entity_id ?? ''}` : '',
            time: row.created_at,
            icon: activityIconFor(row.action),
            tenderId: row.entity_type === 'tender' ? row.entity_id : null,
          })))
        } catch {
          setActivities([])
        }
      } else {
        const derived = [...tenderList]
          .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
          .slice(0, 6)
          .map(td => ({
            id: `tender-${td.id}`,
            user: null,
            action: td.updated_at && td.updated_at !== td.created_at
              ? t('private.dashboard.activityUpdated')
              : t('private.dashboard.activityCreated'),
            target: td.title,
            time: td.updated_at || td.created_at,
            icon: td.updated_at && td.updated_at !== td.created_at ? 'edit' : 'plus',
            tenderId: td.id,
          }))
        setActivities(derived)
      }
    } finally {
      setLoading(false)
    }
  }, [canViewAudit, t])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleToggleTask(e, task) {
    e.stopPropagation()
    const next = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo'
    setTasks(prev => prev.map(item => item.id === task.id ? { ...item, status: next } : item))
    try {
      await updateTask(task.tenderId, task.id, { status: next })
    } catch {
      setTasks(prev => prev.map(item => item.id === task.id ? { ...item, status: task.status } : item))
    }
  }

  const openTasks = tasks.filter(task => task.status !== 'done').length
  const overdueCount = Number(stats?.overdue || 0)
  const draftCount = Number(stats?.draft || 0)
  const wonValue = Number(stats?.won_value || 0)

  const kpiData = [
    {
      label: t('private.dashboard.activeTenders'),
      value: String(stats?.active ?? 0),
      trend: draftCount > 0 ? 1 : 0,
      trendLabel: t('private.dashboard.kpiDrafts', { count: draftCount }),
      icon: 'briefcase',
    },
    {
      label: t('private.dashboard.expiringSoon'),
      value: String(overdueCount),
      trend: overdueCount > 0 ? -1 : 0,
      trendLabel: t('private.dashboard.trendUrgent'),
      icon: 'clock',
    },
    {
      label: t('private.dashboard.totalValue'),
      value: stats ? formatCurrency(stats.total_value) : '€0',
      trend: wonValue > 0 ? 1 : 0,
      trendLabel: t('private.dashboard.kpiWonValue', { value: formatCurrency(wonValue) }),
      icon: 'tag',
    },
    {
      label: t('private.dashboard.assignedTasks'),
      value: String(openTasks),
      trend: 0,
      trendLabel: t('private.dashboard.trendToComplete'),
      icon: 'checkCircle',
    },
  ]

  const priorityConfig = {
    high: { label: t('private.dashboard.priority.high'), icon: 'circleAlert' },
    medium: { label: t('private.dashboard.priority.medium'), icon: 'circleDot' },
    low: { label: t('private.dashboard.priority.low'), icon: 'circle' },
  }

  const taskStatusConfig = {
    todo: { label: t('private.dashboard.taskStatus.todo'), variant: 'neutral' },
    in_progress: { label: t('private.dashboard.taskStatus.inProgress'), variant: 'info' },
    done: { label: t('private.dashboard.taskStatus.done'), variant: 'success' },
    blocked: { label: t('private.dashboard.taskStatus.todo'), variant: 'danger' },
  }

  const chartData = [
    { key: 'draft', count: Number(stats?.draft || 0), color: 'var(--color-text-tertiary)' },
    { key: 'active', count: Number(stats?.active || 0), color: 'var(--color-info)' },
    { key: 'submitted', count: Number(stats?.submitted || 0), color: 'var(--color-pending)' },
    { key: 'won', count: Number(stats?.won || 0), color: 'var(--color-success)' },
    { key: 'lost', count: Number(stats?.lost || 0), color: 'var(--color-danger)' },
  ]
  const chartMax = Math.max(1, ...chartData.map(d => d.count))
  const hasChartData = chartData.some(d => d.count > 0)

  if (loading) {
    return <Loader label={t('common.loading')} />
  }

  const viewAllTenders = (
    <button className={styles.linkBtn} type="button" onClick={() => navigate(APP_ROUTES.TENDERS)}>
      <span>{t('private.dashboard.viewAll')}</span>
      <Icon name="arrowRight" size={14} />
    </button>
  )

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: t('components.breadcrumbs.workspace'), to: APP_ROUTES.DASHBOARD },
        { label: t('private.dashboard.title') },
      ]} />
      <PageHeader
        title={`${t('private.dashboard.title')}${user?.firstName ? `, ${user.firstName}` : ''}`}
        subtitle={t('private.dashboard.subtitle')}
        actions={
          <SubmitButton variant="secondary" onClick={loadData} disabled={loading}>
            <Icon name="refresh" size={16} />
            <span>{t('common.refresh')}</span>
          </SubmitButton>
        }
      />

      <div className={styles.kpiGrid}>
        {kpiData.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      <div className={styles.chartsSection}>
        <SectionCard title={t('private.dashboard.analysis')} icon="chart" actions={viewAllTenders}>
          {hasChartData ? (
            <div className={styles.chartBars}>
              {chartData.map(d => (
                <button
                  key={d.key}
                  type="button"
                  className={styles.chartBar}
                  onClick={() => navigate(`${APP_ROUTES.TENDERS}?status=${d.key}`)}
                  title={`${t(`status.${d.key}`)}: ${d.count}`}
                >
                  <span className={styles.chartCount}>{d.count}</span>
                  <span className={styles.chartTrack}>
                    <span
                      className={styles.chartFill}
                      style={{ height: `${Math.max(6, Math.round((d.count / chartMax) * 100))}%`, background: d.color }}
                    />
                  </span>
                  <span className={styles.chartLabel}>{t(`status.${d.key}`)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.chartsPlaceholder}>
              <Icon name="layers" size={40} className={styles.chartsIcon} />
              <p className={styles.chartsText}>{t('private.dashboard.noTenders')}</p>
              <span className={styles.chartsSub}>{t('private.dashboard.noTendersMessage')}</span>
            </div>
          )}
        </SectionCard>
      </div>

      <div className={styles.grid}>
        <SectionCard title={t('private.dashboard.expiringTenders')} noPadding actions={viewAllTenders}>
          {tenders.length === 0 ? (
            <EmptyState icon="inbox" title={t('private.dashboard.noTenders')} message={t('private.dashboard.noTendersMessage')} />
          ) : (
            <div className={styles.list}>
              {tenders.slice(0, 5).map((tender, index) => (
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

        <SectionCard
          title={t('private.dashboard.recentActivity')}
          noPadding
          actions={canViewAudit ? (
            <button className={styles.linkBtn} type="button" onClick={() => navigate(APP_ROUTES.AUDIT)}>
              <span>{t('private.dashboard.viewAll')}</span>
              <Icon name="arrowRight" size={14} />
            </button>
          ) : undefined}
        >
          {activities.length === 0 ? (
            <EmptyState icon="activity" title={t('private.dashboard.noActivity')} message={t('private.dashboard.noActivityMessage')} />
          ) : (
            <div className={styles.list}>
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={styles.activityItem}
                  style={{ animationDelay: `${index * 0.05}s`, cursor: activity.tenderId ? 'pointer' : 'default' }}
                  onClick={() => activity.tenderId && navigate(`/app/tenders/${activity.tenderId}`)}
                >
                  <div className={styles.activityIcon}>
                    <Icon name={activity.icon} size={16} />
                  </div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityText}>
                      {activity.user && <strong>{activity.user} </strong>}
                      {activity.action} {activity.target && <strong>{activity.target}</strong>}
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
        <SectionCard title={t('private.dashboard.priorityTasks')} noPadding actions={viewAllTenders}>
          {tasks.length === 0 ? (
            <EmptyState icon="inbox" title={t('private.dashboard.noTasks')} message={t('private.dashboard.noTasksMessage')} />
          ) : (
            <div className={styles.list}>
              {tasks.map((task, index) => {
                const statusCfg = taskStatusConfig[task.status] || taskStatusConfig.todo
                const prioCfg = priorityConfig[task.priority] || priorityConfig.medium
                return (
                  <div
                    key={task.id}
                    className={styles.taskItem}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => navigate(`/app/tenders/${task.tenderId}`)}
                  >
                    <div className={styles.taskLeft}>
                      <button
                        type="button"
                        className={styles.taskCheckbox}
                        onClick={e => handleToggleTask(e, task)}
                        title={t('private.tenderDetail.toggleStatus')}
                      >
                        <Icon name={task.status === 'done' ? 'circleCheck' : task.status === 'in_progress' ? 'circleDot' : 'circle'} size={18} />
                      </button>
                      <div className={styles.taskInfo}>
                        <span className={`${styles.taskTitle} ${task.status === 'done' ? styles.taskDone : ''}`}>
                          {task.title}
                        </span>
                        <span className={styles.taskMeta}>{task.tender}</span>
                      </div>
                    </div>
                    <div className={styles.taskRight}>
                      <StatusBadge label={statusCfg.label} variant={statusCfg.variant} />
                      <div className={styles.taskDue}>
                        <Icon name="calendar" size={12} />
                        {task.dueAt ? formatDate(task.dueAt) : '—'}
                      </div>
                      <div className={`${styles.taskPriority} ${styles[`priority${task.priority}`]}`}>
                        <Icon name={prioCfg.icon} size={12} />
                        {prioCfg.label}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
