import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyOrders, getAllOrders, getInventory, getAllUsers } from '../services/api'
import { PageHeader, Card, Badge, Spinner, Btn } from '../components/ui'

const statuses = ['CREATED','AWAITING_APPROVAL','APPROVED','DECLINED','FULFILLED','CANCELED']

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [user?.role])

  const loadData = async () => {
    setLoading(true)
    try {
      if (user?.role === 'CLIENT') {
        const { data } = await getMyOrders()
        const counts = {}
        statuses.forEach(s => counts[s] = data.filter(o => o.status === s).length)
        setStats(counts)
        setRecent(data.slice(0, 5))
      } else if (user?.role === 'WAREHOUSE_MANAGER') {
        const [ordersRes, invRes] = await Promise.all([getAllOrders(), getInventory()])
        const counts = {}
        statuses.forEach(s => counts[s] = ordersRes.data.filter(o => o.status === s).length)
        setStats({ ...counts, inventory: invRes.data.length })
        setRecent(ordersRes.data.filter(o => o.status === 'AWAITING_APPROVAL').slice(0, 5))
      } else if (user?.role === 'SYSTEM_ADMIN') {
        const { data } = await getAllUsers()
        const roleCounts = { CLIENT: 0, WAREHOUSE_MANAGER: 0, SYSTEM_ADMIN: 0 }
        data.forEach(u => roleCounts[u.role] = (roleCounts[u.role] || 0) + 1)
        setStats({ total: data.length, ...roleCounts })
        setRecent(data.slice(0, 5))
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={32} /></div>
  )

  return (
    <div className="animate-in">
      <PageHeader
        title="DASHBOARD"
        subtitle={`Welcome back, ${user?.fullName}`}
        action={user?.role === 'CLIENT' && <Btn onClick={() => navigate('/orders/new')}>+ New Order</Btn>}
      />

      {/* Stats */}
      {user?.role === 'CLIENT' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 32 }}>
          {statuses.map(s => (
            <Card key={s} style={{ padding: '16px', cursor: 'pointer' }} onClick={() => navigate(`/orders?status=${s}`)}>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--accent)', letterSpacing: 1 }}>{stats[s] || 0}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginTop: 4, letterSpacing: 1 }}>{s.replace(/_/g,' ')}</div>
            </Card>
          ))}
        </div>
      )}

      {user?.role === 'WAREHOUSE_MANAGER' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 32 }}>
          {[...statuses, 'inventory'].map(s => (
            <Card key={s} style={{ padding: '16px' }}>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: s === 'AWAITING_APPROVAL' ? 'var(--amber)' : s === 'inventory' ? 'var(--blue)' : 'var(--accent)', letterSpacing: 1 }}>{stats[s] || 0}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginTop: 4, letterSpacing: 1 }}>{s === 'inventory' ? 'ITEMS' : s.replace(/_/g,' ')}</div>
            </Card>
          ))}
        </div>
      )}

      {user?.role === 'SYSTEM_ADMIN' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {[['total','TOTAL USERS','var(--text)'],['CLIENT','CLIENTS','var(--blue)'],['WAREHOUSE_MANAGER','MANAGERS','var(--green)'],['SYSTEM_ADMIN','ADMINS','var(--accent)']].map(([k,l,c]) => (
            <Card key={k} style={{ padding: '16px' }}>
              <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', color: c, letterSpacing: 1 }}>{stats[k] || 0}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginTop: 4, letterSpacing: 1 }}>{l}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <Card>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 1, marginBottom: 16 }}>
            {user?.role === 'WAREHOUSE_MANAGER' ? 'PENDING APPROVAL' : user?.role === 'SYSTEM_ADMIN' ? 'RECENT USERS' : 'RECENT ORDERS'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recent.map((item, i) => (
              <div key={item.id || i}
                onClick={() => {
                  if (user?.role === 'CLIENT') navigate(`/orders/${item.id}`)
                  else if (user?.role === 'WAREHOUSE_MANAGER') navigate(`/manager/orders/${item.id}`)
                  else navigate('/users')
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 'var(--radius)',
                  cursor: user?.role !== 'SYSTEM_ADMIN' ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                  borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none'
                }}
                onMouseEnter={e => user?.role !== 'SYSTEM_ADMIN' && (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {user?.role === 'SYSTEM_ADMIN' ? (
                  <>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.fullName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>@{item.username}</div>
                    </div>
                    <Badge label={item.role} />
                  </>
                ) : (
                  <>
                    <div>
                      <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{item.orderNumber}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{item.clientFullName || item.clientUsername}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>${item.totalAmount?.toFixed(2)}</span>
                      <Badge label={item.status} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
