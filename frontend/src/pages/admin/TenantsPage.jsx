import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { DataTable } from '../../components/tables/DataTable'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { APP_ROUTES } from '../../utils/constants'
import { formatDate } from '../../utils/date'

const mockTenants = [
  { id: 1, name: 'Acme S.p.A.', email: 'admin@acme.it', users: 12, tenders: 8, status: 'active', createdAt: '2026-01-15' },
  { id: 2, name: 'Beta Srl', email: 'info@beta.it', users: 5, tenders: 3, status: 'active', createdAt: '2026-03-01' },
  { id: 3, name: 'Gamma Consulting', email: 'admin@gamma.it', users: 8, tenders: 15, status: 'disabled', createdAt: '2026-02-20' },
]

export function TenantsPage() {
  const columns = [
    { label: 'Azienda', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Utenti', render: row => row.users },
    { label: 'Gare', render: row => row.tenders },
    { label: 'Stato', render: row => <StatusBadge label={row.status === 'active' ? 'Attivo' : 'Disabilitato'} variant={row.status === 'active' ? 'success' : 'neutral'} /> },
    { label: 'Registrato il', render: row => formatDate(row.createdAt) },
  ]

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Admin', to: APP_ROUTES.ADMIN_DASHBOARD },
        { label: 'Tenant' },
      ]} />
      <PageHeader title="Tenant" subtitle="Gestione di tutti i tenant della piattaforma" />
      <DataTable columns={columns} data={mockTenants} />
    </div>
  )
}
