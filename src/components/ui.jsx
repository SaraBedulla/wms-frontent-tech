// ─── Button ──────────────────────────────────────────────────────────────────
export function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: 'var(--font-body)', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid', borderRadius: 'var(--radius)', transition: 'all 0.15s',
    opacity: disabled ? 0.5 : 1,
    fontSize: size === 'sm' ? 12 : 13,
    padding: size === 'sm' ? '5px 10px' : '8px 16px',
  }
  const variants = {
    primary:   { background: 'var(--accent)',   color: '#0d0f12',        borderColor: 'var(--accent)' },
    success:   { background: 'var(--greenbg)',  color: 'var(--green)',   borderColor: 'var(--green)' },
    danger:    { background: 'var(--redbg)',    color: 'var(--red)',     borderColor: 'var(--red)' },
    secondary: { background: 'var(--bg3)',      color: 'var(--text2)',   borderColor: 'var(--border2)' },
    warning:   { background: 'var(--amberbg)',  color: 'var(--amber)',   borderColor: 'var(--amber)' },
    ghost:     { background: 'transparent',     color: 'var(--text2)',   borderColor: 'var(--border)' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
const statusColors = {
  CREATED:           { bg: 'var(--bg3)',      color: 'var(--text2)',    border: 'var(--border2)' },
  AWAITING_APPROVAL: { bg: 'var(--amberbg)',  color: 'var(--amber)',    border: 'var(--amber)' },
  APPROVED:          { bg: 'var(--bluebg)',   color: 'var(--blue)',     border: 'var(--blue)' },
  DECLINED:          { bg: 'var(--redbg)',    color: 'var(--red)',      border: 'var(--red)' },
  FULFILLED:         { bg: 'var(--greenbg)',  color: 'var(--green)',    border: 'var(--green)' },
  CANCELED:          { bg: 'var(--bg3)',      color: 'var(--text3)',    border: 'var(--border)' },
  CLIENT:            { bg: 'var(--bluebg)',   color: 'var(--blue)',     border: 'var(--blue)' },
  WAREHOUSE_MANAGER: { bg: 'var(--greenbg)',  color: 'var(--green)',    border: 'var(--green)' },
  SYSTEM_ADMIN:      { bg: 'var(--accentbg)', color: 'var(--accent)',   border: 'var(--accent)' },
}

export function Badge({ label }) {
  const c = statusColors[label] || statusColors.CREATED
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px',
      borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)',
      letterSpacing: '0.5px', fontWeight: 500,
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}44`
    }}>{label?.replace(/_/g, ' ')}</span>
  )
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: '2px solid var(--border)',
      borderTopColor: 'var(--accent)',
      animation: 'spin 0.7s linear infinite'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</label>}
      <input {...props} style={{
        background: 'var(--bg3)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)',
        fontSize: 13, transition: 'border-color 0.15s', width: '100%',
        ...props.style
      }}
        onFocus={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

// ─── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, children, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</label>}
      <select {...props} style={{
        background: 'var(--bg3)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)',
        fontSize: 13, width: '100%', cursor: 'pointer',
        ...props.style
      }}>{children}</select>
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 24px',
      ...style
    }}>{children}</div>
  )
}

// ─── Page Header ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 2, color: 'var(--text)', lineHeight: 1 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function Empty({ message = 'No data found' }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>◻</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1 }}>{message}</div>
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 'var(--radius-lg)', padding: '24px', width: '100%',
        maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
        animation: 'fadeIn 0.2s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text3)', fontSize: 18, padding: 4 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Alert ───────────────────────────────────────────────────────────────────
export function Alert({ type = 'error', message }) {
  if (!message) return null
  const colors = { error: 'var(--red)', success: 'var(--green)', info: 'var(--blue)' }
  const bgs = { error: 'var(--redbg)', success: 'var(--greenbg)', info: 'var(--bluebg)' }
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 'var(--radius)',
      background: bgs[type], color: colors[type],
      border: `1px solid ${colors[type]}44`, fontSize: 13
    }}>{message}</div>
  )
}
