import { useState, useEffect, useRef } from 'react'
import { listAttachments, uploadAttachment, getAttachmentPresignedUrl, deleteAttachment } from '../services/api'
import { Btn, Spinner, Alert, Card } from './ui'
import { useAuth } from '../context/AuthContext'

const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const fileIcon = (contentType) => {
  if (!contentType) return '📄'
  if (contentType.startsWith('image/')) return '🖼'
  if (contentType === 'application/pdf') return '📕'
  if (contentType.includes('word') || contentType.includes('document')) return '📝'
  if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊'
  if (contentType.includes('zip') || contentType.includes('compressed')) return '🗜'
  return '📄'
}

export default function AttachmentsPanel({ orderId, orderStatus, readOnly = false }) {
  const { user } = useAuth()
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)
  const fileInputRef = useRef(null)

  const isClient = user?.role === 'CLIENT'
  const isManager = user?.role === 'WAREHOUSE_MANAGER'
  const canUpload = isManager ||
    (isClient && (orderStatus === 'CREATED' || orderStatus === 'DECLINED'))
  const canDelete = isClient &&
    (orderStatus === 'CREATED' || orderStatus === 'DECLINED')

  useEffect(() => { load() }, [orderId])

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await listAttachments(orderId)
      setAttachments(data)
    } catch (e) {
      setError('Failed to load attachments')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setError(''); setSuccess(''); setUploading(true)
    try {
      const { data } = await uploadAttachment(orderId, file)
      setAttachments(prev => [...prev, data])
      setSuccess(`"${file.name}" uploaded successfully`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (attachment) => {
    setDownloadingId(attachment.id)
    try {
      // Get pre-signed URL and open in new tab — fastest for large files
      const { data: url } = await getAttachmentPresignedUrl(orderId, attachment.id)
      window.open(url, '_blank')
    } catch (err) {
      setError('Download failed')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (attachment) => {
    if (!confirm(`Delete "${attachment.originalName}"?`)) return
    try {
      await deleteAttachment(orderId, attachment.id)
      setAttachments(prev => prev.filter(a => a.id !== attachment.id))
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <Card style={{ padding: '20px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>
            ATTACHMENTS
          </span>
          {attachments.length > 0 && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
              background: 'var(--accentbg)', color: 'var(--accent)',
              border: '1px solid var(--accent)44', borderRadius: 4,
              padding: '1px 7px'
            }}>{attachments.length}</span>
          )}
        </div>
        {canUpload && !readOnly && (
          <>
            <Btn
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading
                ? <><Spinner size={12} /> Uploading...</>
                : <>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                    Upload File
                  </>
              }
            </Btn>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept="*/*"
            />
          </>
        )}
      </div>

      {/* Alerts */}
      {error && <Alert type="error" message={error} />}
      {success && (
        <div style={{
          padding: '8px 12px', borderRadius: 'var(--radius)', marginBottom: 12,
          background: 'var(--greenbg)', color: 'var(--green)',
          border: '1px solid var(--green)44', fontSize: 12
        }}>{success}</div>
      )}

      {/* Upload hint for clients on editable orders */}
      {isClient && !canUpload && !readOnly && (
        <div style={{
          fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)',
          padding: '8px 12px', background: 'var(--bg3)', borderRadius: 'var(--radius)',
          marginBottom: 12
        }}>
          Uploads only available when order is CREATED or DECLINED
        </div>
      )}

      {/* File list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <Spinner size={20} />
        </div>
      ) : attachments.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '28px 20px',
          color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1
        }}>
          <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>📎</div>
          NO ATTACHMENTS
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {attachments.map((attachment, i) => (
            <div
              key={attachment.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 'var(--radius)',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                transition: 'border-color 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* File icon */}
              <span style={{ fontSize: 20, flexShrink: 0 }}>
                {fileIcon(attachment.contentType)}
              </span>

              {/* File info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {attachment.originalName}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                    {formatBytes(attachment.fileSize)}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>·</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {attachment.uploadedBy}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>·</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => handleDownload(attachment)}
                  disabled={downloadingId === attachment.id}
                  title="Download"
                  style={{
                    background: 'var(--bluebg)', color: 'var(--blue)',
                    border: '1px solid var(--blue)44', borderRadius: 4,
                    padding: '5px 10px', cursor: 'pointer', fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 4,
                    opacity: downloadingId === attachment.id ? 0.5 : 1
                  }}
                >
                  {downloadingId === attachment.id
                    ? <Spinner size={12} />
                    : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                      </svg>
                  }
                  Download
                </button>

                {canDelete && !readOnly && (
                  <button
                    onClick={() => handleDelete(attachment)}
                    title="Delete"
                    style={{
                      background: 'var(--redbg)', color: 'var(--red)',
                      border: '1px solid var(--red)44', borderRadius: 4,
                      padding: '5px 8px', cursor: 'pointer', fontSize: 12
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
