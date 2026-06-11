import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { DataTable } from '../../components/tables/DataTable'
import { FilterBar } from '../../components/tables/FilterBar'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SubmitButton } from '../../components/forms/SubmitButton'
import Icon from '../../components/Icon'
import {
  APP_ROUTES, TENDER_STATUS, TENDER_STATUS_LABELS,
  TENDER_STATUS_COLORS, TENDER_TYPE_LABELS,
} from '../../utils/constants'
import { formatCurrency } from '../../utils/format'
import { formatDate } from '../../utils/date'
import styles from './TendersListPage.module.css'

const mockTenders = [
  { id: 1, title: 'Fornitura software procurement', issuer: 'Comune di Milano', type: 'rfp', status: 'active', deadlineAt: '2026-07-12T10:00:00Z', valueAmount: 120000 },
  { id: 2, title: 'Servizi di consulenza ICT', issuer: 'Regione Lazio', type: 'rfq', status: 'in_review', deadlineAt: '2026-06-28T10:00:00Z', valueAmount: 85000 },
  { id: 3, title: 'Manutenzione impianti sportivi', issuer: 'ASL Roma', type: 'tender', status: 'draft', deadlineAt: '2026-08-01T10:00:00Z', valueAmount: 200000 },
  { id: 4, title: 'Fornitura arredi ufficio', issuer: 'Comune di Torino', type: 'bando', status: 'won', deadlineAt: '2026-05-15T10:00:00Z', valueAmount: 45000 },
  { id: 5, title: 'Servizi di pulizia e sanificazione', issuer: 'Provincia di Milano', type: 'tender', status: 'lost', deadlineAt: '2026-04-30T10:00:00Z', valueAmount: 60000 },
  { id: 6, title: 'Fornitura hardware rete', issuer: 'Comune di Bologna', type: 'rfq', status: 'active', deadlineAt: '2026-07-20T10:00:00Z', valueAmount: 95000 },
  { id: 7, title: 'Consulenza cybersecurity', issuer: 'INPS', type: 'rfp', status: 'submitted', deadlineAt: '2026-06-15T10:00:00Z', valueAmount: 320000 },
  { id: 8, title: 'Manutenzione ascensori', issuer: 'Regione Piemonte', type: 'bando', status: 'cancelled', deadlineAt: '2026-06-10T10:00:00Z', valueAmount: 15000 },
]

export function TendersListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  let filtered = mockTenders.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.issuer.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && t.status !== statusFilter) return false
    if (typeFilter && t.type !== typeFilter) return false
    return true
  })

  if (sortKey) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const columns = [
    {
      label: 'Gara',
      key: 'title',
      sortable: true,
      onSort: () => handleSort('title'),
      render: row => <strong className={styles.rowTitle}>{row.title}</strong>,
      width: '30%',
    },
    {
      label: 'Ente',
      key: 'issuer',
      sortable: true,
      onSort: () => handleSort('issuer'),
      render: row => <span className={styles.rowMeta}>{row.issuer}</span>,
    },
    {
      label: 'Tipo',
      key: 'type',
      sortable: true,
      onSort: () => handleSort('type'),
      render: row => (
        <span className={styles.typeTag}>
          <Icon name="tag" size={12} />
          {TENDER_TYPE_LABELS[row.type] || row.type}
        </span>
      ),
    },
    {
      label: 'Stato',
      key: 'status',
      render: row => (
        <StatusBadge
          label={TENDER_STATUS_LABELS[row.status]}
          variant={TENDER_STATUS_COLORS[row.status]}
        />
      ),
    },
    {
      label: 'Scadenza',
      key: 'deadlineAt',
      sortable: true,
      onSort: () => handleSort('deadlineAt'),
      render: row => (
        <span className={styles.rowDate}>
          <Icon name="calendar" size={12} />
          {formatDate(row.deadlineAt)}
        </span>
      ),
    },
    {
      label: 'Valore',
      key: 'valueAmount',
      sortable: true,
      onSort: () => handleSort('valueAmount'),
      render: row => <span className={styles.rowValue}>{formatCurrency(row.valueAmount)}</span>,
      width: '120px',
    },
  ]

  function handleClearFilters() {
    setSearch('')
    setStatusFilter('')
    setTypeFilter('')
    setSortKey(null)
    setSortDir('asc')
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Workspace', to: APP_ROUTES.DASHBOARD },
        { label: 'Gare' },
      ]} />
      <PageHeader
        title="Gare"
        subtitle="Gestisci le gare del tuo team"
        actions={
          <SubmitButton variant="primary" onClick={() => {}} className={styles.newBtn}>
            <Icon name="plus" size={16} />
            <span>Nuova Gara</span>
          </SubmitButton>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onClear={handleClearFilters}
        searchPlaceholder="Cerca per titolo o ente..."
        filters={[
          {
            placeholder: 'Tutti gli stati',
            value: statusFilter,
            onChange: setStatusFilter,
            options: Object.entries(TENDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
          },
          {
            placeholder: 'Tutti i tipi',
            value: typeFilter,
            onChange: setTypeFilter,
            options: Object.entries(TENDER_TYPE_LABELS).map(([value, label]) => ({ value, label })),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={row => navigate(`/app/tenders/${row.id}`)}
        emptyState={
          <EmptyState
            icon="inbox"
            title="Nessuna gara trovata"
            message="Prova a modificare i filtri o crea una nuova gara."
          />
        }
      />
    </div>
  )
}
