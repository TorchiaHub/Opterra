import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Loader } from './feedback/Loader'
import { APP_ROUTES } from '../utils/constants'

export function ProtectedRoute({ requiredRole }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return <Loader label="Verifica sessione..." />
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={APP_ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
