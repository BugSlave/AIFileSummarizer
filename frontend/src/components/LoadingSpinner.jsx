import React from 'react'

export default function LoadingSpinner({ message = 'Processing…' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '40px',
    }}>
      {/* Terminal-style spinner */}
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '2px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{
          position: 'absolute',
          inset: 8,
          border: '1.5px solid transparent',
          borderTopColor: 'rgba(232,255,71,0.3)',
          borderRadius: '50%',
          animation: 'spin 1.4s linear infinite reverse',
        }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--accent)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          {message}
        </p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginTop: '6px',
        }}>
          Ollama is generating — this may take a moment
        </p>
      </div>
    </div>
  )
}
