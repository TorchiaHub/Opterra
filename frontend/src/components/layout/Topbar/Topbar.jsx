import { useContext } from 'react'
import { UIContext } from '../../../context/UIContext'
import { useAuth } from '../../../hooks/useAuth'
import styles from './Topbar.module.css'

export function Topbar() {
  const { toggleSidebar, toggleChatbot, chatbotOpen } = useContext(UIContext)
  const { user, isAuthenticated, logout } = useAuth()

  function getInitials(name) {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (!isAuthenticated) return null

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={toggleSidebar} aria-label="Toggle sidebar">
          ☰
        </button>
      </div>
      <div className={styles.right}>
        <button className={styles.iconBtn} aria-label="Notifiche">
          🔔
          <span className={styles.notificationDot} />
        </button>
        <button
          className={`${styles.chatBtn} ${chatbotOpen ? styles.chatBtnActive : ''}`}
          onClick={toggleChatbot}
        >
          💬 Chat
        </button>
        <button className={styles.avatarBtn} title={`${user?.firstName} ${user?.lastName}`}>
          {getInitials(user?.firstName + ' ' + user?.lastName)}
        </button>
      </div>
    </header>
  )
}
