import { useState } from 'react'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { SectionCard } from '../../components/cards/SectionCard'
import { SubmitButton } from '../../components/forms/SubmitButton'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import Icon from '../../components/Icon'
import { APP_ROUTES } from '../../utils/constants'
import styles from './SettingsPage.module.css'

const mockProfile = {
  firstName: 'Marco',
  lastName: 'Rossi',
  email: 'marco.rossi@opterra.it',
  phone: '+39 340 123 4567',
  role: 'Manager',
  department: 'Tecnico',
}

const mockCompany = {
  name: 'Opterra S.r.l.',
  vat: 'IT12345678901',
  address: 'Via Roma 42, Milano',
  pec: 'opterra@pec.it',
  website: 'https://opterra.it',
  size: '11-50',
}

const mockNotifications = {
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
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(mockProfile)
  const [company, setCompany] = useState(mockCompany)
  const [notifications, setNotifications] = useState(mockNotifications)
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
    { id: 'profile', label: 'Profilo', icon: 'user' },
    { id: 'company', label: 'Azienda', icon: 'building' },
    { id: 'notifications', label: 'Notifiche', icon: 'notification' },
    { id: 'security', label: 'Sicurezza', icon: 'shield' },
  ]

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Workspace', to: APP_ROUTES.DASHBOARD },
        { label: 'Impostazioni' },
      ]} />
      <PageHeader title="Impostazioni" subtitle="Gestisci il tuo profilo e le preferenze" />

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
            <SectionCard title="Profilo Utente" actions={
              <div className={styles.saveActions}>
                {saved && (
                  <span className={styles.savedIndicator}>
                    <Icon name="checkCircle" size={16} />
                    Salvato
                  </span>
                )}
                <SubmitButton variant="primary" onClick={handleSave} loading={saving}>
                  <Icon name="check" size={16} />
                  <span>Salva</span>
                </SubmitButton>
              </div>
            }>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nome</label>
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
                  <label className={styles.label}>Cognome</label>
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
                  <label className={styles.label}>Email</label>
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
                  <label className={styles.label}>Telefono</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="user" size={16} />
                    <input
                      type="tel"
                      className={styles.input}
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ruolo</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="briefcase" size={16} />
                    <input type="text" className={styles.input} value={profile.role} disabled />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Dipartimento</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="layers" size={16} />
                    <input type="text" className={styles.input} value={profile.department} disabled />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {activeTab === 'company' && (
            <SectionCard title="Dati Azienda" actions={
              <div className={styles.saveActions}>
                {saved && (
                  <span className={styles.savedIndicator}>
                    <Icon name="checkCircle" size={16} />
                    Salvato
                  </span>
                )}
                <SubmitButton variant="primary" onClick={handleSave} loading={saving}>
                  <Icon name="check" size={16} />
                  <span>Salva</span>
                </SubmitButton>
              </div>
            }>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ragione Sociale</label>
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
                  <label className={styles.label}>Partita IVA</label>
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
                  <label className={styles.label}>Indirizzo</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="globe" size={16} />
                    <input
                      type="text"
                      className={styles.input}
                      value={company.address}
                      onChange={e => setCompany({ ...company, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>PEC</label>
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
                  <label className={styles.label}>Sito Web</label>
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
                  <label className={styles.label}>Dimensione</label>
                  <div className={styles.inputWrapper}>
                    <Icon name="users" size={16} />
                    <select
                      className={styles.input}
                      value={company.size}
                      onChange={e => setCompany({ ...company, size: e.target.value })}
                    >
                      <option value="1-10">1-10 dipendenti</option>
                      <option value="11-50">11-50 dipendenti</option>
                      <option value="51-200">51-200 dipendenti</option>
                      <option value="200+">200+ dipendenti</option>
                    </select>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {activeTab === 'notifications' && (
            <SectionCard title="Preferenze Notifiche" actions={
              <div className={styles.saveActions}>
                {saved && (
                  <span className={styles.savedIndicator}>
                    <Icon name="checkCircle" size={16} />
                    Salvato
                  </span>
                )}
                <SubmitButton variant="primary" onClick={handleSave} loading={saving}>
                  <Icon name="check" size={16} />
                  <span>Salva</span>
                </SubmitButton>
              </div>
            }>
              <div className={styles.notificationsSection}>
                <h4 className={styles.notificationsSectionTitle}>
                  <Icon name="mail" size={16} />
                  Email
                </h4>
                <div className={styles.toggleList}>
                  {[
                    { key: 'emailTenderDeadline', label: 'Scadenze gare imminenti', desc: 'Ricevi un avviso quando una gara sta per scadere' },
                    { key: 'emailTaskAssigned', label: 'Nuovi task assegnati', desc: 'Ricevi una notifica quando ti viene assegnato un task' },
                    { key: 'emailNewTender', label: 'Nuove gare disponibili', desc: 'Ricevi aggiornamenti su nuove gare rilevanti' },
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
                  Push
                </h4>
                <div className={styles.toggleList}>
                  {[
                    { key: 'pushTenderDeadline', label: 'Scadenze gare imminenti', desc: 'Notifica push quando una gara sta per scadere' },
                    { key: 'pushTaskAssigned', label: 'Nuovi task assegnati', desc: 'Notifica push per nuovi task' },
                    { key: 'pushNewTender', label: 'Nuove gare disponibili', desc: 'Notifica push per nuove gare' },
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
                  Digest
                </h4>
                <div className={styles.toggleList}>
                  {[
                    { key: 'digestDaily', label: 'Digest giornaliero', desc: 'Riepilogo giornaliero delle attivita' },
                    { key: 'digestWeekly', label: 'Digest settimanale', desc: 'Riepilogo settimanale delle attivita' },
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
            <SectionCard title="Sicurezza">
              <div className={styles.securitySection}>
                <div className={styles.securityItem}>
                  <div className={styles.securityInfo}>
                    <span className={styles.securityLabel}>Password</span>
                    <span className={styles.securityDesc}>Ultimo aggiornamento 30 giorni fa</span>
                  </div>
                  <SubmitButton variant="secondary" onClick={() => {}}>
                    <Icon name="lock" size={16} />
                    <span>Modifica</span>
                  </SubmitButton>
                </div>
                <div className={styles.securityItem}>
                  <div className={styles.securityInfo}>
                    <span className={styles.securityLabel}>Autenticazione a due fattori (2FA)</span>
                    <span className={styles.securityDesc}>Aumenta la sicurezza del tuo account</span>
                  </div>
                  <div className={styles.securityStatus}>
                    <StatusBadge label="Attiva" variant="success" />
                  </div>
                </div>
                <div className={styles.securityItem}>
                  <div className={styles.securityInfo}>
                    <span className={styles.securityLabel}>Sessioni attive</span>
                    <span className={styles.securityDesc}>3 dispositivi connessi</span>
                  </div>
                  <SubmitButton variant="secondary" onClick={() => {}}>
                    <Icon name="eye" size={16} />
                    <span>Gestisci</span>
                  </SubmitButton>
                </div>
                <div className={styles.securityItem}>
                  <div className={styles.securityInfo}>
                    <span className={styles.securityLabel}>API Key</span>
                    <span className={styles.securityDesc}>Usata per integrazioni esterne</span>
                  </div>
                  <SubmitButton variant="secondary" onClick={() => {}}>
                    <Icon name="lock" size={16} />
                    <span>Rigenera</span>
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
