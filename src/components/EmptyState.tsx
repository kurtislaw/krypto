/** Shown in place of conversion boxes until a secret is entered. */
export function EmptyState() {
  return (
    <p
      className="animate-fade-up"
      style={{
        color: 'var(--color-muted)',
        fontSize: '13px',
        textAlign: 'center',
        padding: '48px 0',
        margin: 0,
      }}
    >
      Enter a secret to get started
    </p>
  )
}
