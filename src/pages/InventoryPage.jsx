import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../services/api'
import { PageHeader, Btn, Card, Modal, Input, Spinner, Alert, Empty, Badge } from '../components/ui'

const empty = { itemName: '', quantity: '', unitPrice: '' }

export default function InventoryPage() {
  const { user } = useAuth()
  const isManager = user?.role === 'WAREHOUSE_MANAGER'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try { const { data } = await getInventory(); setItems(data) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const openCreate = () => { setEditing(null); setForm(empty); setError(''); setModal(true) }
  const openEdit = (item) => { setEditing(item); setForm({ itemName: item.itemName, quantity: item.quantity, unitPrice: item.unitPrice }); setError(''); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      const payload = { itemName: form.itemName, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice) }
      if (editing) { const { data } = await updateInventoryItem(editing.id, payload); setItems(i => i.map(x => x.id === data.id ? data : x)) }
      else { const { data } = await createInventoryItem(payload); setItems(i => [...i, data]) }
      setModal(false)
    } catch (err) { setError(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.itemName}"?`)) return
    try { await deleteInventoryItem(item.id); setItems(i => i.filter(x => x.id !== item.id)) }
    catch (e) { alert(e.response?.data?.message || 'Cannot delete — item may be referenced by existing orders') }
  }

  const filtered = items.filter(i => i.itemName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-in">
      <PageHeader
        title="INVENTORY"
        subtitle={isManager ? 'Manage warehouse inventory items' : 'Browse available items'}
        action={isManager && <Btn onClick={openCreate}>+ Add Item</Btn>}
      />

      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..."
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 14px', color: 'var(--text)', fontSize: 13, width: 280 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><Spinner size={28} /></div>
      ) : filtered.length === 0 ? <Empty message="NO INVENTORY ITEMS" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {filtered.map(item => (
            <Card key={item.id} style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, flex: 1, marginRight: 8 }}>{item.itemName}</div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>${Number(item.unitPrice).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                  QTY: <span style={{ color: item.quantity > 50 ? 'var(--green)' : item.quantity > 10 ? 'var(--amber)' : 'var(--red)' }}>{item.quantity}</span>
                </div>
                {isManager && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn variant="ghost" size="sm" onClick={() => openEdit(item)}>Edit</Btn>
                    <Btn variant="danger" size="sm" onClick={() => handleDelete(item)}>Del</Btn>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT ITEM' : 'ADD ITEM'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Item Name" value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))} required />
          <Input label="Quantity" type="number" min={0} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
          <Input label="Unit Price ($)" type="number" min={0.01} step={0.01} value={form.unitPrice} onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))} required />
          <Alert type="error" message={error} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" type="button" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? <Spinner size={14} /> : editing ? 'Save Changes' : 'Create Item'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
