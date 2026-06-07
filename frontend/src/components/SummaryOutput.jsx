import React, { useState } from 'react'

/**
 * Renders the generated summary with copy + download actions.
 * Props:
 *   summary     — string
 *   summaryType — 'short' | 'medium' | 'detailed'
 *   charCount   — number (of original content)
 *   wordCount   — number (of original content)
 */
export default function SummaryOutput({ summary, summaryType, charCount, wordCount }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = summary
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `summary-${summaryType}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Render markdown-ish: lines starting with ## become section headers, • become bullets
  const renderSummary = () => {
    const lines = summary.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <p key={i} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--accent)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginTop: i === 0 ? 0 : '20px',
            marginBottom: '8px',
          }}>
            {line.replace('## ', '')}
          </p>
        )
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <div key={i} style={{
            display: 'flex',
            gap: '10px',
            padding: '6px 0',
          }}>
            <span style={{
              color: 'var(--accent)',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              flexShrink: 0,
              marginTop: '1px',
            }}>▸</span>
            <span style={{ fontSize: '14px', lineHeight: 1.6 }}>
              {line.replace(/^[•\-]\s*/, '')}
            </span>
          </div>
        )
      }
      if (!line.trim()) {
        return <div key={i} style={{ height: '8px' }} />
      }
      return (
        <p key={i} style={{ fontSize: '14px', lineHeight: 1.7, marginBottom: '8px' }}>
          {line}
        </p>
      )
    })
  }

  const summaryWords = summary.trim().split(/\s+/).length
  const summaryChars = summary.length

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeUp 0.3s ease' }}>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--accent)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Generated Summary
          </span>
          <span style={{
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: '2px',
            border: '1px solid rgba(232,255,71,0.2)',
            textTransform: 'uppercase',
          }}>
            {summaryType}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleCopy} style={btnStyle(copied ? 'success' : 'default')}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button onClick={handleDownload} style={btnStyle('default')}>
            ↓ Download
          </button>
        </div>
      </div>

      {/* Summary body */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        color: 'var(--text-primary)',
      }}>
        {renderSummary()}
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-muted)',
      }}>
        <span>
          <span style={{ color: 'var(--text-secondary)' }}>Input:</span>{' '}
          {charCount?.toLocaleString() ?? '—'} chars &nbsp;·&nbsp; {wordCount?.toLocaleString() ?? '—'} words
        </span>
        <span>
          <span style={{ color: 'var(--text-secondary)' }}>Summary:</span>{' '}
          {summaryChars.toLocaleString()} chars &nbsp;·&nbsp; {summaryWords.toLocaleString()} words
        </span>
      </div>
    </section>
  )
}

function btnStyle(variant) {
  const isSuccess = variant === 'success'
  return {
    padding: '6px 14px',
    border: `1px solid ${isSuccess ? 'rgba(71,255,156,0.3)' : 'var(--border-active)'}`,
    borderRadius: 'var(--radius-sm)',
    background: isSuccess ? 'var(--success-dim)' : 'var(--bg-elevated)',
    color: isSuccess ? 'var(--success)' : 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all var(--transition)',
  }
}
