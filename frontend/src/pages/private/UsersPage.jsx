import { useState, useEffect, useCallback } from 'react'
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
import { getUsers, getGroups, inviteUser, createUser, updateUserRole, deleteUser } from '../../api/users.api'
import { useAuth } from '../../hooks/useAuth'
import styles from './UsersPage.module.css'

export function UsersPage() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeTab, setActiveTab] = useState('users')

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUsers()
      const statusMap = { active: 'active', disabled: 'inactive', invited: 'pending', pending: 'pending' }
      setUsers((Array.isArray(data) ? data : []).map(row => ({
        id: row.id,
        name: [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email,
        email: row.email,
        role: row.role_code,
        status: statusMap[row.status] || 'active',
        lastLoginAt: row.last_login_at,
        group: row.group_name || '—',
      })))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchGroups = useCallback(async () => {
    try {
      const data = await getGroups()
      setGroups((Array.isArray(data) ? data : []).map(g => ({
        id: g.id,
        name: g.name,
        description: g.description || '',
        members: Number(g.member_count || 0),
      })))
    } catch (err) {
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchUsers(), fetchGroups()])
  }, [fetchUsers, fetchGroups])

  async function handleInvite() {
    const email = window.prompt(t('private.users.inviteUser'))
    if (!email) return
    try {
      await inviteUser({ email, roleCode: 'user' })
      await fetchUsers()
    } catch (err) {
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('private.users.actionTitles.delete'))) return
    try {
      await deleteUser(id)
      await fetchUsers()
    } catch (err) {
    }
  }

  const [showModal, setShowModal] = useState(false)
  const [formEmail, setFormEmail] = useState('')
  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState('user')
  const [creatingUser, setCreatingUser] = useState(false)
  const [createError, setCreateError] = useState(null)

  function getTenantSlug() {
    if (currentUser?.company?.slug) return currentUser.company.slug
    const domain = currentUser?.email?.split('@')[1]
    if (domain) return domain.split('.')[0]
    return 'tenant'
  }

  function resetForm() {
    setFormEmail('')
    setFormFirstName('')
    setFormLastName('')
    setFormPassword('')
    setFormRole('user')
    setCreateError(null)
  }

  async function handleCreateUser(e) {
    e.preventDefault()
    setCreatingUser(true)
    setCreateError(null)
    try {
      await createUser({
        email: formEmail,
        firstName: formFirstName,
        lastName: formLastName,
        password: formPassword,
        roleCode: formRole,
      })
      setShowModal(false)
      resetForm()
      await fetchUsers()
    } catch (err) {
      setCreateError(err?.response?.data?.error?.message || err.message)
    } finally {
      setCreatingUser(false)
    }
  }

  async function handleRoleUpdate(id, newRole) {
    try {
      await updateUserRole(id, newRole)
      await fetchUsers()
    } catch (err) {
    }
  }

  async function handleAddTestUsers() {
    const slug = getTenantSlug()
    const tests = [
      { email: `laura.bianchi@${slug}.it`, firstName: 'Laura', lastName: 'Bianchi', password: 'test1234', roleCode: 'user' },
      { email: `mario.verdi@${slug}.it`, firstName: 'Mario', lastName: 'Verdi', password: 'test1234', roleCode: 'user' },
      { email: `admin@${slug}.it`, firstName: 'Admin', lastName: 'Opterra', password: 'test1234', roleCode: 'manager' },
    ]
    try {
      for (const u of tests) {
        await createUser(u)
      }
      await fetchUsers()
    } catch (err) {
    }
  }

  const roleLabels = {
    manager: t('private.users.roles.manager'),
    user: t('private.users.roles.user'),
    admin: t('private.users.roles.admin'),
  }

  const statusConfig = {
    active: { label: t('private.users.status.active'), variant: 'success' },
    inactive: { label: t('private.users.status.inactive'), variant: 'neutral' },
    pending: { label: t('private.users.status.pending'), variant: 'warning' },
  }

  const filteredUsers = users.filter(u => {
    if (search && !(u.name || '').toLowerCase().includes(search.toLowerCase()) && !(u.email || '').toLowerCase().includes(search.toLowerCase())) return false
    if (roleFilter && u.role !== roleFilter) return false
    if (statusFilter && u.status !== statusFilter) return false
    return true
  })

  const columns = [
    {
      label: t('private.users.columns.user'),
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
      label: t('private.users.columns.role'),
      key: 'role',
      render: row => (
        <select
          className={`${styles.roleSelect} ${styles[row.role]}`}
          value={row.role}
          onChange={e => handleRoleUpdate(row.id, e.target.value)}
          style={{
            background: row.role === 'manager' ? 'var(--color-pending-bg)' : row.role === 'user' ? 'var(--color-info-bg)' : 'var(--color-success-bg)',
            color: row.role === 'manager' ? 'var(--color-pending)' : row.role === 'user' ? 'var(--color-info)' : 'var(--color-success)',
          }}
        >
          <option value="manager">{roleLabels.manager || 'Manager'}</option>
          <option value="user">{roleLabels.user || 'User'}</option>
        </select>
      ),
    },
    {
      label: t('private.users.columns.group'),
      key: 'group',
      render: row => (
        <span className={styles.groupTag}>
          <Icon name="layers" size={12} />
          {row.group}
        </span>
      ),
    },
    {
      label: t('private.users.columns.status'),
      key: 'status',
      render: row => {
        const cfg = statusConfig[row.status] || statusConfig.active
        return <StatusBadge label={cfg.label} variant={cfg.variant} />
      },
    },
    {
      label: t('private.users.columns.lastLogin'),
      key: 'lastLoginAt',
      render: row => (
        <span className={styles.lastLogin}>
          <Icon name="clock" size={12} />
          {row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString('it-IT') : t('private.users.never')}
        </span>
      ),
    },
    {
      label: t('private.users.columns.actions'),
      render: row => (
        <div className={styles.actionsCell}>
          <button className={styles.actionBtn} title={t('private.users.actionTitles.edit')}>
            <Icon name="edit" size={16} />
          </button>
          <button className={styles.actionBtn} title={t('private.users.actionTitles.delete')} onClick={() => handleDelete(row.id)}>
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
        { label: t('private.users.title') },
      ]} />
      <PageHeader
        title={t('private.users.title')}
        subtitle={t('private.users.subtitle')}
        actions={
          <div className={styles.headerActions}>
            <SubmitButton variant="secondary" onClick={handleAddTestUsers} className={styles.testBtn}>
              <Icon name="zap" size={16} />
              <span>{t('private.users.addTestUsers', 'Aggiungi Utenti di Test')}</span>
            </SubmitButton>
            <SubmitButton variant="secondary" onClick={() => { resetForm(); setShowModal(true) }}>
              <Icon name="plus" size={16} />
              <span>{t('private.users.createUser', 'Crea Utente')}</span>
            </SubmitButton>
            <SubmitButton variant="primary" onClick={handleInvite} className={styles.inviteBtn}>
              <Icon name="mail" size={16} />
              <span>{t('private.users.inviteUser')}</span>
            </SubmitButton>
          </div>
        }
      />

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`} onClick={() => setActiveTab('users')}>
          <Icon name="users" size={16} />
          <span>{t('private.users.tabs.users')}</span>
        </button>
        <button className={`${styles.tab} ${activeTab === 'groups' ? styles.tabActive : ''}`} onClick={() => setActiveTab('groups')}>
          <Icon name="layers" size={16} />
          <span>{t('private.users.tabs.groups')}</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            onClear={handleClearFilters}
            searchPlaceholder={t('private.users.searchPlaceholder')}
            filters={[
              {
                placeholder: t('private.users.allRoles'),
                value: roleFilter,
                onChange: setRoleFilter,
                options: [
                  { value: 'manager', label: t('private.users.roles.manager') },
                  { value: 'user', label: t('private.users.roles.user') },
                ],
              },
              {
                placeholder: t('private.users.allStatuses'),
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'active', label: t('private.users.status.active') },
                  { value: 'inactive', label: t('private.users.status.inactive') },
                  { value: 'pending', label: t('private.users.status.pending') },
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
                title={t('private.users.emptyTitle')}
                message={t('private.users.emptyMessage')}
              />
            }
          />
        </>
      )}

      {activeTab === 'groups' && (
        <div className={styles.groupsGrid}>
          {groups.map((group, index) => (
            <SectionCard key={group.id} title={group.name} actions={
              <div className={styles.groupActions}>
                <button className={styles.groupActionBtn} title={t('private.users.groups.edit')}>
                  <Icon name="edit" size={16} />
                </button>
                <button className={styles.groupActionBtn} title={t('private.users.groups.delete')}>
                  <Icon name="trash" size={16} />
                </button>
              </div>
            }>
              <div className={styles.groupContent} style={{ animationDelay: `${index * 0.1}s` }}>
                <p className={styles.groupDesc}>{group.description}</p>
                <div className={styles.groupMeta}>
                  <span className={styles.groupMembers}>
                    <Icon name="users" size={14} />
                    {group.members} {t('private.users.groups.members')}
                  </span>
                </div>
              </div>
            </SectionCard>
          ))}
          <button className={styles.addGroupCard}>
            <Icon name="plus" size={32} />
            <span>{t('private.users.groups.createNew')}</span>
          </button>
        </div>
      )}
      {showModal && (
        <div className={styles.overlay} onClick={() => { setShowModal(false); resetForm() }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>{t('private.users.createUser', 'Crea Utente')}</span>
              <button className={styles.modalClose} onClick={() => { setShowModal(false); resetForm() }}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('common.email', 'Email')}</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="email"
                      className={styles.input}
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('common.firstName', 'Nome')}</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      className={styles.input}
                      value={formFirstName}
                      onChange={e => setFormFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('common.lastName', 'Cognome')}</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      className={styles.input}
                      value={formLastName}
                      onChange={e => setFormLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('common.password', 'Password')}</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="password"
                      className={styles.input}
                      value={formPassword}
                      onChange={e => setFormPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('common.role', 'Ruolo')}</label>
                  <div className={styles.inputWrapper}>
                    <select
                      className={styles.select}
                      value={formRole}
                      onChange={e => setFormRole(e.target.value)}
                    >
                      <option value="manager">{roleLabels.manager}</option>
                      <option value="user">{roleLabels.user}</option>
                    </select>
                  </div>
                </div>
                {createError && <span className={styles.errorText}>{createError}</span>}
              </div>
              <div className={styles.modalActions}>
                <SubmitButton variant="secondary" type="button" onClick={() => { setShowModal(false); resetForm() }}>
                  {t('common.cancel', 'Annulla')}
                </SubmitButton>
                <SubmitButton variant="primary" type="submit" loading={creatingUser}>
                  <Icon name="check" size={16} />
                  <span>{t('common.save', 'Salva')}</span>
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}