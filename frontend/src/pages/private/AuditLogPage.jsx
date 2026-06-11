import { useState } from 'react'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { DataTable } from '../../components/tables/DataTable'
import { FilterBar } from '../../components/tables/FilterBar'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SubmitButton } from '../../components/forms/SubmitButton'
import Icon from '../../components/Icon'
import { APP_ROUTES } from '../../utils/constants'
import styles from './AuditLogPage.module.css'

const mockLogs = [
  { id: 1, user: 'Marco Rossi', email: 'marco.rossi@opterra.it', action: 'create', resource: 'Tender', resourceName: 'Fornitura software procurement', createdAt: '2026-06-10T14:30:00Z', ip: '192.168.1.10' },
  { id: 2, user: 'Laura Bianchi', email: 'laura.bianchi@opterra.it', action: 'update', resource: 'Tender', resourceName: 'Manutenzione impianti', createdAt: '2026-06-10T11:15:00Z', ip: '192.168.1.12' },
  { id: 3, user: 'Giuseppe Verdi', email: 'g.verdi@opterra.it', action: 'upload', resource: 'Document', resourceName: 'Capitolato tecnico.pdf', createdAt: '2026-06-09T16:45:00Z', ip: '192.168.1.15' },
  { id: 4, user: 'Anna Neri', email: 'anna.neri@opterra.it', action: 'delete', resource: 'Task', resourceName: 'Task obsoleto', createdAt: '2026-06-09T09:20:00Z', ip: '192.168.1.18' },
  { id: 5, user: 'Marco Rossi', email: 'marco.rossi@opterra.it', action: 'login', resource: 'Session', resourceName: 'Login web', createdAt: '2026-06-08T08:30:00Z', ip: '192.168.1.10' },
  { id: 6, user: 'Francesco Blu', email: 'francesco.blu@opterra.it', action: 'invite', resource: 'User', resourceName: 'Sofia Gialli', createdAt: '2026-06-08T10:00:00Z', ip: '192.168.1.20' },
  { id: 7, user: 'Sofia Gialli', email: 'sofia.gialli@opterra.it', action: 'update', resource: 'Profile', resourceName: 'Profilo personale', createdAt: '2026-06-07T14:00:00Z', ip: '192.168.1.22' },
  { id: 8, user: 'Marco Rossi', email: 'marco.rossi@opterra.it', action: 'export', resource: 'Report', resourceName: 'Report gare Q2', createdAt: '2026-06-07T09:00:00Z', ip: '192.168.1.10' },
  { id: 9, user: 'Laura Bianchi', email: 'laura.bianchi@opterra.it', action: 'create', resource: 'Task', resourceName: 'Revisione offerta', createdAt: '2026-06-06T16:30:00Z', ip: '192.168.1.12' },
  { id: 10, user: 'Giuseppe Verdi', email: 'g.verdi@opterra.it', action: 'logout', resource: 'Session', resourceName: 'Logout web', createdAt: '2026-06-06T18:00:00Z', ip: '192.168.1.15' },
]

const actionConfig = {
  create: { label: 'Creazione', icon: 'plus', variant: 'success' },
  update: { label: 'Modifica', icon: 'edit', variant: 'info' },
  delete: { label: 'Eliminazione', icon: 'trash', variant: 'danger' },
  upload: { label: 'Upload', icon: 'upload', variant: 'info' },
  login: { label: 'Login', icon: 'checkCircle', variant: 'success' },
  logout: { label: 'Logout', icon: 'logout', variant: 'neutral' },
  invite: { label: 'Invito', icon: 'user', variant: 'pending' },
  export: { label: 'Export', icon: 'download', variant: 'warning' },
}

export function AuditLogPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = mockLogs.filter(log => {
    if (search && !log.user.toLowerCase().includes(search.toLowerCase()) && !log.resourceName.toLowerCase().includes(search.toLowerCase())) return false
    if (actionFilter && log.action !== actionFilter) return false
    if (dateFrom && new Date(log.createdAt) < new Date(dateFrom)) return false
    if (dateTo && new Date(log.createdAt) > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  const columns = [
    {
      label: 'Data',
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
      label: 'Utente',
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
      label: 'Azione',
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
      label: 'Risorsa',
      key: 'resource',
      render: row => (
        <div className={styles.resourceCell}>
          <span className={styles.resourceType}>{row.resource}</span>
          <span className={styles.resourceName}>{row.resourceName}</span>
        </div>
      ),
    },
    {
      label: 'IP',
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

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Workspace', to: APP_ROUTES.DASHBOARD },
        { label: 'Audit Log' },
      ]} />
      <PageHeader
        title="Audit Log"
        subtitle="Traccia tutte le azioni effettuate nel workspace"
        actions={
          <SubmitButton variant="secondary" onClick={() => {}} className={styles.exportBtn}>
            <Icon name="download" size={16} />
            <span>Esporta</span>
          </SubmitButton>
        }
      />

      <div className={styles.dateFilter}>
        <div className={styles.dateInputGroup}>
          <span className={styles.dateLabel}>
            <Icon name="calendar" size={14} />
            Dal
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
            Al
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
        searchPlaceholder="Cerca per utente o risorsa..."
        filters={[
          {
            placeholder: 'Tutte le azioni',
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
            title="Nessun log trovato"
            message="Prova a modificare i filtri o il range di date."
          />
        }
      />
    </div>
  )
}
