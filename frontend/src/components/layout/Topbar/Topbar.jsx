import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UIContext } from '../../../context/UIContext';
import { useAuth } from '../../../hooks/useAuth';
import Icon from '../../Icon';
import styles from './Topbar.module.css';

export function Topbar({ hasNotifications = false }) {
  const { toggleSidebar, toggleChatbot, toggleTheme, theme, chatbotOpen } = useContext(UIContext);
  const { user, isAuthenticated, logout } = useAuth();
  const { i18n, t } = useTranslation();

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function toggleLanguage() {
    const next = i18n.language === 'it' ? 'en' : 'it';
    i18n.changeLanguage(next);
  }

  if (!isAuthenticated) return null;

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={toggleSidebar} aria-label={t('topbar.toggleSidebar')}>
          <Icon name="menu" size={20} />
        </button>
      </div>
      <div className={styles.right}>
        <button className={styles.langBtn} onClick={toggleLanguage} aria-label={t('topbar.switchLanguage')} title={i18n.language === 'it' ? 'Switch to English' : 'Passa all\'italiano'}>
          {i18n.language === 'it' ? 'EN' : 'IT'}
        </button>
        <button className={styles.iconBtn} onClick={toggleTheme} aria-label={theme === 'dark' ? t('topbar.switchToLight') : t('topbar.switchToDark')}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
        <button className={styles.iconBtn} aria-label={t('topbar.notifications')}>
          <Icon name="notification" size={20} />
          {hasNotifications && <span className={styles.notificationDot} />}
        </button>
        <button
          className={`${styles.chatBtn} ${chatbotOpen ? styles.chatBtnActive : ''}`}
          onClick={toggleChatbot}
        >
          <Icon name="chat" size={16} />
          <span>{t('topbar.chat')}</span>
        </button>
        <button className={styles.avatarBtn} title={`${user?.firstName} ${user?.lastName}`}>
          {getInitials(user?.firstName + ' ' + user?.lastName)}
        </button>
      </div>
    </header>
  );
}