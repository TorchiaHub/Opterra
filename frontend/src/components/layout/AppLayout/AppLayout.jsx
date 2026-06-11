import { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { UIContext } from '../../../context/UIContext'
import { Sidebar } from '../Sidebar/Sidebar'
import { Topbar } from '../Topbar/Topbar'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const { sidebarCollapsed } = useContext(UIContext)

  return (
    <div className={styles.layout}>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>
      <div className={`${styles.main} ${sidebarCollapsed ? styles.mainExpanded : ''}`}>
        <Topbar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
