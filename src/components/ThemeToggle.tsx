import { Moon, Sun } from 'lucide-react'
import { useTheme } from '#/providers/ThemeProvider'

/** Fixed top-right button that toggles light/dark mode. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '24px',
        background: 'none',
        border: 'none',
        padding: '4px',
        cursor: 'pointer',
        color: 'var(--color-muted)',
        display: 'flex',
        alignItems: 'center',
        opacity: 0.5,
        transition: 'opacity 200ms ease-out',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '0.5' }}
    >
      {theme === 'light' ? <Moon size={14} strokeWidth={1.5} /> : <Sun size={14} strokeWidth={1.5} />}
    </button>
  )
}
