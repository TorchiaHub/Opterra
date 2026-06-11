import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { SectionCard } from '../../components/cards/SectionCard'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SubmitButton } from '../../components/forms/SubmitButton'
import Icon from '../../components/Icon'
import {
  APP_ROUTES, TENDER_STATUS_LABELS, TENDER_STATUS_COLORS,
  REQUIREMENT_STATUS_LABELS, TASK_STATUS_LABELS,
} from '../../utils/constants'
import { formatCurrency } from '../../utils/format'
import { formatDate } from '../../utils/date'
import styles from './TenderDetailPage.module.css'

const TABS = [
  { label: 'Overview', icon: 'layout' },
  { label: 'Requisiti', icon: 'checkCircle' },
  { label: 'Documenti', icon: 'file' },
  { label: 'Task', icon: 'check' },
  { label: 'AI', icon: 'robot' },
]

const mockTender = {
  id: 1,
  title: 'Fornitura software procurement',
  issuer: 'Comune di Milano',
  type: 'rfp',
  status: 'active',
  deadlineAt: '2026-07-12T10:00:00Z',
  valueAmount: 120000,
  description: 'Fornitura di un sistema software per la gestione del procurement e degli appalti pubblici. La piattaforma deve supportare la gestione end-to-end del ciclo di vita degli appalti, dalla pubblicazione dei bandi alla valutazione delle offerte.',
  referenceCode: 'BANDO-2026-001',
  createdAt: '2026-06-01T10:00:00Z',
  contactName: 'Dott. Mario Rossi',
  contactEmail: 'm.rossi@comune.milano.it',
  category: 'Informatica e Software',
  region: 'Lombardia',
}

const mockRequirements = [
  { id: 1, title: 'Requisiti tecnici minimi', status: 'completed', priority: 'mandatory', category: 'Tecnico' },
  { id: 2, title: 'Certificazione ISO 9001', status: 'completed', priority: 'mandatory', category: 'Qualita' },
  { id: 3, title: 'Esperienza triennale', status: 'in_progress', priority: 'mandatory', category: 'Esperienza' },
  { id: 4, title: 'Fatturato minimo 500k', status: 'completed', priority: 'important', category: 'Economico' },
  { id: 5, title: 'Disponibilita supporto 24/7', status: 'pending', priority: 'important', category: 'Tecnico' },
  { id: 6, title: 'Multilingue (IT, EN, DE)', status: 'pending', priority: 'optional', category: 'Funzionale' },
  { id: 7, title: 'Integrazione con PagoPA', status: 'in_progress', priority: 'important', category: 'Tecnico' },
  { id: 8, title: 'Hosting cloud EU', status: 'completed', priority: 'mandatory', category: 'Tecnico' },
]

const mockDocuments = [
  { id: 1, name: 'Bando di gara.pdf', size: '2.4 MB', type: 'pdf', uploadedAt: '2026-06-01T10:00:00Z', uploadedBy: 'Marco Rossi' },
  { id: 2, name: 'Capitolato tecnico.pdf', size: '1.8 MB', type: 'pdf', uploadedAt: '2026-06-02T14:30:00Z', uploadedBy: 'Laura Bianchi' },
  { id: 3, name: 'Disciplinare di gara.pdf', size: '890 KB', type: 'pdf', uploadedAt: '2026-06-02T16:00:00Z', uploadedBy: 'Marco Rossi' },
  { id: 4, name: 'Offerta tecnica.docx', size: '1.2 MB', type: 'doc', uploadedAt: '2026-06-05T09:15:00Z', uploadedBy: 'Giuseppe Verdi' },
  { id: 5, name: 'Offerta economica.xlsx', size: '45 KB', type: 'xls', uploadedAt: '2026-06-05T11:00:00Z', uploadedBy: 'Giuseppe Verdi' },
]

const mockTasks = [
  { id: 1, title: 'Analisi requisiti capitolato', status: 'done', assignee: 'Marco Rossi', dueAt: '2026-06-05T10:00:00Z', priority: 'high' },
  { id: 2, title: 'Redazione offerta tecnica', status: 'in_progress', assignee: 'Laura Bianchi', dueAt: '2026-06-10T10:00:00Z', priority: 'high' },
  { id: 3, title: 'Preparazione offerta economica', status: 'todo', assignee: 'Giuseppe Verdi', dueAt: '2026-06-10T10:00:00Z', priority: 'high' },
  { id: 4, title: 'Verifica documentazione SOA', status: 'todo', assignee: 'Anna Neri', dueAt: '2026-06-08T10:00:00Z', priority: 'medium' },
  { id: 5, title: 'Revisione finale e invio', status: 'todo', assignee: 'Marco Rossi', dueAt: '2026-06-11T10:00:00Z', priority: 'high' },
]

