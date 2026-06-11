import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { DataTable } from '../../components/tables/DataTable'
import { FilterBar } from '../../components/tables/FilterBar'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SubmitButton } from '../../components/forms/SubmitButton'
import { SectionCard } from '../../components/cards/SectionCard'
import Icon from '../../components/Icon'
import { APP_ROUTES } from '../../utils/constants'
import { formatDate } from '../../utils/date'
import styles from './BandiBrowserPage.module.css'

const mockResults = [
  { id: 1, title: 'Fornitura piattaforma digitalizzazione appalti', issuer: 'Comune di Firenze', source: 'ANAC', publishedAt: '2026-06-10T10:00:00Z', deadlineAt: '2026-07-20T10:00:00Z', category: 'Informatica', relevanceScore: 95, status: 'new', valueAmount: 450000 },
  { id: 2, title: 'Servizi cloud e hosting', issuer: 'Regione Toscana', source: 'Toscana Appalti', publishedAt: '2026-06-09T10:00:00Z', deadlineAt: '2026-07-15T10:00:00Z', category: 'Cloud', relevanceScore: 88, status: 'new', valueAmount: 120000 },
  { id: 3, title: 'Manutenzione edifici scolastici', issuer: 'Provincia di Pisa', source: 'ANAC', publishedAt: '2026-06-08T10:00:00Z', deadlineAt: '2026-08-05T10:00:00Z', category: 'Edilizia', relevanceScore: 42, status: 'dismissed', valueAmount: 80000 },
  { id: 4, title: 'Consulenza GDPR e privacy', issuer: 'ASL Firenze', source: 'Toscana Appalti', publishedAt: '2026-06-07T10:00:00Z', deadlineAt: '2026-06-30T10:00:00Z', category: 'Legale', relevanceScore: 73, status: 'saved', valueAmount: 35000 },
  { id: 5, title: 'Fornitura workstation e server', issuer: 'Universita di Siena', source: 'ANAC', publishedAt: '2026-06-06T10:00:00Z', deadlineAt: '2026-07-10T10:00:00Z', category: 'Hardware', relevanceScore: 81, status: 'new', valueAmount: 95000 },
  { id: 6, title: 'Sviluppo app mobile turismo', issuer: 'Comune di Lucca', source: 'Toscana Appalti', publishedAt: '2026-06-05T10:00:00Z', deadlineAt: '2026-07-25T10:00:00Z', category: 'Mobile', relevanceScore: 67, status: 'new', valueAmount: 60000 },
  { id: 7, title: 'Servizi di formazione IT', issuer: 'Regione Umbria', source: 'ANAC', publishedAt: '2026-06-04T10:00:00Z', deadlineAt: '2026-07-18T10:00:00Z', category: 'Formazione', relevanceScore: 55, status: 'dismissed', valueAmount: 25000 },
  { id: 8, title: 'Fornitura software CRM', issuer: 'Comune di Perugia', source: 'ANAC', publishedAt: '2026-06-03T10:00:00Z', deadlineAt: '2026-07-12T10:00:00Z', category: 'Informatica', relevanceScore: 92, status: 'new', valueAmount: 180000 },
]

const statusConfig = {
  new: { label: 'Nuovo', variant: 'info' },
  saved: { label: 'Salvato', variant: 'success' },
  dismissed: { label: 'Ignorato', variant: 'neutral' },
}

const sourceConfig = {
  'ANAC': { icon: 'globe', color: 'info' },
  'Toscana Appalti': { icon: 'building', color: 'success' },
}

