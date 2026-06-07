import React from 'react'

/**
 * Textarea for pasting raw text.
 * Shows live character + word count.
 */
export default function TextInput({ value, onChange, disabled }) {
  const chars = value.length
  const words = value.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste your text here…"
        rows={8}
        style={{
          width: '100%',
          background: 'var(--bg-elevated)',
          border: `1.5px solid ${value ? 'var(--border-active)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          lineHeight: 1.7,
          padding: '16px',
          resize: 'vertical',
          transition: 'border-color var(--transition)',
          outline: 'none',
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
        onBlur={(e) => { e.target.style.borderColor = value ? 'var(--border-active)' : 'var(--border)' }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-muted)',
      }}>
        <span>Characters: <strong style={{ color: 'var(--text-secondary)' }}>{chars.toLocaleString()}</strong></span>
        <span>Words: <strong style={{ color: 'var(--text-secondary)' }}>{words.toLocaleString()}</strong></span>
      </div>
    </div>
  )
}
