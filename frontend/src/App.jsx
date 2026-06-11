import './i18n'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UIProvider } from './context/UIContext'
import { AppLayout } from './components/layout/AppLayout/AppLayout'
import { ToastContainer } from './components/feedback/Toast'
import { ProtectedRoute } from './components/ProtectedRoute'

import HomePage from './pages/public/HomePage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import NotFoundPage from './pages/public/NotFoundPage'
import FeaturesPage from './pages/public/FeaturesPage'
import PricingPage from './pages/public/PricingPage'
import DemoRequestPage from './pages/public/DemoRequestPage'

import { DashboardPage } from './pages/private/DashboardPage'
import { TendersListPage } from './pages/private/TendersListPage'
import { TenderDetailPage } from './pages/private/TenderDetailPage'
import { UsersPage } from './pages/private/UsersPage'
import { AuditLogPage } from './pages/private/AuditLogPage'
import { SettingsPage } from './pages/private/SettingsPage'
import { BandiBrowserPage } from './pages/private/BandiBrowserPage'

import { AdminDashboard } from './pages/admin/AdminDashboard'
import { TenantsPage } from './pages/admin/TenantsPage'
import { SubscriptionsPage } from './pages/admin/SubscriptionsPage'
import { GlobalAuditPage } from './pages/admin/GlobalAuditPage'

import { APP_ROUTES, ROLES } from './utils/constants'

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <Routes>
          {/* Public routes - no AppLayout wrapper */}
          <Route path={APP_ROUTES.HOME} element={<HomePage />} />
          <Route path={APP_ROUTES.FEATURES} element={<FeaturesPage />} />
          <Route path={APP_ROUTES.PRICING} element={<PricingPage />} />
          <Route path={APP_ROUTES.DEMO} element={<DemoRequestPage />} />
          <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />

          {/* Private routes - wrapped in AppLayout */}
          <Route element={<AppLayout />}>
            <Route element={<ProtectedRoute />}>
              <Route path={APP_ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={APP_ROUTES.TENDERS} element={<TendersListPage />} />
              <Route path={APP_ROUTES.TENDER_DETAIL} element={<TenderDetailPage />} />
              <Route path={APP_ROUTES.USERS} element={<UsersPage />} />
              <Route path={APP_ROUTES.AUDIT} element={<AuditLogPage />} />
              <Route path={APP_ROUTES.DISCOVERY} element={<BandiBrowserPage />} />
              <Route path={APP_ROUTES.SETTINGS} element={<SettingsPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole={ROLES.SUPERADMIN} />}>
              <Route path={APP_ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
              <Route path={APP_ROUTES.ADMIN_TENANTS} element={<TenantsPage />} />
              <Route path={APP_ROUTES.ADMIN_SUBSCRIPTIONS} element={<SubscriptionsPage />} />
              <Route path={APP_ROUTES.ADMIN_AUDIT} element={<GlobalAuditPage />} />
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
