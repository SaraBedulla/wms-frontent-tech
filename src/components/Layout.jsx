import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../index.css'

const icons = {
  dashboard: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  orders: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  inventory: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
  users: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  logout: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
}

const navStyle = ({ isActive }) => ({
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '8px 12px', borderRadius: '6px',
  color: isActive ? 'var(--accent)' : 'var(--text2)',
  background: isActive ? 'var(--accentbg)' : 'transparent',
  border: `1px solid ${isActive ? '#3d2e08' : 'transparent'}`,
  fontSize: '13px', fontWeight: 400, transition: 'all 0.15s',
  textDecoration: 'none'
})

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const roleColor = {
    CLIENT: 'var(--blue)',
    WAREHOUSE_MANAGER: 'var(--green)',
    SYSTEM_ADMIN: 'var(--accent)'
  }[user?.role] || 'var(--text3)'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, minWidth: 220,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 2, color: 'var(--accent)', lineHeight: 1 }}>WMS</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '1.5px', marginTop: 3 }}>WAREHOUSE MGMT</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          <NavLink to="/dashboard" style={navStyle}>{icons.dashboard} Dashboard</NavLink>

          {user?.role === 'CLIENT' && <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '1.5px', padding: '10px 12px 4px', textTransform: 'uppercase' }}>Orders</div>
            <NavLink to="/orders" style={navStyle}>{icons.orders} My Orders</NavLink>
            <NavLink to="/inventory" style={navStyle}>{icons.inventory} Inventory</NavLink>
          </>}

          {user?.role === 'WAREHOUSE_MANAGER' && <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '1.5px', padding: '10px 12px 4px', textTransform: 'uppercase' }}>Management</div>
            <NavLink to="/manager/orders" style={navStyle}>{icons.orders} All Orders</NavLink>
            <NavLink to="/inventory" style={navStyle}>{icons.inventory} Inventory</NavLink>
          </>}

          {user?.role === 'SYSTEM_ADMIN' && <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '1.5px', padding: '10px 12px 4px', textTransform: 'uppercase' }}>Administration</div>
            <NavLink to="/users" style={navStyle}>{icons.users} Users</NavLink>
          </>}
        </nav>

        {/* User card */}
        <div style={{ padding: '10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: roleColor + '22', border: `1px solid ${roleColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: roleColor, flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', letterSpacing: '0.5px' }}>{user?.role?.replace('_', ' ')}</div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{ background: 'none', color: 'var(--text3)', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >{icons.logout}</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }} className="animate-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
