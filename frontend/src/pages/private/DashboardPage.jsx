import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { KpiCard } from '../../components/cards/KpiCard'
import { SectionCard } from '../../components/cards/SectionCard'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { Loader } from '../../components/feedback/Loader'
import { EmptyState } from '../../components/feedback/EmptyState'
import Icon from '../../components/Icon'
import { APP_ROUTES, TENDER_STATUS_LABELS, TENDER_STATUS_COLORS } from '../../utils/constants'
import { formatCurrency } from '../../utils/format'
import { formatRelative, formatDate } from '../../utils/date'
import styles from './DashboardPage.module.css'

const kpiData = [
  { label: 'Gare Attive', value: '12', trend: 2, trendLabel: '+2 questa settimana', icon: 'briefcase' },
  { label: 'In Scadenza', value: '4', trend: -1, trendLabel: 'urgenti', icon: 'clock' },
  { label: 'Valore Totale', value: '€ 1.2M', trend: 8, trendLabel: 'vs mese scorso', icon: 'tag' },
  { label: 'Task Assegnati', value: '23', trend: 5, trendLabel: 'da completare', icon: 'checkCircle' },
]

const recentTenders = [
  { id: 1, title: 'Fornitura software procurement', issuer: 'Comune di Milano', status: 'active', deadlineAt: '2026-07-12T10:00:00Z', valueAmount: 120000 },
  { id: 2, title: 'Servizi di consulenza ICT', issuer: 'Regione Lazio', status: 'in_review', deadlineAt: '2026-06-28T10:00:00Z', valueAmount: 85000 },
  { id: 3, title: 'Manutenzione impianti sportivi', issuer: 'ASL Roma', status: 'draft', deadlineAt: '2026-08-01T10:00:00Z', valueAmount: 200000 },
  { id: 4, title: 'Fornitura arredi ufficio', issuer: 'Comune di Torino', status: 'won', deadlineAt: '2026-05-15T10:00:00Z', valueAmount: 45000 },
  { id: 5, title: 'Servizi di pulizia e sanificazione', issuer: 'Provincia di Milano', status: 'active', deadlineAt: '2026-06-25T10:00:00Z', valueAmount: 60000 },
]

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

const priorityConfig = {
  high: { label: 'Alta', color: 'danger', icon: 'circleAlert' },
  medium: { label: 'Media', color: 'warning', icon: 'circleDot' },
  low: { label: 'Bassa', color: 'info', icon: 'circle' },
}

const taskStatusConfig = {
  todo: { label: 'Da fare', variant: 'neutral' },
  in_progress: { label: 'In corso', variant: 'info' },
  done: { label: 'Completata', variant: 'success' },
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  if (loading) return <Loader label="Caricamento dashboard..." />

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Workspace', to: APP_ROUTES.DASHBOARD },
        { label: 'Dashboard' },
      ]} />
      <PageHeader title="Dashboard" subtitle="Panoramica del tuo workspace gare" />

      <div className={styles.kpiGrid}>
        {kpiData.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      <div className={styles.chartsSection}>
        <SectionCard title="Analisi e Trend" icon="chart">
          <div className={styles.chartsPlaceholder}>
            <Icon name="layers" size={40} className={styles.chartsIcon} />
            <p className={styles.chartsText}>Area grafici e analisi in arrivo</p>
            <span className={styles.chartsSub}>Dashboard interattiva con trend storici</span>
          </div>
        </SectionCard>
      </div>

      <div className={styles.grid}>
        <SectionCard title="Gare in scadenza" noPadding>
          <div className={styles.list}>
            {recentTenders.map((tender, index) => (
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
                    label={TENDER_STATUS_LABELS[tender.status]}
                    variant={TENDER_STATUS_COLORS[tender.status]}
                  />
                  <div className={styles.listValue}>{formatCurrency(tender.valueAmount)}</div>
                  <div className={styles.listDate}>
                    <Icon name="calendar" size={12} />
                    {formatRelative(tender.deadlineAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Attivita recenti" noPadding>
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
        </SectionCard>
      </div>

      <div className={styles.tasksSection}>
        <SectionCard title="Task Prioritari" noPadding>
          <div className={styles.list}>
            {tasks.length === 0 ? (
              <EmptyState icon="inbox" title="Nessun task" message="Tutti i task sono completati." />
            ) : (
              tasks.map((task, index) => (
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
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
