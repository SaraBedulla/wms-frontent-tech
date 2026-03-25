import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMyOrderById, getOrderById, submitOrder, cancelOrder, approveOrder, declineOrder, fulfillOrder, updateOrder, getInventory } from '../services/api'
import { PageHeader, Badge, Btn, Card, Modal, Input, Spinner, Alert } from '../components/ui'
import AttachmentsPanel from '../components/AttachmentsPanel'

export default function OrderDetailPage({ manager = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [declineModal, setDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [editModal, setEditModal] = useState(false)
  const [inventory, setInventory] = useState([])
  const [editItems, setEditItems] = useState([])
  const [editDeadline, setEditDeadline] = useState('')

  useEffect(() => { load() }, [id, manager])

  const load = async () => {
    setLoading(true)
    try {
      const { data } = manager ? await getOrderById(id) : await getMyOrderById(id)
      setOrder(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const openEdit = async () => {
    const { data } = await getInventory()
    setInventory(data)
    setEditItems(order.items.map(i => ({ inventoryItemId: i.inventoryItemId, quantity: i.quantity })))
    setEditDeadline(order.deadlineDate || '')
    setEditModal(true)
  }

  const handleAction = async (action) => {
    setError(''); setActionLoading(true)
    try {
      let res
      if (action.action === 'SUBMIT') res = await submitOrder(id)
      else if (action.action === 'CANCEL') res = await cancelOrder(id)
      else if (action.action === 'APPROVE') res = await approveOrder(id)
      else if (action.action === 'FULFILL') res = await fulfillOrder(id)
      else if (action.action === 'EDIT') { openEdit(); setActionLoading(false); return }
      setOrder(res.data)
    } catch (e) { setError(e.response?.data?.message || 'Action failed') }
    finally { setActionLoading(false) }
  }

  const handleDecline = async () => {
    if (!declineReason.trim()) return
    setActionLoading(true)
    try {
      const { data } = await declineOrder(id, { reason: declineReason })
      setOrder(data); setDeclineModal(false); setDeclineReason('')
    } catch (e) { setError(e.response?.data?.message || 'Failed to decline') }
    finally { setActionLoading(false) }
  }

  const handleEdit = async () => {
    setActionLoading(true)
    try {
      const { data } = await updateOrder(id, {
        deadlineDate: editDeadline || null,
        items: editItems.filter(i => i.inventoryItemId && i.quantity > 0)
      })
      setOrder(data); setEditModal(false)
    } catch (e) { setError(e.response?.data?.message || 'Update failed') }
    finally { setActionLoading(false) }
  }

  const btnVariant = { primary: 'primary', success: 'success', danger: 'danger', secondary: 'secondary', warning: 'warning' }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={28} /></div>
  if (!order) return <div style={{ color: 'var(--text3)' }}>Order not found</div>

  return (
    <div className="animate-in">
      {/* Back button */}
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => navigate(manager ? '/manager/orders' : '/orders')}
          style={{ background: 'none', color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--font-mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← BACK
        </button>
      </div>

      <PageHeader
        title={order.orderNumber}
        subtitle={`Client: ${order.clientFullName} (${order.clientUsername})`}
        action={<Badge label={order.status} />}
      />

      <Alert type="error" message={error} />

      {/* Dynamic action buttons */}
      {order.availableActions?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', marginTop: error ? 12 : 0 }}>
          {order.availableActions.map(a => (
            <Btn key={a.action}
              variant={btnVariant[a.color] || 'secondary'}
              disabled={actionLoading}
              onClick={() => a.action === 'DECLINE' ? setDeclineModal(true) : handleAction(a)}
            >
              {actionLoading ? <Spinner size={14} /> : a.label}
            </Btn>
          ))}
        </div>
      )}

      {order.declineReason && (
        <div style={{ background: 'var(--redbg)', border: '1px solid var(--red)44', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--red)' }}>
          <strong>Declined:</strong> {order.declineReason}
        </div>
      )}

      {/* Info + summary grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 16 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1, marginBottom: 12 }}>ORDER INFO</div>
          {[
            ['Order Number', order.orderNumber],
            ['Status', null, <Badge label={order.status} />],
            ['Submitted', order.submittedDate ? new Date(order.submittedDate).toLocaleString() : '—'],
            ['Deadline', order.deadlineDate || '—'],
          ].map(([k, v, el]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text3)' }}>{k}</span>
              {el || <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v}</span>}
            </div>
          ))}
        </Card>

        <Card style={{ padding: 16 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1, marginBottom: 12 }}>SUMMARY</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ color: 'var(--text3)' }}>Total Items</span>
            <span>{order.items?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ color: 'var(--text3)' }}>Attachments</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: order.attachmentCount > 0 ? 'var(--accent)' : 'var(--text3)' }}>
              {order.attachmentCount || 0}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
            <span style={{ color: 'var(--text3)' }}>Total Amount</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)' }}>
              ${order.totalAmount?.toFixed(2)}
            </span>
          </div>
        </Card>
      </div>

      {/* Items table */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1, marginBottom: 16 }}>ORDER ITEMS</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Item', 'Unit Price', 'Quantity', 'Line Total'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text3)', fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items?.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 8px' }}>{item.itemName}</td>
                <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>${item.unitPrice?.toFixed(2)}</td>
                <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)' }}>× {item.quantity}</td>
                <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>${item.lineTotal?.toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--text3)', fontSize: 12 }}>TOTAL</td>
              <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>${order.totalAmount?.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* Attachments panel */}
      <AttachmentsPanel
        orderId={Number(id)}
        orderStatus={order.status}
      />

      {/* Decline modal */}
      <Modal open={declineModal} onClose={() => setDeclineModal(false)} title="DECLINE ORDER">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>
            Provide a reason for declining order <strong style={{ color: 'var(--accent)' }}>{order.orderNumber}</strong>. The client will see this message.
          </p>
          <Input label="Reason" value={declineReason} onChange={e => setDeclineReason(e.target.value)} placeholder="e.g. Items out of stock..." />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setDeclineModal(false)}>Cancel</Btn>
            <Btn variant="danger" onClick={handleDecline} disabled={!declineReason.trim() || actionLoading}>
              {actionLoading ? <Spinner size={14} /> : 'Decline Order'}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="EDIT ORDER">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Deadline Date" type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} />
          <div>
            <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, marginBottom: 8 }}>Items</div>
            {editItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <select value={item.inventoryItemId}
                  onChange={e => setEditItems(items => items.map((it, i) => i === idx ? { ...it, inventoryItemId: Number(e.target.value) } : it))}
                  style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '7px 10px', color: 'var(--text)', fontSize: 12 }}>
                  <option value="">Select item...</option>
                  {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.itemName}</option>)}
                </select>
                <input type="number" min={1} value={item.quantity}
                  onChange={e => setEditItems(items => items.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) } : it))}
                  style={{ width: 70, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '7px 10px', color: 'var(--text)', fontSize: 12 }} />
                <button onClick={() => setEditItems(items => items.filter((_, i) => i !== idx))}
                  style={{ background: 'var(--redbg)', color: 'var(--red)', border: '1px solid var(--red)44', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            ))}
            <Btn variant="ghost" size="sm" onClick={() => setEditItems(i => [...i, { inventoryItemId: '', quantity: 1 }])}>+ Add Item</Btn>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setEditModal(false)}>Cancel</Btn>
            <Btn onClick={handleEdit} disabled={actionLoading}>{actionLoading ? <Spinner size={14} /> : 'Save Changes'}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  )
}
