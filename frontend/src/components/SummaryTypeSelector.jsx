import React from 'react'

const TYPES = [
  {
    id: 'short',
    label: 'Short',
    desc: '3–5 bullet points',
    icon: '▪▪▪',
  },
  {
    id: 'medium',
    label: 'Medium',
    desc: 'Detailed paragraph',
    icon: '≡',
  },
  {
    id: 'detailed',
    label: 'Detailed',
    desc: 'Key points, insights & actions',
    icon: '⊞',
  },
]

export default function SummaryTypeSelector({ value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        Summary Type
      </label>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {TYPES.map(({ id, label, desc, icon }) => {
          const active = value === id
          return (
            <button
              key={id}
              onClick={() => !disabled && onChange(id)}
              disabled={disabled}
              aria-pressed={active}
              style={{
                flex: '1 1 0',
                minWidth: '100px',
                padding: '12px 16px',
                border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                background: active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition)',
                textAlign: 'left',
                fontFamily: 'var(--font-display)',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '16px',
                marginBottom: '6px',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
              }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                {label}
              </div>
              <div style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                opacity: 0.7,
              }}>
                {desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
