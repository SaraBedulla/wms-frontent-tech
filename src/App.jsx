import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import CreateOrderPage from './pages/CreateOrderPage'
import InventoryPage from './pages/InventoryPage'
import UsersPage from './pages/UsersPage'

function RequireAuth({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />

      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Client routes */}
        <Route path="orders" element={<RequireAuth roles={['CLIENT']}><OrdersPage /></RequireAuth>} />
        <Route path="orders/new" element={<RequireAuth roles={['CLIENT']}><CreateOrderPage /></RequireAuth>} />
        <Route path="orders/:id" element={<RequireAuth roles={['CLIENT']}><OrderDetailPage /></RequireAuth>} />

        {/* Manager routes */}
        <Route path="manager/orders" element={<RequireAuth roles={['WAREHOUSE_MANAGER']}><OrdersPage manager /></RequireAuth>} />
        <Route path="manager/orders/:id" element={<RequireAuth roles={['WAREHOUSE_MANAGER']}><OrderDetailPage manager /></RequireAuth>} />

        {/* Shared inventory */}
        <Route path="inventory" element={<RequireAuth roles={['WAREHOUSE_MANAGER', 'CLIENT']}><InventoryPage /></RequireAuth>} />

        {/* Admin routes */}
        <Route path="users" element={<RequireAuth roles={['SYSTEM_ADMIN']}><UsersPage /></RequireAuth>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
