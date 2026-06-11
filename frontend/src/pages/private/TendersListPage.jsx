import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { DataTable } from '../../components/tables/DataTable'
import { FilterBar } from '../../components/tables/FilterBar'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { SubmitButton } from '../../components/forms/SubmitButton'
import { EmptyState } from '../../components/feedback/EmptyState'
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
]

export function TendersListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const filtered = mockTenders.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.issuer.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && t.status !== statusFilter) return false
    if (typeFilter && t.type !== typeFilter) return false
    return true
  })

  const columns = [
    { label: 'Gara', key: 'title', render: row => <strong>{row.title}</strong>, width: '30%' },
    { label: 'Ente', key: 'issuer' },
    { label: 'Tipo', render: row => TENDER_TYPE_LABELS[row.type] || row.type },
    { label: 'Stato', render: row => <StatusBadge label={TENDER_STATUS_LABELS[row.status]} variant={TENDER_STATUS_COLORS[row.status]} /> },
    { label: 'Scadenza', render: row => formatDate(row.deadlineAt) },
    { label: 'Valore', render: row => formatCurrency(row.valueAmount), width: '120px' },
  ]

  function handleClearFilters() {
    setSearch('')
    setStatusFilter('')
    setTypeFilter('')
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
          <SubmitButton variant="primary" onClick={() => {}}>
            + Nuova gara
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
            icon="📋"
            title="Nessuna gara trovata"
            message="Prova a modificare i filtri o crea una nuova gara."
          />
        }
      />
    </div>
  )
}
