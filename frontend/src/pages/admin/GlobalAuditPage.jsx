import { useState } from 'react'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { DataTable } from '../../components/tables/DataTable'
import { FilterBar } from '../../components/tables/FilterBar'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import Icon from '../../components/Icon'
import { APP_ROUTES } from '../../utils/constants'
import { formatDateTime } from '../../utils/date'
import styles from './GlobalAuditPage.module.css'

const mockAudit = [
  { id: 1, tenant: 'Acme S.p.A.', user: 'Marco Rossi', action: 'create_tender', actionLabel: 'Creazione gara', target: 'Gara #1234', timestamp: '2026-06-11T09:30:00', type: 'create' },
  { id: 2, tenant: 'Beta Srl', user: 'Anna Bianchi', action: 'update_user', actionLabel: 'Modifica utente', target: 'Utente #45', timestamp: '2026-06-11T08:45:00', type: 'update' },
  { id: 3, tenant: '—', user: 'System', action: 'backup', actionLabel: 'Backup sistema', target: 'Database', timestamp: '2026-06-10T23:00:00', type: 'system' },
  { id: 4, tenant: 'Gamma Consulting', user: 'Luca Verdi', action: 'submit_proposal', actionLabel: 'Invio proposta', target: 'Proposta #88', timestamp: '2026-06-10T16:20:00', type: 'submit' },
  { id: 5, tenant: 'Acme S.p.A.', user: 'Giulia Neri', action: 'enable_user', actionLabel: 'Abilitazione utente', target: 'Utente #67', timestamp: '2026-06-10T11:10:00', type: 'update' },
  { id: 6, tenant: 'Beta Srl', user: 'Paolo Gialli', action: 'delete_plan', actionLabel: 'Eliminazione piano', target: 'Piano Legacy', timestamp: '2026-06-09T14:55:00', type: 'delete' },
  { id: 7, tenant: 'Delta Tech', user: 'Sara Blu', action: 'login', actionLabel: 'Accesso', target: 'Sessione web', timestamp: '2026-06-09T09:15:00', type: 'auth' },
  { id: 8, tenant: 'Acme S.p.A.', user: 'Marco Rossi', action: 'export_report', actionLabel: 'Esportazione report', target: 'Report Q2', timestamp: '2026-06-08T17:40:00', type: 'export' },
]

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

export function GlobalAuditPage() {
  const [audit] = useState(mockAudit)
  const [search, setSearch] = useState('')
  const [tenantFilter, setTenantFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [loading] = useState(false)

  const tenants = [...new Set(audit.map(a => a.tenant).filter(Boolean))]

  const filtered = audit.filter(a => {
    const matchSearch =
      a.user.toLowerCase().includes(search.toLowerCase()) ||
      a.actionLabel.toLowerCase().includes(search.toLowerCase()) ||
      a.target.toLowerCase().includes(search.toLowerCase())
    const matchTenant = tenantFilter ? a.tenant === tenantFilter : true
    const matchType = typeFilter ? a.type === typeFilter : true
    return matchSearch && matchTenant && matchType
  })

  const filters = [
    {
      placeholder: 'Tenant',
      value: tenantFilter,
      options: tenants.map(t => ({ label: t, value: t })),
      onChange: setTenantFilter,
    },
    {
      placeholder: 'Tipo azione',
      value: typeFilter,
      options: [
        { label: 'Creazione', value: 'create' },
        { label: 'Modifica', value: 'update' },
        { label: 'Eliminazione', value: 'delete' },
        { label: 'Sistema', value: 'system' },
        { label: 'Invio', value: 'submit' },
        { label: 'Autenticazione', value: 'auth' },
        { label: 'Esportazione', value: 'export' },
      ],
      onChange: setTypeFilter,
    },
  ]

  const columns = [
    { label: 'Azione', render: row => (
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
    { label: 'Tenant', render: row => (
      <span className={row.tenant === '—' ? styles.muted : styles.tenant}>
        {row.tenant === '—' ? (
          <span className={styles.systemTag}>
            <Icon name="shield" size={12} />
            System
          </span>
        ) : (
          <span className={styles.tenantTag}>
            <Icon name="building" size={12} />
            {row.tenant}
          </span>
        )}
      </span>
    )},
    { label: 'Utente', render: row => (
      <span className={styles.userCell}>
        <Icon name="user" size={14} />
        {row.user}
      </span>
    )},
    { label: 'Tipo', render: row => (
      <StatusBadge
        label={row.type}
        variant={typeVariant[row.type] || 'neutral'}
      />
    )},
    { label: 'Data e ora', render: row => (
      <span className={styles.timestamp}>
        <Icon name="clock" size={12} />
        {formatDateTime(row.timestamp)}
      </span>
    )},
  ]

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Admin', to: APP_ROUTES.ADMIN_DASHBOARD },
        { label: 'Audit' },
      ]} />
      <PageHeader
        title="Global Audit"
        subtitle="Log di tutte le azioni sulla piattaforma"
        actions={
          <button className={styles.actionBtn}>
            <Icon name="download" size={16} />
            <span>Esporta</span>
          </button>
        }
      />

      <div className={styles.toolbar}>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filters={filters}
          onClear={() => { setSearch(''); setTenantFilter(''); setTypeFilter('') }}
          searchPlaceholder="Cerca azione, utente o target..."
        />
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loadingBox}>
            <Icon name="refresh" size={32} className={styles.loadingIcon} />
            <span>Caricamento log...</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyState={
              <EmptyState
                title="Nessun log trovato"
                message="Prova a modificare i filtri di ricerca."
                icon="search"
              />
            }
          />
        )}
      </div>
    </div>
  )
}
