import { NavLink } from 'react-router-dom'
import { useContext, useState } from 'react'
import { UIContext } from '../../../context/UIContext'
import { useAuth } from '../../../hooks/useAuth'
import { usePermissions } from '../../../hooks/usePermissions'
import { APP_ROUTES, ROLES } from '../../../utils/constants'
import Icon from '../../Icon'
import styles from './Sidebar.module.css'

const publicNav = [
  { to: APP_ROUTES.HOME, label: 'Home', icon: 'home' },
  { to: APP_ROUTES.FEATURES, label: 'Funzionalità', icon: 'zap' },
  { to: APP_ROUTES.PRICING, label: 'Prezzi', icon: 'tag' },
  { to: APP_ROUTES.DEMO, label: 'Richiedi Demo', icon: 'mail' },
  { to: APP_ROUTES.LOGIN, label: 'Accedi', icon: 'lock' },
]

const tenantNav = [
  { to: APP_ROUTES.DASHBOARD, label: 'Dashboard', icon: 'dashboard', section: 'Workspace' },
  { to: APP_ROUTES.TENDERS, label: 'Gare', icon: 'tenders', section: 'Workspace' },
  { to: APP_ROUTES.DISCOVERY, label: 'Scopri Bandi', icon: 'search', section: 'Workspace' },
  { to: APP_ROUTES.USERS, label: 'Utenti', icon: 'users', section: 'Gestione', role: ROLES.MANAGER },
  { to: APP_ROUTES.AUDIT, label: 'Audit Log', icon: 'audit', section: 'Gestione', role: ROLES.MANAGER },
  { to: APP_ROUTES.SETTINGS, label: 'Impostazioni', icon: 'settings', section: 'Gestione' },
]

const adminNav = [
  { to: APP_ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: 'dashboard', section: 'Admin' },
  { to: APP_ROUTES.ADMIN_TENANTS, label: 'Tenant', icon: 'building', section: 'Admin' },
  { to: APP_ROUTES.ADMIN_SUBSCRIPTIONS, label: 'Abbonamenti', icon: 'tag', section: 'Admin' },
  { to: APP_ROUTES.ADMIN_AUDIT, label: 'Audit Globale', icon: 'audit', section: 'Admin' },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useContext(UIContext)
  const { user, isAuthenticated, logout } = useAuth()
  const { isSuperadmin } = usePermissions()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isPublic = !isAuthenticated

  function getInitials(name) {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  function renderNavItems(items) {
    const sections = {}
    items.forEach(item => {
      if (item.role && user?.role !== item.role && user?.role !== ROLES.SUPERADMIN) return
      const section = item.section || ''
      if (!sections[section]) sections[section] = []
      sections[section].push(item)
    })

    return Object.entries(sections).map(([section, navItems]) => (
      <div key={section} className={styles.section}>
        <div className={styles.sectionLabel}>{section}</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === APP_ROUTES.DASHBOARD || item.to === APP_ROUTES.ADMIN_DASHBOARD}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <span className={styles.navIcon}>
              <Icon name={item.icon} size={20} />
            </span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </div>
    ))
  }

  return (
    <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''} ${mobileOpen ? styles.open : ''}`}>
      <div className={styles.brand}>
        <img src="/opterra-logo.png" alt="Opterra" className={styles.logo} />
        <span className={styles.brandName}>Opterra</span>
      </div>

      <nav className={styles.nav}>
        {isPublic
          ? publicNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
              >
                <span className={styles.navIcon}>
                  <Icon name={item.icon} size={20} />
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            ))
          : renderNavItems(isSuperadmin ? adminNav : tenantNav)
        }
      </nav>

      {isAuthenticated && (
        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{getInitials(user?.firstName + ' ' + user?.lastName)}</div>
            <div className={styles.userMeta}>
              <div className={styles.userName}>{user?.firstName} {user?.lastName}</div>
              <div className={styles.userRole}>{user?.role}</div>
            </div>
            <button className={styles.logoutBtn} onClick={logout} title="Logout">
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
