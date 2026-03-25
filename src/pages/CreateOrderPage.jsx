import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, getInventory } from '../services/api'
import { PageHeader, Btn, Card, Input, Spinner, Alert } from '../components/ui'

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState([])
  const [items, setItems] = useState([{ inventoryItemId: '', quantity: 1 }])
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getInventory().then(({ data }) => setInventory(data)).catch(console.error)
  }, [])

  const addItem = () => setItems(i => [...i, { inventoryItemId: '', quantity: 1 }])
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx))
  const updateItem = (idx, key, val) => setItems(i => i.map((it, j) => j === idx ? { ...it, [key]: val } : it))

  const getItemPrice = (id) => inventory.find(i => i.id === Number(id))?.unitPrice || 0
  const lineTotal = (item) => getItemPrice(item.inventoryItemId) * item.quantity
  const grandTotal = items.reduce((sum, i) => sum + lineTotal(i), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const validItems = items.filter(i => i.inventoryItemId && i.quantity > 0)
    if (!validItems.length) { setError('Add at least one item'); return }
    setLoading(true)
    try {
      const { data } = await createOrder({
        deadlineDate: deadline || null,
        items: validItems.map(i => ({ inventoryItemId: Number(i.inventoryItemId), quantity: Number(i.quantity) }))
      })
      navigate(`/orders/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order')
    } finally { setLoading(false) }
  }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => navigate('/orders')} style={{ background: 'none', color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>← BACK</button>
      </div>
      <PageHeader title="NEW ORDER" subtitle="Create a new order for warehouse items" />

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1, marginBottom: 16 }}>ORDER DETAILS</div>
              <Input label="Deadline Date (optional)" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>ITEMS</div>
                <Btn variant="ghost" size="sm" type="button" onClick={addItem}>+ Add Item</Btn>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map((item, idx) => {
                  const invItem = inventory.find(i => i.id === Number(item.inventoryItemId))
                  return (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px auto', gap: 8, alignItems: 'center' }}>
                      <select value={item.inventoryItemId}
                        onChange={e => updateItem(idx, 'inventoryItemId', e.target.value)}
                        style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 10px', color: item.inventoryItemId ? 'var(--text)' : 'var(--text3)', fontSize: 13 }}>
                        <option value="">Select item...</option>
                        {inventory.map(inv => (
                          <option key={inv.id} value={inv.id}>{inv.itemName} — ${inv.unitPrice?.toFixed(2)}</option>
                        ))}
                      </select>
                      <input type="number" min={1} value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', e.target.value)}
                        style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 10px', color: 'var(--text)', fontSize: 13, textAlign: 'center' }} />
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', textAlign: 'right' }}>
                        ${lineTotal(item).toFixed(2)}
                      </div>
                      <button type="button" onClick={() => removeItem(idx)}
                        style={{ background: 'var(--redbg)', color: 'var(--red)', border: '1px solid var(--red)44', borderRadius: 4, padding: '7px 10px', cursor: 'pointer', fontSize: 12 }}>✕</button>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Alert type="error" message={error} />
          </div>

          {/* Summary */}
          <Card style={{ position: 'sticky', top: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1, marginBottom: 16 }}>SUMMARY</div>
            {items.filter(i => i.inventoryItemId).map((item, idx) => {
              const inv = inventory.find(i => i.id === Number(item.inventoryItemId))
              return inv ? (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--border)', color: 'var(--text2)' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{inv.itemName}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>${lineTotal(item).toFixed(2)}</span>
                </div>
              ) : null
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>TOTAL</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--accent)', fontWeight: 600 }}>${grandTotal.toFixed(2)}</span>
            </div>
            <Btn type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
              {loading ? <Spinner size={16} /> : 'Create Order'}
            </Btn>
          </Card>
        </div>
      </form>
    </div>
  )
}
