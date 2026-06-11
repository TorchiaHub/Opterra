import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { DataTable } from '../../components/tables/DataTable'
import { FilterBar } from '../../components/tables/FilterBar'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { Loader } from '../../components/feedback/Loader'
import { SubmitButton } from '../../components/forms/SubmitButton'
import Icon from '../../components/Icon'
import {
  APP_ROUTES, TENDER_STATUS,
  TENDER_STATUS_COLORS,
} from '../../utils/constants'
import { formatCurrency } from '../../utils/format'
import { formatDate } from '../../utils/date'
import { getTenders, createTender } from '../../api/tenders.api'
import { useAuth } from '../../hooks/useAuth'
import styles from './TendersListPage.module.css'

export function TendersListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [tenders, setTenders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTender, setNewTender] = useState({
    title: '', issuer: '', type: '', deadlineAt: '', valueAmount: '', description: '',
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchTenders = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getTenders({ page, pageSize: 20, search, status: statusFilter, type: typeFilter })
        setTenders(result.items ?? result)
        setMeta(result.meta ?? null)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTenders()
  }, [search, statusFilter, typeFilter, page])

  let sorted = [...tenders]
  if (sortKey) {
    sorted = [...tenders].sort((a, b) => {
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
      label: t('private.tenders.columns.tender'),
      key: 'title',
      sortable: true,
      onSort: () => handleSort('title'),
      render: row => <strong className={styles.rowTitle}>{row.title}</strong>,
      width: '30%',
    },
    {
      label: t('private.tenders.columns.issuer'),
      key: 'issuer',
      sortable: true,
      onSort: () => handleSort('issuer'),
      render: row => <span className={styles.rowMeta}>{row.issuer}</span>,
    },
    {
      label: t('private.tenders.columns.type'),
      key: 'type',
      sortable: true,
      onSort: () => handleSort('type'),
      render: row => (
        <span className={styles.typeTag}>
          <Icon name="tag" size={12} />
          {t(`tenderTypes.${row.type}`) || row.type}
        </span>
      ),
    },
    {
      label: t('private.tenders.columns.status'),
      key: 'status',
      render: row => (
        <StatusBadge
          label={t(`status.${row.status}`)}
          variant={TENDER_STATUS_COLORS[row.status]}
        />
      ),
    },
    {
      label: t('private.tenders.columns.deadline'),
      key: 'deadline_at',
      sortable: true,
      onSort: () => handleSort('deadline_at'),
      render: row => (
        <span className={styles.rowDate}>
          <Icon name="calendar" size={12} />
          {formatDate(row.deadline_at)}
        </span>
      ),
    },
    {
      label: t('private.tenders.columns.value'),
      key: 'value_amount',
      sortable: true,
      onSort: () => handleSort('value_amount'),
      render: row => <span className={styles.rowValue}>{formatCurrency(row.value_amount)}</span>,
      width: '120px',
    },
  ]

  async function handleCreateTender() {
    if (!newTender.title.trim() || !newTender.issuer.trim()) return
    setCreating(true)
    try {
      await createTender({
        title: newTender.title.trim(),
        issuer: newTender.issuer.trim(),
        type: newTender.type || undefined,
        deadlineAt: newTender.deadlineAt || undefined,
        valueAmount: newTender.valueAmount ? Number(newTender.valueAmount) : undefined,
        description: newTender.description.trim() || undefined,
      })
      setShowCreateModal(false)
      setNewTender({ title: '', issuer: '', type: '', deadlineAt: '', valueAmount: '', description: '' })
      const result = await getTenders({ page, pageSize: 20, search, status: statusFilter, type: typeFilter })
      setTenders(result.items ?? result)
      setMeta(result.meta ?? null)
    } catch {
      // silently fail
    } finally {
      setCreating(false)
    }
  }

  function handleClearFilters() {
    setSearch('')
    setStatusFilter('')
    setTypeFilter('')
    setSortKey(null)
    setSortDir('asc')
    setPage(1)
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <EmptyState
          icon="alertCircle"
          title={t('private.tenders.errorTitle')}
          message={t('private.tenders.errorMessage')}
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: t('components.breadcrumbs.workspace'), to: APP_ROUTES.DASHBOARD },
        { label: t('private.tenders.title') },
      ]} />
      <PageHeader
        title={t('private.tenders.title')}
        subtitle={t('private.tenders.subtitle')}
        actions={
          <SubmitButton variant="primary" onClick={() => setShowCreateModal(true)} className={styles.newBtn}>
            <Icon name="plus" size={16} />
            <span>{t('private.tenders.newTender')}</span>
          </SubmitButton>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onClear={handleClearFilters}
        searchPlaceholder={t('private.tenders.searchPlaceholder')}
        filters={[
          {
            placeholder: t('private.tenders.allStatuses'),
            value: statusFilter,
            onChange: setStatusFilter,
            options: Object.entries(TENDER_STATUS).map(([, value]) => ({ value, label: t(`status.${value}`) })),
          },
          {
            placeholder: t('private.tenders.allTypes'),
            value: typeFilter,
            onChange: setTypeFilter,
            options: Object.entries({ rfp: 'rfp', rfq: 'rfq', tender: 'tender', bando: 'bando' }).map(([, value]) => ({ value, label: t(`tenderTypes.${value}`) })),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={sorted}
        onRowClick={row => navigate(`/app/tenders/${row.id}`)}
        emptyState={
          <EmptyState
            icon="inbox"
            title={t('private.tenders.emptyTitle')}
            message={t('private.tenders.emptyMessage')}
          />
        }
      />

      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{t('private.tenders.newTender')}</h2>
              <button className={styles.modalClose} onClick={() => setShowCreateModal(false)}>
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.modalLabel}>
                <span>{t('private.tenders.form.title')}</span>
                <input
                  className={styles.modalInput}
                  value={newTender.title}
                  onChange={e => setNewTender(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('private.tenders.form.titlePlaceholder')}
                />
              </label>
              <label className={styles.modalLabel}>
                <span>{t('private.tenders.form.issuer')}</span>
                <input
                  className={styles.modalInput}
                  value={newTender.issuer}
                  onChange={e => setNewTender(prev => ({ ...prev, issuer: e.target.value }))}
                  placeholder={t('private.tenders.form.issuerPlaceholder')}
                />
              </label>
              <label className={styles.modalLabel}>
                <span>{t('private.tenders.form.type')}</span>
                <select
                  className={styles.modalInput}
                  value={newTender.type}
                  onChange={e => setNewTender(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="">{t('private.tenders.form.selectType')}</option>
                  <option value="rfp">{t('tenderTypes.rfp')}</option>
                  <option value="rfq">{t('tenderTypes.rfq')}</option>
                  <option value="tender">{t('tenderTypes.tender')}</option>
                  <option value="bando">{t('tenderTypes.bando')}</option>
                </select>
              </label>
              <label className={styles.modalLabel}>
                <span>{t('private.tenders.form.deadline')}</span>
                <input
                  className={styles.modalInput}
                  type="date"
                  value={newTender.deadlineAt}
                  onChange={e => setNewTender(prev => ({ ...prev, deadlineAt: e.target.value }))}
                />
              </label>
              <label className={styles.modalLabel}>
                <span>{t('private.tenders.form.value')}</span>
                <input
                  className={styles.modalInput}
                  type="number"
                  value={newTender.valueAmount}
                  onChange={e => setNewTender(prev => ({ ...prev, valueAmount: e.target.value }))}
                  placeholder={t('private.tenders.form.valuePlaceholder')}
                />
              </label>
              <label className={styles.modalLabel}>
                <span>{t('private.tenders.form.description')}</span>
                <textarea
                  className={styles.modalTextarea}
                  value={newTender.description}
                  onChange={e => setNewTender(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('private.tenders.form.descriptionPlaceholder')}
                  rows={4}
                />
              </label>
            </div>
            <div className={styles.modalFooter}>
              <SubmitButton variant="secondary" onClick={() => setShowCreateModal(false)}>
                {t('common.cancel')}
              </SubmitButton>
              <SubmitButton variant="primary" onClick={handleCreateTender} disabled={creating}>
                {creating ? t('common.loading') : t('common.create')}
              </SubmitButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}