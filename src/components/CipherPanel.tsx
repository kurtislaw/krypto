import { useConverter } from '#/lib/hooks/useConverter'
import { AlgorithmSelect } from './AlgorithmSelect'
import { ConversionBox } from './ConversionBox'
import { EmptyState } from './EmptyState'
import { SecretInput } from './SecretInput'
import { ThemeToggle } from './ThemeToggle'

/**
 * Smart container for the cipher tool.
 * Owns no crypto logic — delegates entirely to useConverter.
 * All child components are dumb and receive values + callbacks only.
 */
export function CipherPanel() {
  const {
    secret,
    algorithm,
    plaintext,
    ciphertext,
    plainError,
    cipherError,
    setSecret,
    setAlgorithm,
    setPlaintext,
    setCiphertext,
  } = useConverter()

  return (
    <div
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '72px 24px 64px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '36px',
      }}
    >
      <ThemeToggle />

      <header style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h1
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--color-text)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          krypto
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: 0 }}>
          encode and decode messages
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SecretInput value={secret} onChange={setSecret} />
        <AlgorithmSelect value={algorithm} onChange={setAlgorithm} />
      </div>

      {secret ? (
        <div
          className="animate-fade-up"
          style={{ display: 'flex', gap: '20px' }}
        >
          <ConversionBox
            label="Plaintext"
            value={plaintext}
            error={plainError}
            onChange={setPlaintext}
            placeholder="Type or paste plaintext…"
          />
          <ConversionBox
            label="Ciphertext"
            value={ciphertext}
            error={cipherError}
            onChange={setCiphertext}
            placeholder="Type or paste ciphertext…"
          />
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