export function BandiBrowserPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [results, setResults] = useState(mockResults)

  const filtered = results.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.issuer.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && r.status !== statusFilter) return false
    if (categoryFilter && r.category !== categoryFilter) return false
    return true
  })

  const categories = [...new Set(mockResults.map(r => r.category))]

  function handleSave(id) {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status: 'saved' } : r))
  }

  function handleDismiss(id) {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r))
  }

  const columns = [
    {
      label: 'Bando',
      key: 'title',
      render: row => (
        <div className={styles.tenderCell}>
          <span className={styles.tenderTitle}>{row.title}</span>
          <span className={styles.tenderIssuer}>{row.issuer}</span>
        </div>
      ),
      width: '35%',
    },
    {
      label: 'Fonte',
      key: 'source',
      render: row => (
        <span className={styles.sourceTag}>
          <Icon name={sourceConfig[row.source]?.icon || 'globe'} size={12} />
          {row.source}
        </span>
      ),
    },
    {
      label: 'Categoria',
      key: 'category',
      render: row => (
        <span className={styles.categoryTag}>{row.category}</span>
      ),
    },
    {
      label: 'Rilevanza',
      key: 'relevanceScore',
      render: row => (
        <div className={styles.relevanceCell}>
          <div className={styles.relevanceBar}>
            <div
              className={styles.relevanceFill}
              style={{ width: `${row.relevanceScore}%` }}
            />
          </div>
          <span className={`${styles.relevanceScore} ${row.relevanceScore >= 80 ? styles.scoreHigh : row.relevanceScore >= 60 ? styles.scoreMedium : styles.scoreLow}`}>
            {row.relevanceScore}%
          </span>
        </div>
      ),
    },
    {
      label: 'Scadenza',
      key: 'deadlineAt',
      render: row => (
        <span className={styles.dateCell}>
          <Icon name="calendar" size={12} />
          {formatDate(row.deadlineAt)}
        </span>
      ),
    },
    {
      label: 'Stato',
      key: 'status',
      render: row => (
        <StatusBadge label={statusConfig[row.status].label} variant={statusConfig[row.status].variant} />
      ),
    },
    {
      label: 'Azioni',
      render: row => (
        <div className={styles.actionsCell}>
          {row.status === 'new' && (
            <>
              <button className={styles.saveBtn} onClick={e => { e.stopPropagation(); handleSave(row.id); }} title="Salva come gara">
                <Icon name="plus" size={14} />
                <span>Salva</span>
              </button>
              <button className={styles.dismissBtn} onClick={e => { e.stopPropagation(); handleDismiss(row.id); }} title="Ignora">
                <Icon name="close" size={14} />
              </button>
            </>
          )}
          {row.status === 'saved' && (
            <button className={styles.viewBtn} onClick={e => { e.stopPropagation(); navigate(`/app/tenders/${row.id}`); }} title="Vedi gara">
              <Icon name="eye" size={14} />
              <span>Vedi</span>
            </button>
          )}
          {row.status === 'dismissed' && (
            <button className={styles.saveBtn} onClick={e => { e.stopPropagation(); handleSave(row.id); }} title="Ripristina">
              <Icon name="refresh" size={14} />
              <span>Ripristina</span>
            </button>
          )}
        </div>
      ),
      width: '140px',
    },
  ]

  function handleClearFilters() {
    setSearch('')
    setStatusFilter('')
    setCategoryFilter('')
  }

  const newCount = results.filter(r => r.status === 'new').length
  const savedCount = results.filter(r => r.status === 'saved').length
  const dismissedCount = results.filter(r => r.status === 'dismissed').length

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Workspace', to: APP_ROUTES.DASHBOARD },
        { label: 'Scopri Gare' },
      ]} />
      <PageHeader
        title="Scopri Gare"
        subtitle="Bandi e opportunita rilevanti per il tuo business"
        actions={
          <SubmitButton variant="secondary" onClick={() => {}} className={styles.refreshBtn}>
            <Icon name="refresh" size={16} />
            <span>Aggiorna</span>
          </SubmitButton>
        }
      />

      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <Icon name="inbox" size={20} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{newCount}</span>
            <span className={styles.statLabel}>Nuovi</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Icon name="checkCircle" size={20} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{savedCount}</span>
            <span className={styles.statLabel}>Salvati</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Icon name="xCircle" size={20} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{dismissedCount}</span>
            <span className={styles.statLabel}>Ignorati</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Icon name="star" size={20} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{Math.round(results.reduce((acc, r) => acc + r.relevanceScore, 0) / results.length)}%</span>
            <span className={styles.statLabel}>Rilevanza media</span>
          </div>
        </div>
      </div>

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
            options: [
              { value: 'new', label: 'Nuovo' },
              { value: 'saved', label: 'Salvato' },
              { value: 'dismissed', label: 'Ignorato' },
            ],
          },
          {
            placeholder: 'Tutte le categorie',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categories.map(c => ({ value: c, label: c })),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        emptyState={
          <EmptyState
            icon="search"
            title="Nessun bando trovato"
            message="Prova a modificare i filtri o aggiorna i risultati."
          />
        }
      />
    </div>
  )
}
