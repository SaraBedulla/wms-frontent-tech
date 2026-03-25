import { useState, useEffect } from 'react'
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/api'
import { PageHeader, Btn, Card, Modal, Input, Select, Spinner, Alert, Empty, Badge } from '../components/ui'

const emptyForm = { username: '', password: '', fullName: '', email: '', role: 'CLIENT', enabled: true }

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try { const { data } = await getAllUsers(); setUsers(data) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setModal(true) }
  const openEdit = (u) => {
    setEditing(u)
    setForm({ username: u.username, password: '', fullName: u.fullName, email: u.email, role: u.role, enabled: u.enabled })
    setError(''); setModal(true)
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      if (editing) {
        const payload = { fullName: form.fullName, email: form.email, role: form.role, enabled: form.enabled, password: form.password || undefined }
        const { data } = await updateUser(editing.id, payload)
        setUsers(u => u.map(x => x.id === data.id ? data : x))
      } else {
        const { data } = await createUser(form)
        setUsers(u => [...u, data])
      }
      setModal(false)
    } catch (err) { setError(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (u) => {
    if (!confirm(`Delete user "${u.username}"?`)) return
    try { await deleteUser(u.id); setUsers(users => users.filter(x => x.id !== u.id)) }
    catch (e) { alert(e.response?.data?.message || 'Failed to delete user') }
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-in">
      <PageHeader title="USERS" subtitle="Manage system users and their roles"
        action={<Btn onClick={openCreate}>+ New User</Btn>} />

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
        style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 14px', color: 'var(--text)', fontSize: 13, width: 280, marginBottom: 16 }} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><Spinner size={28} /></div>
      ) : filtered.length === 0 ? <Empty message="NO USERS FOUND" /> : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                {['User', 'Email', 'Role', 'Status', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text3)', fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500 }}>{u.fullName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>@{u.username}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}><Badge label={u.role} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: u.enabled ? 'var(--green)' : 'var(--text3)', background: u.enabled ? 'var(--greenbg)' : 'var(--bg4)', padding: '2px 8px', borderRadius: 4, border: `1px solid ${u.enabled ? 'var(--green)' : 'var(--border)'}44` }}>
                      {u.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Btn variant="ghost" size="sm" onClick={() => openEdit(u)}>Edit</Btn>
                      <Btn variant="danger" size="sm" onClick={() => handleDelete(u)}>Del</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT USER' : 'NEW USER'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Full Name" value={form.fullName} onChange={set('fullName')} required />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
          {!editing && <Input label="Username" value={form.username} onChange={set('username')} required />}
          <Input label={editing ? 'New Password (leave blank to keep)' : 'Password'} type="password"
            value={form.password} onChange={set('password')} required={!editing} />
          <Select label="Role" value={form.role} onChange={set('role')}>
            <option value="CLIENT">CLIENT</option>
            <option value="WAREHOUSE_MANAGER">WAREHOUSE_MANAGER</option>
            <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
          </Select>
          {editing && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.enabled} onChange={set('enabled')} />
              Account enabled
            </label>
          )}
          <Alert type="error" message={error} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Btn variant="ghost" type="button" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? <Spinner size={14} /> : editing ? 'Save Changes' : 'Create User'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
