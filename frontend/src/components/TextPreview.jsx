import React, { useState } from 'react'

/**
 * Collapsible preview of the source text that will be summarised.
 */
export default function TextPreview({ text, label = 'Source Preview' }) {
  const [expanded, setExpanded] = useState(false)

  if (!text) return null

  const preview = text.slice(0, 600)
  const isTruncated = text.length > 600

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
        aria-expanded={expanded}
      >
        <span style={{
          display: 'inline-block',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform var(--transition)',
          fontSize: '10px',
        }}>▶</span>
        {label}
        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
          ({text.length.toLocaleString()} chars)
        </span>
      </button>

      {expanded && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          lineHeight: 1.8,
          color: 'var(--text-secondary)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '240px',
          overflowY: 'auto',
          animation: 'fadeUp 0.2s ease',
        }}>
          {preview}
          {isTruncated && (
            <span style={{ color: 'var(--text-muted)' }}>
              {'\n\n'}… ({(text.length - 600).toLocaleString()} more characters)
            </span>
          )}
        </div>
      )}
    </section>
  )
}
