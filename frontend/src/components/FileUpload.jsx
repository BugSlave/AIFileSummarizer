import React, { useCallback, useRef, useState } from 'react'

const ALLOWED_TYPES = {
  'text/plain': 'txt',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}
const MAX_BYTES = 20 * 1024 * 1024  // 20 MB
const MAX_LABEL = '20 MB'

/**
 * Drag-and-drop + click-to-browse file upload zone.
 * Props:
 *   file        — currently selected File | null
 *   onFile      — (file: File | null) => void
 *   disabled    — boolean
 */
export default function FileUpload({ file, onFile, disabled }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState(null)

  const validate = useCallback((f) => {
    if (!ALLOWED_TYPES[f.type]) {
      return `Unsupported type "${f.type || f.name.split('.').pop()}". Use TXT, PDF, or DOCX.`
    }
    if (f.size > MAX_BYTES) {
      return `File exceeds ${MAX_LABEL} limit (${(f.size / 1024 / 1024).toFixed(1)} MB).`
    }
    return null
  }, [])

  const handleFile = useCallback((f) => {
    const err = validate(f)
    if (err) {
      setFileError(err)
      onFile(null)
    } else {
      setFileError(null)
      onFile(f)
    }
  }, [validate, onFile])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [disabled, handleFile])

  const onDragOver = (e) => { e.preventDefault(); if (!disabled) setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const onInputChange = (e) => { const f = e.target.files[0]; if (f) handleFile(f) }

  const ext = file ? file.name.split('.').pop().toUpperCase() : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        aria-label="Upload file"
        style={{
          border: `1.5px dashed ${dragging ? 'var(--accent)' : file ? 'var(--success)' : 'var(--border-active)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: dragging
            ? 'var(--accent-dim)'
            : file
              ? 'var(--success-dim)'
              : 'var(--bg-elevated)',
          transition: 'all var(--transition)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.pdf,.docx"
          style={{ display: 'none' }}
          onChange={onInputChange}
          disabled={disabled}
        />

        {/* Icon */}
        <div style={{
          width: 48, height: 48,
          border: `1.5px solid ${file ? 'var(--success)' : 'var(--border-active)'}`,
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
          color: file ? 'var(--success)' : 'var(--text-secondary)',
          background: 'var(--bg-card)',
          flexShrink: 0,
        }}>
          {file ? '✓' : '↑'}
        </div>

        {file ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              justifyContent: 'center', marginBottom: '4px'
            }}>
              <span style={{
                background: 'var(--success-dim)',
                color: 'var(--success)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: '3px',
                border: '1px solid rgba(71,255,156,0.2)',
              }}>{ext}</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '14px',
                color: 'var(--text-primary)',
                wordBreak: 'break-all',
              }}>{file.name}</span>
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>
              {(file.size / 1024).toFixed(1)} KB — click to change
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontWeight: 600,
              fontSize: '14px',
              color: dragging ? 'var(--accent)' : 'var(--text-primary)',
              marginBottom: '4px',
            }}>
              {dragging ? 'Drop it.' : 'Drop file here or click to browse'}
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}>
              TXT · PDF · DOCX &nbsp;·&nbsp; max {MAX_LABEL}
            </p>
          </div>
        )}
      </div>

      {fileError && (
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--danger)',
          background: 'var(--danger-dim)',
          border: '1px solid rgba(255,71,71,0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
        }}>
          ⚠ {fileError}
        </p>
      )}
    </div>
  )
}