const mockAIInsights = [
  { id: 1, type: 'opportunity', title: 'Alta probabilita di vittoria', description: 'Il profilo della tua azienda si allinea molto bene con i requisiti del bando. Focus su esperienza cloud e procurement.', confidence: 92 },
  { id: 2, type: 'risk', title: 'Requisito critico mancante', description: 'Manca la certificazione ISO 27001 richiesta nel capitolato. Considera partnership o acquisizione rapida.', confidence: 85 },
  { id: 3, type: 'suggestion', title: 'Migliora l\'offerta', description: 'Aggiungi un case study su progetto simile per Comune di Bologna. Aumenta la rilevanza.', confidence: 78 },
]

const priorityConfig = {
  high: { label: 'Alta', color: 'danger' },
  medium: { label: 'Media', color: 'warning' },
  low: { label: 'Bassa', color: 'info' },
}

const aiTypeConfig = {
  opportunity: { icon: 'star', color: 'success', label: 'Opportunita' },
  risk: { icon: 'alert', color: 'danger', label: 'Rischio' },
  suggestion: { icon: 'sparkles', color: 'info', label: 'Suggerimento' },
}

export function TenderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

  const completedReqs = mockRequirements.filter(r => r.status === 'completed').length
  const totalReqs = mockRequirements.length
  const progress = Math.round((completedReqs / totalReqs) * 100)

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Workspace', to: APP_ROUTES.DASHBOARD },
        { label: 'Gare', to: APP_ROUTES.TENDERS },
        { label: mockTender.title },
      ]} />
      <PageHeader
        title={mockTender.title}
        subtitle={mockTender.issuer}
        actions={
          <div className={styles.headerActions}>
            <StatusBadge
              label={TENDER_STATUS_LABELS[mockTender.status]}
              variant={TENDER_STATUS_COLORS[mockTender.status]}
            />
            <button className={styles.iconBtn} onClick={() => {}} title="Modifica">
              <Icon name="edit" size={18} />
            </button>
          </div>
        }
      />

      <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <button
            key={i}
            className={`${styles.tab} ${i === activeTab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(i)}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className={styles.overviewGrid}>
          <SectionCard title="Dettagli gara">
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="tag" size={14} /> Codice
                </span>
                <span className={styles.infoValue}>{mockTender.referenceCode}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="building" size={14} /> Ente banditore
                </span>
                <span className={styles.infoValue}>{mockTender.issuer}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="file" size={14} /> Tipo
                </span>
                <span className={styles.infoValue}>{mockTender.type.toUpperCase()}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="tag" size={14} /> Categoria
                </span>
                <span className={styles.infoValue}>{mockTender.category}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="tag" size={14} /> Valore
                </span>
                <span className={styles.infoValue}>{formatCurrency(mockTender.valueAmount)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="calendar" size={14} /> Scadenza
                </span>
                <span className={styles.infoValue}>{formatDate(mockTender.deadlineAt)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="globe" size={14} /> Regione
                </span>
                <span className={styles.infoValue}>{mockTender.region}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="clock" size={14} /> Creata il
                </span>
                <span className={styles.infoValue}>{formatDate(mockTender.createdAt)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="user" size={14} /> Contatto
                </span>
                <span className={styles.infoValue}>{mockTender.contactName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Icon name="mail" size={14} /> Email
                </span>
                <span className={styles.infoValue}>{mockTender.contactEmail}</span>
              </div>
            </div>
          </SectionCard>

          <div className={styles.overviewRight}>
            <SectionCard title="Descrizione">
              <p className={styles.description}>{mockTender.description}</p>
            </SectionCard>

            <SectionCard title="Progresso Requisiti">
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }}>
                  <span className={styles.progressLabel}>{progress}%</span>
                </div>
              </div>
              <div className={styles.progressMeta}>
                <span>{completedReqs} / {totalReqs} completati</span>
                <span className={styles.progressRemaining}>{totalReqs - completedReqs} in attesa</span>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <SectionCard title="Requisiti" actions={
          <div className={styles.progressHeader}>
            <div className={styles.progressBarSmall}>
              <div className={styles.progressFillSmall} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressText}>{progress}%</span>
          </div>
        }>
          <div className={styles.requirementsList}>
            {mockRequirements.map((req, index) => (
              <div key={req.id} className={styles.reqItem} style={{ animationDelay: `${index * 0.04}s` }}>
                <div className={styles.reqCheckbox}>
                  <Icon name={req.status === 'completed' ? 'circleCheck' : req.status === 'in_progress' ? 'circleDot' : 'circle'} size={20} />
                </div>
                <div className={styles.reqInfo}>
                  <span className={`${styles.reqTitle} ${req.status === 'completed' ? styles.reqCompleted : ''}`}>
                    {req.title}
                  </span>
                  <div className={styles.reqMeta}>
                    <span className={styles.reqCategory}>{req.category}</span>
                    <StatusBadge label={REQUIREMENT_STATUS_LABELS[req.status]} variant={req.status === 'completed' ? 'success' : req.status === 'in_progress' ? 'info' : 'neutral'} showDot={false} />
                  </div>
                </div>
                <div className={styles.reqPriority}>
                  <span className={`${styles.priorityBadge} ${styles[`priority${req.priority}`]}`}>
                    {req.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {activeTab === 2 && (
        <SectionCard title="Documenti" actions={
          <SubmitButton variant="secondary" onClick={() => {}} className={styles.uploadBtn}>
            <Icon name="upload" size={16} />
            <span>Carica</span>
          </SubmitButton>
        }>
          <div className={styles.documentsList}>
            {mockDocuments.length === 0 ? (
              <EmptyState icon="file" title="Nessun documento" message="Carica i documenti relativi alla gara." />
            ) : (
              mockDocuments.map((doc, index) => (
                <div key={doc.id} className={styles.docItem} style={{ animationDelay: `${index * 0.04}s` }}>
                  <div className={styles.docIcon}>
                    <Icon name="file" size={24} />
                  </div>
                  <div className={styles.docInfo}>
                    <span className={styles.docName}>{doc.name}</span>
                    <span className={styles.docMeta}>
                      {doc.size} · Caricato da {doc.uploadedBy} · {formatDate(doc.uploadedAt)}
                    </span>
                  </div>
                  <div className={styles.docActions}>
                    <button className={styles.docActionBtn} title="Scarica">
                      <Icon name="download" size={16} />
                    </button>
                    <button className={styles.docActionBtn} title="Elimina">
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      )}

      {activeTab === 3 && (
        <SectionCard title="Task">
          <div className={styles.kanbanBoard}>
            {['todo', 'in_progress', 'done'].map(status => (
              <div key={status} className={styles.kanbanColumn}>
                <div className={styles.kanbanHeader}>
                    <StatusBadge label={TASK_STATUS_LABELS[status]} variant={status === 'done' ? 'success' : status === 'in_progress' ? 'info' : 'neutral'} />
                  <span className={styles.kanbanCount}>
                    {mockTasks.filter(t => t.status === status).length}
                  </span>
                </div>
                <div className={styles.kanbanCards}>
                  {mockTasks
                    .filter(t => t.status === status)
                    .map((task, index) => (
                      <div key={task.id} className={styles.kanbanCard} style={{ animationDelay: `${index * 0.05}s` }}>
                        <div className={styles.kanbanCardHeader}>
                          <span className={`${styles.kanbanPriority} ${styles[`priority${task.priority}`]}`}>
                            {priorityConfig[task.priority].label}
                          </span>
                        </div>
                        <span className={styles.kanbanCardTitle}>{task.title}</span>
                        <div className={styles.kanbanCardFooter}>
                          <span className={styles.kanbanAssignee}>
                            <Icon name="user" size={12} />
                            {task.assignee}
                          </span>
                          <span className={styles.kanbanDue}>
                            <Icon name="calendar" size={12} />
                            {formatDate(task.dueAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {activeTab === 4 && (
        <SectionCard title="AI Insights">
          <div className={styles.aiList}>
            {mockAIInsights.map((insight, index) => (
              <div key={insight.id} className={styles.aiCard} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`${styles.aiIcon} ${styles[`ai${insight.type}`]}`}>
                  <Icon name={aiTypeConfig[insight.type].icon} size={24} />
                </div>
                <div className={styles.aiContent}>
                  <div className={styles.aiHeader}>
                    <span className={styles.aiTitle}>{insight.title}</span>
                    <span className={`${styles.aiBadge} ${styles[`ai${insight.type}`]}`}>
                      {aiTypeConfig[insight.type].label}
                    </span>
                  </div>
                  <p className={styles.aiDescription}>{insight.description}</p>
                  <div className={styles.aiConfidence}>
                    <div className={styles.aiConfidenceBar}>
                      <div className={styles.aiConfidenceFill} style={{ width: `${insight.confidence}%` }} />
                    </div>
                    <span className={styles.aiConfidenceLabel}>Confidenza {insight.confidence}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
