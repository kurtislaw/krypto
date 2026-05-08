interface ConversionBoxProps {
  label: string
  value: string
  error: string | null
  onChange: (value: string) => void
  placeholder?: string
}

/** Borderless textarea with an associated label and optional inline error. */
export function ConversionBox({ label, value, error, onChange, placeholder }: ConversionBoxProps) {
  const id = `box-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: '11px',
          color: 'var(--color-muted)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={10}
        spellCheck={false}
        style={{ fontFamily: 'monospace', fontSize: '12px' }}
      />
      {error && (
        <span style={{ fontSize: '11px', color: 'var(--color-error)' }}>
          {error}
        </span>
      )}
    </div>
  )
}
