import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getMyOrders, getAllOrders } from '../services/api'
import { PageHeader, Badge, Spinner, Empty, Card, Btn } from '../components/ui'
import { useAuth } from '../context/AuthContext'

const STATUSES = ['ALL','CREATED','AWAITING_APPROVAL','APPROVED','DECLINED','FULFILLED','CANCELED']

export default function OrdersPage({ manager = false }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const activeStatus = searchParams.get('status') || 'ALL'

  useEffect(() => { load() }, [activeStatus, manager])

  const load = async () => {
    setLoading(true)
    try {
      const status = activeStatus === 'ALL' ? null : activeStatus
      const { data } = manager ? await getAllOrders(status) : await getMyOrders(status)
      setOrders(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const setStatus = (s) => setSearchParams(s === 'ALL' ? {} : { status: s })

  return (
    <div className="animate-in">
      <PageHeader
        title={manager ? 'ALL ORDERS' : 'MY ORDERS'}
        subtitle={manager ? 'View and manage all client orders' : 'Track and manage your orders'}
        action={!manager && <Btn onClick={() => navigate('/orders/new')}>+ New Order</Btn>}
      />

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)} style={{
            padding: '5px 12px', borderRadius: 4, fontSize: 11,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', cursor: 'pointer',
            border: '1px solid', transition: 'all 0.15s',
            background: activeStatus === s ? 'var(--accent)' : 'var(--bg3)',
            color: activeStatus === s ? '#0d0f12' : 'var(--text3)',
            borderColor: activeStatus === s ? 'var(--accent)' : 'var(--border)'
          }}>{s.replace(/_/g, ' ')}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><Spinner size={28} /></div>
      ) : orders.length === 0 ? (
        <Empty message={`NO ORDERS${activeStatus !== 'ALL' ? ` WITH STATUS ${activeStatus}` : ''}`} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {orders.map(order => (
            <Card key={order.id} style={{
              cursor: 'pointer', padding: '16px 20px', transition: 'border-color 0.15s',
            }}
              onClick={() => navigate(manager ? `/manager/orders/${order.id}` : `/orders/${order.id}`)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', flexShrink: 0 }}>{order.orderNumber}</span>
                  {manager && <span style={{ fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.clientFullName}</span>}
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                  {order.deadlineDate && <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>Due {order.deadlineDate}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)' }}>${order.totalAmount?.toFixed(2)}</span>
                  <Badge label={order.status} />
                  <span style={{ color: 'var(--text3)', fontSize: 12 }}>›</span>
                </div>
              </div>
              {order.declineReason && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--red)', fontStyle: 'italic', paddingLeft: 0 }}>
                  ✕ {order.declineReason}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
