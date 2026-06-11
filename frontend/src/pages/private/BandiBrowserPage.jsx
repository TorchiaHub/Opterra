import { useState, useEffect, useCallback } from 'react'
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
import { SectionCard } from '../../components/cards/SectionCard'
import Icon from '../../components/Icon'
import { APP_ROUTES } from '../../utils/constants'
import { formatDate } from '../../utils/date'
import { getDiscoveredTenders, updateDiscoveredTenderStatus } from '../../api/scraping.api'
import styles from './BandiBrowserPage.module.css'

const sourceConfig = {
  'ANAC': { icon: 'globe', color: 'info' },
  'Toscana Appalti': { icon: 'building', color: 'success' },
}

export function BandiBrowserPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const fetchTenders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDiscoveredTenders()
      setResults((Array.isArray(data) ? data : []).map(row => {
        let tags = []
        try {
          tags = Array.isArray(row.ai_tags_json) ? row.ai_tags_json : JSON.parse(row.ai_tags_json || '[]')
        } catch { /* tags non disponibili */ }
        return {
          id: row.id,
          title: row.title || '',
          issuer: row.issuer || '—',
          source: row.source_name || '—',
          category: tags[0] || '—',
          relevanceScore: row.ai_relevance_score != null ? Math.round(Number(row.ai_relevance_score)) : 0,
          deadlineAt: row.deadline_at,
          status: row.status,
          convertedTenderId: row.converted_tender_id,
        }
      }))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTenders()
  }, [fetchTenders])

  const statusConfig = {
    new: { label: t('private.bandiBrowser.statusLabels.new'), variant: 'info' },
    saved: { label: t('private.bandiBrowser.statusLabels.saved'), variant: 'success' },
    dismissed: { label: t('private.bandiBrowser.statusLabels.dismissed'), variant: 'neutral' },
  }

  const filtered = results.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.issuer.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && r.status !== statusFilter) return false
    if (categoryFilter && r.category !== categoryFilter) return false
    return true
  })

  const categories = [...new Set(results.map(r => r.category))]

  async function handleSave(id) {
    try {
      await updateDiscoveredTenderStatus(id, { status: 'saved' })
      setResults(prev => prev.map(r => r.id === id ? { ...r, status: 'saved' } : r))
    } catch (err) {
    }
  }

  async function handleDismiss(id) {
    try {
      await updateDiscoveredTenderStatus(id, { status: 'dismissed' })
      setResults(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r))
    } catch (err) {
    }
  }

  const columns = [
    {
      label: t('private.bandiBrowser.columns.tender'),
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
      label: t('private.bandiBrowser.columns.source'),
      key: 'source',
      render: row => (
        <span className={styles.sourceTag}>
          <Icon name={sourceConfig[row.source]?.icon || 'globe'} size={12} />
          {row.source}
        </span>
      ),
    },
    {
      label: t('private.bandiBrowser.columns.category'),
      key: 'category',
      render: row => (
        <span className={styles.categoryTag}>{row.category}</span>
      ),
    },
    {
      label: t('private.bandiBrowser.columns.relevance'),
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
      label: t('private.bandiBrowser.columns.deadline'),
      key: 'deadlineAt',
      render: row => (
        <span className={styles.dateCell}>
          <Icon name="calendar" size={12} />
          {formatDate(row.deadlineAt)}
        </span>
      ),
    },
    {
      label: t('private.bandiBrowser.columns.status'),
      key: 'status',
      render: row => {
        const cfg = statusConfig[row.status] || statusConfig.new
        return <StatusBadge label={cfg.label} variant={cfg.variant} />
      },
    },
    {
      label: t('private.bandiBrowser.columns.actions'),
      render: row => (
        <div className={styles.actionsCell}>
          {row.status === 'new' && (
            <>
              <button className={styles.saveBtn} onClick={e => { e.stopPropagation(); handleSave(row.id); }} title={t('private.bandiBrowser.actions.saveTitle')}>
                <Icon name="plus" size={14} />
                <span>{t('private.bandiBrowser.actions.save')}</span>
              </button>
              <button className={styles.dismissBtn} onClick={e => { e.stopPropagation(); handleDismiss(row.id); }} title={t('private.bandiBrowser.actions.dismiss')}>
                <Icon name="close" size={14} />
              </button>
            </>
          )}
          {row.status === 'saved' && row.convertedTenderId && (
            <button className={styles.viewBtn} onClick={e => { e.stopPropagation(); navigate(`/app/tenders/${row.convertedTenderId}`); }} title={t('private.bandiBrowser.actions.viewTitle')}>
              <Icon name="eye" size={14} />
              <span>{t('private.bandiBrowser.actions.view')}</span>
            </button>
          )}
          {row.status === 'dismissed' && (
            <button className={styles.saveBtn} onClick={e => { e.stopPropagation(); handleSave(row.id); }} title={t('private.bandiBrowser.actions.restoreTitle')}>
              <Icon name="refresh" size={14} />
              <span>{t('private.bandiBrowser.actions.restore')}</span>
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
          title={t('common.error')}
          message={error.message}
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: t('components.breadcrumbs.workspace'), to: APP_ROUTES.DASHBOARD },
        { label: t('private.bandiBrowser.title') },
      ]} />
      <PageHeader
        title={t('private.bandiBrowser.title')}
        subtitle={t('private.bandiBrowser.subtitle')}
        actions={
          <SubmitButton variant="secondary" onClick={fetchTenders} className={styles.refreshBtn}>
            <Icon name="refresh" size={16} />
            <span>{t('private.bandiBrowser.refresh')}</span>
          </SubmitButton>
        }
      />

      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <Icon name="inbox" size={20} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{newCount}</span>
            <span className={styles.statLabel}>{t('private.bandiBrowser.stats.new')}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Icon name="checkCircle" size={20} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{savedCount}</span>
            <span className={styles.statLabel}>{t('private.bandiBrowser.stats.saved')}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Icon name="xCircle" size={20} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{dismissedCount}</span>
            <span className={styles.statLabel}>{t('private.bandiBrowser.stats.dismissed')}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Icon name="star" size={20} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{results.length ? Math.round(results.reduce((acc, r) => acc + r.relevanceScore, 0) / results.length) : 0}%</span>
            <span className={styles.statLabel}>{t('private.bandiBrowser.stats.avgRelevance')}</span>
          </div>
        </div>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onClear={handleClearFilters}
        searchPlaceholder={t('private.bandiBrowser.searchPlaceholder')}
        filters={[
          {
            placeholder: t('private.bandiBrowser.allStatuses'),
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'new', label: t('private.bandiBrowser.statusLabels.new') },
              { value: 'saved', label: t('private.bandiBrowser.statusLabels.saved') },
              { value: 'dismissed', label: t('private.bandiBrowser.statusLabels.dismissed') },
            ],
          },
          {
            placeholder: t('private.bandiBrowser.allCategories'),
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
            title={t('private.bandiBrowser.emptyTitle')}
            message={t('private.bandiBrowser.emptyMessage')}
          />
        }
      />
    </div>
  )
}