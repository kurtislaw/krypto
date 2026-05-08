interface SecretInputProps {
  value: string
  onChange: (value: string) => void
}

/** Borderless password-style input for the cipher secret/key. */
export function SecretInput({ value, onChange }: SecretInputProps) {
  return (
    <div>
      <label
        htmlFor="secret-input"
        style={{
          display: 'block',
          fontSize: '11px',
          color: 'var(--color-muted)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
      >
        Secret
      </label>
      <input
        id="secret-input"
        type="password"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Enter secret key"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  )
}
