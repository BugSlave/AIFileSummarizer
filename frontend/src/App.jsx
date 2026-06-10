import React, { useState, useEffect, useCallback } from 'react'
import FileUpload from './components/FileUpload.jsx'
import TextInput from './components/TextInput.jsx'
import SummaryTypeSelector from './components/SummaryTypeSelector.jsx'
import SummaryOutput from './components/SummaryOutput.jsx'
import TextPreview from './components/TextPreview.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'
import { checkHealth, summarizeFile, summarizeText } from './services/api.js'

const INPUT_MODE_FILE = 'file'
const INPUT_MODE_TEXT = 'text'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Input mode
  const [inputMode, setInputMode] = useState(INPUT_MODE_FILE)
  const [file, setFile] = useState(null)
  const [pastedText, setPastedText] = useState('')

  // Summarization
  const [summaryType, setSummaryType] = useState('short')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)   // { summary, summaryType, charCount, wordCount }
  const [error, setError] = useState(null)

  // Health
  const [healthStatus, setHealthStatus] = useState('checking') // 'checking' | 'ok' | 'error'
  const [ollamaStatus, setOllamaStatus] = useState('unknown')

  // Ping health on mount
  useEffect(() => {
    checkHealth()
      .then(data => {
        setHealthStatus('ok')
        setOllamaStatus(data.ollama || 'unknown')
      })
      .catch(() => {
        setHealthStatus('error')
        setOllamaStatus('unreachable')
      })
  }, [])

  const canSubmit = !loading && (
    inputMode === INPUT_MODE_FILE ? !!file : pastedText.trim().length > 0
  )

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let data
      if (inputMode === INPUT_MODE_FILE) {
        data = await summarizeFile(file, summaryType)
      } else {
        data = await summarizeText(pastedText, summaryType)
      }
      setResult({
        summary: data.summary,
        summaryType: data.summary_type || summaryType,
        charCount: data.char_count,
        wordCount: data.word_count,
      })
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }, [canSubmit, inputMode, file, pastedText, summaryType])

  const handleReset = () => {
    setFile(null)
    setPastedText('')
    setResult(null)
    setError(null)
  }

  const sourceText = inputMode === INPUT_MODE_TEXT ? pastedText : null

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 80px 0' }}>
      {/* ── Header ─────────────────────────────────────── */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--accent)',
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 800,
            color: 'var(--bg-primary)',
            fontFamily: 'var(--font-display)',
            flexShrink: 0,
          }}>Σ</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '16px',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            AI File Summarizer
          </span>
        </div>

        {/* Right side: theme toggle + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* Theme toggle */}
        <button
          onClick={() => setDarkMode(d => !d)}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all var(--transition)',
            userSelect: 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <span style={{ fontSize: '13px' }}>{darkMode ? '☀' : '◑'}</span>
          {darkMode ? 'Light' : 'Dark'}
        </button>

        {/* Status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: 7, height: 7,
            borderRadius: '50%',
            background: healthStatus === 'ok'
              ? (ollamaStatus === 'connected' ? 'var(--success)' : 'orange')
              : healthStatus === 'checking' ? 'var(--text-muted)' : 'var(--danger)',
            animation: healthStatus === 'checking' ? 'pulse 1s infinite' : 'none',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
          }}>
            {healthStatus === 'checking' ? 'connecting…' :
             healthStatus === 'error' ? 'backend offline' :
             ollamaStatus === 'connected' ? 'ready' : 'ollama offline'}
          </span>
        </div>

        </div>{/* end right side */}
      </header>

      {/* ── Main Layout ────────────────────────────────── */}
      <main style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}>

        {/* Page title */}
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(28px, 5vw, 42px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>
            Summarize anything.<br />
            <span style={{ color: 'var(--accent)' }}>Instantly.</span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}>
            Powered by qwen3:8b via Ollama — running locally on your machine.
          </p>
        </div>

        {/* ── Input card ─── */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          animation: 'fadeUp 0.4s ease 0.05s both',
        }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
            {[
              { id: INPUT_MODE_FILE, label: 'Upload File' },
              { id: INPUT_MODE_TEXT, label: 'Paste Text' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setInputMode(id); handleReset() }}
                disabled={loading}
                style={{
                  padding: '7px 18px',
                  border: 'none',
                  borderRadius: '6px',
                  background: inputMode === id ? 'var(--bg-elevated)' : 'transparent',
                  color: inputMode === id ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: inputMode === id ? 600 : 400,
                  fontSize: '13px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition)',
                  boxShadow: inputMode === id ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* File or text input */}
          {inputMode === INPUT_MODE_FILE ? (
            <FileUpload file={file} onFile={setFile} disabled={loading} />
          ) : (
            <TextInput value={pastedText} onChange={setPastedText} disabled={loading} />
          )}

          {/* Summary type */}
          <SummaryTypeSelector
            value={summaryType}
            onChange={setSummaryType}
            disabled={loading}
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              padding: '14px 28px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: canSubmit ? 'var(--accent)' : 'var(--bg-elevated)',
              color: canSubmit ? 'var(--bg-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '15px',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'all var(--transition)',
              letterSpacing: '-0.01em',
            }}
          >
            {loading ? 'Generating…' : '→ Generate Summary'}
          </button>
        </div>

        {/* ── Loading ─── */}
        {loading && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <LoadingSpinner message={`Generating ${summaryType} summary…`} />
          </div>
        )}

        {/* ── Error ─── */}
        {error && (
          <div style={{
            background: 'var(--danger-dim)',
            border: '1px solid rgba(255,71,71,0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            animation: 'fadeUp 0.3s ease',
          }}>
            <span style={{ color: 'var(--danger)', fontSize: '18px', flexShrink: 0 }}>⚠</span>
            <div>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '14px',
                color: 'var(--danger)',
                marginBottom: '4px',
              }}>Error</p>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}>{error}</p>
            </div>
          </div>
        )}

        {/* ── Source preview ─── */}
        {sourceText && !loading && (
          <TextPreview text={sourceText} label="Source Text Preview" />
        )}

        {/* ── Result ─── */}
        {result && !loading && (
          <SummaryOutput
            summary={result.summary}
            summaryType={result.summaryType}
            charCount={result.charCount}
            wordCount={result.wordCount}
          />
        )}

        {/* ── Reset ─── */}
        {result && !loading && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleReset}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                padding: '8px 20px',
                cursor: 'pointer',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = 'var(--border-active)'; e.target.style.color = 'var(--text-secondary)' }}
              onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }}
            >
              ↺ Start over
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
