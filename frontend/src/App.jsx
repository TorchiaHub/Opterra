import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UIProvider } from './context/UIContext'
import { AppLayout } from './components/layout/AppLayout/AppLayout'
import { ToastContainer } from './components/feedback/Toast'
import { ProtectedRoute } from './components/ProtectedRoute'

import { HomePage } from './pages/public/HomePage'
import { LoginPage } from './pages/public/LoginPage'
import { RegisterPage } from './pages/public/RegisterPage'
import { NotFoundPage } from './pages/public/NotFoundPage'

import { DashboardPage } from './pages/private/DashboardPage'
import { TendersListPage } from './pages/private/TendersListPage'
import { TenderDetailPage } from './pages/private/TenderDetailPage'

import { AdminDashboard } from './pages/admin/AdminDashboard'
import { TenantsPage } from './pages/admin/TenantsPage'

import { APP_ROUTES, ROLES } from './utils/constants'

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public */}
            <Route path={APP_ROUTES.HOME} element={<HomePage />} />
            <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />

            {/* Private - tenant */}
            <Route element={<ProtectedRoute />}>
              <Route path={APP_ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={APP_ROUTES.TENDERS} element={<TendersListPage />} />
              <Route path={APP_ROUTES.TENDER_DETAIL} element={<TenderDetailPage />} />
            </Route>

            {/* Private - admin */}
            <Route element={<ProtectedRoute requiredRole={ROLES.SUPERADMIN} />}>
              <Route path={APP_ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
              <Route path={APP_ROUTES.ADMIN_TENANTS} element={<TenantsPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer />
      </UIProvider>
    </AuthProvider>
  )
}

export default App
