import React from 'react'

const STEPS = [
  {
    id: 'short',
    label: 'Short',
    desc: '3–5 bullet points — quick glance',
  },
  {
    id: 'medium',
    label: 'Medium',
    desc: '150–250 word paragraph — balanced overview',
  },
  {
    id: 'detailed',
    label: 'Detailed',
    desc: 'Key points, insights, conclusion & actions',
  },
]

const ID_TO_INDEX = { short: 0, medium: 1, detailed: 2 }

export default function SummaryTypeSelector({ value, onChange, disabled }) {
  const index = ID_TO_INDEX[value] ?? 0
  const current = STEPS[index]

  // Track fill: 0% at short, 50% at medium, 100% at detailed
  const fillPct = index * 50

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Summary Length
        </label>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--accent)',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {current.label}
        </span>
      </div>

      {/* Slider */}
      <div style={{ position: 'relative', padding: '4px 0' }}>
        <input
          type="range"
          className="summary-slider"
          min={0}
          max={2}
          step={1}
          value={index}
          disabled={disabled}
          onChange={e => onChange(STEPS[Number(e.target.value)].id)}
          style={{
            background: `linear-gradient(to right, var(--accent) ${fillPct}%, var(--border) ${fillPct}%)`,
          }}
        />

        {/* Tick marks + labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '10px',
        }}>
          {STEPS.map((step, i) => {
            const active = i === index
            return (
              <button
                key={step.id}
                onClick={() => !disabled && onChange(step.id)}
                disabled={disabled}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: i === 0 ? 'flex-start' : i === 2 ? 'flex-end' : 'center',
                  gap: '4px',
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                {/* Tick dot */}
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: active ? 'var(--accent)' : 'var(--border-active)',
                  transition: 'background var(--transition)',
                  alignSelf: i === 0 ? 'flex-start' : i === 2 ? 'flex-end' : 'center',
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'color var(--transition)',
                  userSelect: 'none',
                }}>
                  {step.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Description */}
      <div style={{
        padding: '10px 14px',
        background: 'var(--accent-dim2)',
        border: '1px solid var(--accent-dim)',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        transition: 'all var(--transition)',
      }}>
        <span style={{ color: 'var(--accent)', marginRight: '8px' }}>→</span>
        {current.desc}
      </div>
    </div>
  )
}
