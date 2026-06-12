import { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { UIContext } from '../../context/UIContext'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { SectionCard } from '../../components/cards/SectionCard'
import { SubmitButton } from '../../components/forms/SubmitButton'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import Icon from '../../components/Icon'
import { APP_ROUTES } from '../../utils/constants'
import { useAuth } from '../../hooks/useAuth'
import styles from './SettingsPage.module.css'

const defaultNotifications = {
  emailTenderDeadline: true,
  emailTaskAssigned: true,
  emailNewTender: false,
  pushTenderDeadline: true,
  pushTaskAssigned: false,
  pushNewTender: true,
  digestDaily: true,
  digestWeekly: false,
}

export function SettingsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { addToast } = useContext(UIContext)
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || '',
    department: user?.department || user?.group || '',
  })
  const [company, setCompany] = useState({
    name: user?.company?.name || '',
    vat: user?.company?.vat || '',
    address: user?.company?.address || '',
    pec: user?.company?.pec || '',
    website: user?.company?.website || '',
    size: user?.company?.size || '',
  })
  const [notifications, setNotifications] = useState(defaultNotifications)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 800)
  }

  function toggleNotification(key) {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const tabs = [
    { id: 'profile', label: t('private.settings.tabs.profile'), icon: 'user' },
    { id: 'company', label: t('private.settings.tabs.company'), icon: 'building' },
    { id: 'notifications', label: t('private.settings.tabs.notifications'), icon: 'notification' },
    { id: 'security', label: t('private.settings.tabs.security'), icon: 'shield' },
  ]

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: t('components.breadcrumbs.workspace'), to: APP_ROUTES.DASHBOARD },
        { label: t('private.settings.title') },
      ]} />
      <PageHeader title={t('private.settings.title')} subtitle={t('private.settings.subtitle')} />

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.sidebarItem} ${activeTab === tab.id ? styles.sidebarItemActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.icon} size={18} />
              <span>{tab.label}</span>
              {activeTab === tab.id && <Icon name="chevronRight" size={14} className={styles.sidebarChevron} />}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {activeTab === 'profile' && (
            <SectionCard title={t('private.settings.profile.sectionTitle')} actions={
              <div className={styles.saveActions}>
                {saved && (
                  <span className={styles.savedIndicator}>
                    <Icon name="checkCircle" size={16} />
                    {t('common.saved')}
                  </span>
                )}
                <SubmitButton variant="primary" onClick={handleSave} loading={saving}>
                  <Icon name="check" size={16} />
                  <span>{t('common.save')}</span>
                </SubmitButton>
              </div>
            }>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('private.settings.profile.firstName')}</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="user" size={16} />
                    <input
                      type="text"
                      className={styles.input}
                      value={profile.firstName}
                      onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('private.settings.profile.lastName')}</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="user" size={16} />
                    <input
                      type="text"
                      className={styles.input}
                      value={profile.lastName}
                      onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('private.settings.profile.email')}</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="mail" size={16} />
                    <input
                      type="email"
                      className={styles.input}
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('private.settings.profile.phone')}</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="phone" size={16} />
                    <input
                      type="tel"
                      className={styles.input}
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('private.settings.profile.role')}</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="briefcase" size={16} />
                    <input type="text" className={styles.input} value={profile.role} disabled />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('private.settings.profile.department')}</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="layers" size={16} />
                    <input type="text" className={styles.input} value={profile.department} disabled />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {activeTab === 'company' && (
            <SectionCard title={t('private.settings.company.sectionTitle')} actions={
              <div className={styles.saveActions}>
                {saved && (
                  <span className={styles.savedIndicator}>
                    <Icon name="checkCircle" size={16} />
                    {t('common.saved')}
                  </span>
                )}
                <SubmitButton variant="primary" onClick={handleSave} loading={saving}>
                  <Icon name="check" size={16} />
                  <span>{t('common.save')}</span>
                </SubmitButton>
              </div>
            }>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('private.settings.company.companyName')}</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="building" size={16} />
                    <input
                      type="text"
                      className={styles.input}
                      value={company.name}
                      onChange={e => setCompany({ ...company, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('private.settings.company.vat')}</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="tag" size={16} />
                    <input
                      type="text"
                      className={styles.input}
                      value={company.vat}
                      onChange={e => setCompany({ ...company, vat: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('private.settings.company.address')}</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="mapPin" size={16} />
                    <input
                      type="text"
                      className={styles.input}
                      value={company.address}
                      onChange={e => setCompany({ ...company, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('private.settings.company.pec')}</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="mail" size={16} />
                    <input
                      type="email"
                      className={styles.input}
                      value={company.pec}
                      onChange={e => setCompany({ ...company, pec: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('private.settings.company.website')}</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="globe" size={16} />
                    <input
                      type="url"
                      className={styles.input}
                      value={company.website}
                      onChange={e => setCompany({ ...company, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('private.settings.company.size')}</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="users" size={16} />
                    <select
                      className={styles.input}
                      value={company.size}
                      onChange={e => setCompany({ ...company, size: e.target.value })}
                    >
                      {t('private.settings.company.sizeOptions', { returnObjects: true }).map((opt, i) => (
                        <option key={i} value={['1-10', '11-50', '51-200', '200+'][i]}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {activeTab === 'notifications' && (
            <SectionCard title={t('private.settings.notifications.sectionTitle')} actions={
              <div className={styles.saveActions}>
                {saved && (
                  <span className={styles.savedIndicator}>
                    <Icon name="checkCircle" size={16} />
                    {t('common.saved')}
                  </span>
                )}
                <SubmitButton variant="primary" onClick={handleSave} loading={saving}>
                  <Icon name="check" size={16} />
                  <span>{t('common.save')}</span>
                </SubmitButton>
              </div>
            }>
              <div className={styles.notificationsSection}>
                <h4 className={styles.notificationsSectionTitle}>
                  <Icon name="mail" size={16} />
                  {t('private.settings.notifications.email.title')}
                </h4>
                <div className={styles.toggleList}>
                  {[
                    { key: 'emailTenderDeadline', label: t('private.settings.notifications.email.deadline.label'), desc: t('private.settings.notifications.email.deadline.description') },
                    { key: 'emailTaskAssigned', label: t('private.settings.notifications.email.newTask.label'), desc: t('private.settings.notifications.email.newTask.description') },
                    { key: 'emailNewTender', label: t('private.settings.notifications.email.newTenders.label'), desc: t('private.settings.notifications.email.newTenders.description') },
                  ].map(item => (
                    <div key={item.key} className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>{item.label}</span>
                        <span className={styles.toggleDesc}>{item.desc}</span>
                      </div>
                      <button
                        className={`${styles.toggleSwitch} ${notifications[item.key] ? styles.toggleOn : ''}`}
                        onClick={() => toggleNotification(item.key)}
                      >
                        <span className={styles.toggleKnob} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.notificationsSection}>
                <h4 className={styles.notificationsSectionTitle}>
                  <Icon name="notification" size={16} />
                  {t('private.settings.notifications.push.title')}
                </h4>
                <div className={styles.toggleList}>
                  {[
                    { key: 'pushTenderDeadline', label: t('private.settings.notifications.push.deadline.label'), desc: t('private.settings.notifications.push.deadline.description') },
                    { key: 'pushTaskAssigned', label: t('private.settings.notifications.push.newTask.label'), desc: t('private.settings.notifications.push.newTask.description') },
                    { key: 'pushNewTender', label: t('private.settings.notifications.push.newTenders.label'), desc: t('private.settings.notifications.push.newTenders.description') },
                  ].map(item => (
                    <div key={item.key} className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>{item.label}</span>
                        <span className={styles.toggleDesc}>{item.desc}</span>
                      </div>
                      <button
                        className={`${styles.toggleSwitch} ${notifications[item.key] ? styles.toggleOn : ''}`}
                        onClick={() => toggleNotification(item.key)}
                      >
                        <span className={styles.toggleKnob} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.notificationsSection}>
                <h4 className={styles.notificationsSectionTitle}>
                  <Icon name="inbox" size={16} />
                  {t('private.settings.notifications.digest.title')}
                </h4>
                <div className={styles.toggleList}>
                  {[
                    { key: 'digestDaily', label: t('private.settings.notifications.digest.daily.label'), desc: t('private.settings.notifications.digest.daily.description') },
                    { key: 'digestWeekly', label: t('private.settings.notifications.digest.weekly.label'), desc: t('private.settings.notifications.digest.weekly.description') },
                  ].map(item => (
                    <div key={item.key} className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>{item.label}</span>
                        <span className={styles.toggleDesc}>{item.desc}</span>
                      </div>
                      <button
                        className={`${styles.toggleSwitch} ${notifications[item.key] ? styles.toggleOn : ''}`}
                        onClick={() => toggleNotification(item.key)}
                      >
                        <span className={styles.toggleKnob} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          )}

          {activeTab === 'security' && (
            <SectionCard title={t('private.settings.security.sectionTitle')}>
              <div className={styles.securitySection}>
                <div className={styles.securityItem}>
                  <div className={styles.securityInfo}>
                    <span className={styles.securityLabel}>{t('private.settings.security.password.label')}</span>
                    <span className={styles.securityDesc}>{t('private.settings.security.password.description')}</span>
                  </div>
                  <SubmitButton variant="secondary" onClick={() => addToast('Il cambio password sarà disponibile in una prossima versione. Contatta il tuo manager per il reset.', 'info')}>
                    <Icon name="lock" size={16} />
                    <span>{t('private.settings.security.password.button')}</span>
                  </SubmitButton>
                </div>
                <div className={styles.securityItem}>
                  <div className={styles.securityInfo}>
                    <span className={styles.securityLabel}>{t('private.settings.security.twoFactor.label')}</span>
                    <span className={styles.securityDesc}>{t('private.settings.security.twoFactor.description')}</span>
                  </div>
                  <div className={styles.securityStatus}>
                    <StatusBadge label={t('private.settings.security.twoFactor.badge')} variant="success" />
                  </div>
                </div>
                <div className={styles.securityItem}>
                  <div className={styles.securityInfo}>
                    <span className={styles.securityLabel}>{t('private.settings.security.sessions.label')}</span>
                    <span className={styles.securityDesc}>{t('private.settings.security.sessions.description')}</span>
                  </div>
                  <SubmitButton variant="secondary" onClick={() => addToast('La gestione delle sessioni attive sarà disponibile in una prossima versione.', 'info')}>
                    <Icon name="eye" size={16} />
                    <span>{t('private.settings.security.sessions.button')}</span>
                  </SubmitButton>
                </div>
                <div className={styles.securityItem}>
                  <div className={styles.securityInfo}>
                    <span className={styles.securityLabel}>{t('private.settings.security.apiKey.label')}</span>
                    <span className={styles.securityDesc}>{t('private.settings.security.apiKey.description')}</span>
                  </div>
                  <SubmitButton variant="secondary" onClick={() => addToast('Le API key saranno disponibili in una prossima versione.', 'info')}>
                    <Icon name="lock" size={16} />
                    <span>{t('private.settings.security.apiKey.button')}</span>
                  </SubmitButton>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}