import { useState } from 'react'
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
import styles from './UsersPage.module.css'

const mockUsers = [
  { id: 1, name: 'Marco Rossi', email: 'marco.rossi@opterra.it', role: 'manager', group: 'Tecnico', status: 'active', lastLoginAt: '2026-06-10T09:30:00Z' },
  { id: 2, name: 'Laura Bianchi', email: 'laura.bianchi@opterra.it', role: 'user', group: 'Commerciale', status: 'active', lastLoginAt: '2026-06-10T08:15:00Z' },
  { id: 3, name: 'Giuseppe Verdi', email: 'g.verdi@opterra.it', role: 'user', group: 'Tecnico', status: 'active', lastLoginAt: '2026-06-09T17:00:00Z' },
  { id: 4, name: 'Anna Neri', email: 'anna.neri@opterra.it', role: 'user', group: 'Amministrazione', status: 'inactive', lastLoginAt: '2026-05-20T10:00:00Z' },
  { id: 5, name: 'Francesco Blu', email: 'francesco.blu@opterra.it', role: 'manager', group: 'Commerciale', status: 'active', lastLoginAt: '2026-06-10T11:00:00Z' },
  { id: 6, name: 'Sofia Gialli', email: 'sofia.gialli@opterra.it', role: 'user', group: 'Tecnico', status: 'pending', lastLoginAt: null },
]

const mockGroups = [
  { id: 1, name: 'Tecnico', members: 3, description: 'Team tecnico e sviluppo offerte' },
  { id: 2, name: 'Commerciale', members: 2, description: 'Team commerciale e business development' },
  { id: 3, name: 'Amministrazione', members: 1, description: 'Team amministrativo e legale' },
]

const roleLabels = {
  manager: 'Manager',
  user: 'Utente',
  admin: 'Admin',
}

const statusConfig = {
  active: { label: 'Attivo', variant: 'success' },
  inactive: { label: 'Inattivo', variant: 'neutral' },
  pending: { label: 'In attesa', variant: 'warning' },
}

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeTab, setActiveTab] = useState('users')

  const filteredUsers = mockUsers.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    if (roleFilter && u.role !== roleFilter) return false
    if (statusFilter && u.status !== statusFilter) return false
    return true
  })

  const columns = [
    {
      label: 'Utente',
      key: 'name',
      render: row => (
        <div className={styles.userCell}>
          <div className={styles.userAvatar}>
            <Icon name="user" size={18} />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{row.name}</span>
            <span className={styles.userEmail}>{row.email}</span>
          </div>
        </div>
      ),
      width: '35%',
    },
    {
      label: 'Ruolo',
      key: 'role',
      render: row => (
        <span className={`${styles.roleBadge} ${styles[row.role]}`}>
          {roleLabels[row.role] || row.role}
        </span>
      ),
    },
    {
      label: 'Gruppo',
      key: 'group',
      render: row => (
        <span className={styles.groupTag}>
          <Icon name="layers" size={12} />
          {row.group}
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
      label: 'Ultimo accesso',
      key: 'lastLoginAt',
      render: row => (
        <span className={styles.lastLogin}>
          <Icon name="clock" size={12} />
          {row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString('it-IT') : 'Mai'}
        </span>
      ),
    },
    {
      label: 'Azioni',
      render: row => (
        <div className={styles.actionsCell}>
          <button className={styles.actionBtn} title="Modifica">
            <Icon name="edit" size={16} />
          </button>
          <button className={styles.actionBtn} title="Elimina">
            <Icon name="trash" size={16} />
          </button>
        </div>
      ),
      width: '80px',
    },
  ]

  function handleClearFilters() {
    setSearch('')
    setRoleFilter('')
    setStatusFilter('')
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Workspace', to: APP_ROUTES.DASHBOARD },
        { label: 'Utenti' },
      ]} />
      <PageHeader
        title="Utenti"
        subtitle="Gestisci utenti, ruoli e gruppi"
        actions={
          <SubmitButton variant="primary" onClick={() => {}} className={styles.inviteBtn}>
            <Icon name="plus" size={16} />
            <span>Invita Utente</span>
          </SubmitButton>
        }
      />

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`} onClick={() => setActiveTab('users')}>
          <Icon name="users" size={16} />
          <span>Utenti</span>
        </button>
        <button className={`${styles.tab} ${activeTab === 'groups' ? styles.tabActive : ''}`} onClick={() => setActiveTab('groups')}>
          <Icon name="layers" size={16} />
          <span>Gruppi</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            onClear={handleClearFilters}
            searchPlaceholder="Cerca per nome o email..."
            filters={[
              {
                placeholder: 'Tutti i ruoli',
                value: roleFilter,
                onChange: setRoleFilter,
                options: [
                  { value: 'manager', label: 'Manager' },
                  { value: 'user', label: 'Utente' },
                  { value: 'admin', label: 'Admin' },
                ],
              },
              {
                placeholder: 'Tutti gli stati',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'active', label: 'Attivo' },
                  { value: 'inactive', label: 'Inattivo' },
                  { value: 'pending', label: 'In attesa' },
                ],
              },
            ]}
          />

          <DataTable
            columns={columns}
            data={filteredUsers}
            emptyState={
              <EmptyState
                icon="users"
                title="Nessun utente trovato"
                message="Prova a modificare i filtri o invita un nuovo utente."
              />
            }
          />
        </>
      )}

      {activeTab === 'groups' && (
        <div className={styles.groupsGrid}>
          {mockGroups.map((group, index) => (
            <SectionCard key={group.id} title={group.name} actions={
              <div className={styles.groupActions}>
                <button className={styles.groupActionBtn} title="Modifica">
                  <Icon name="edit" size={16} />
                </button>
                <button className={styles.groupActionBtn} title="Elimina">
                  <Icon name="trash" size={16} />
                </button>
              </div>
            }>
              <div className={styles.groupContent} style={{ animationDelay: `${index * 0.1}s` }}>
                <p className={styles.groupDesc}>{group.description}</p>
                <div className={styles.groupMeta}>
                  <span className={styles.groupMembers}>
                    <Icon name="users" size={14} />
                    {group.members} membri
                  </span>
                </div>
              </div>
            </SectionCard>
          ))}
          <button className={styles.addGroupCard}>
            <Icon name="plus" size={32} />
            <span>Crea nuovo gruppo</span>
          </button>
        </div>
      )}
    </div>
  )
}
