// Mock matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { useContext } from 'react'
import { ThemeProvider, ThemeContext } from './ThemeProvider'

function Inspector() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </>
  )
}

describe('ThemeProvider', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })
  it('provides a valid theme value', () => {
    render(<ThemeProvider><Inspector /></ThemeProvider>)
    expect(['light', 'dark']).toContain(screen.getByTestId('theme').textContent)
  })

  it('toggleTheme flips between light and dark', () => {
    render(<ThemeProvider><Inspector /></ThemeProvider>)
    const initial = screen.getByTestId('theme').textContent
    act(() => screen.getByRole('button').click())
    expect(screen.getByTestId('theme').textContent).not.toBe(initial)
    act(() => screen.getByRole('button').click())
    expect(screen.getByTestId('theme').textContent).toBe(initial)
  })

  it('adds .dark class to <html> when theme is dark', () => {
    render(<ThemeProvider><Inspector /></ThemeProvider>)
    if (screen.getByTestId('theme').textContent === 'light') {
      act(() => screen.getByRole('button').click())
    }
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes .dark class from <html> when theme is light', () => {
    render(<ThemeProvider><Inspector /></ThemeProvider>)
    if (screen.getByTestId('theme').textContent === 'dark') {
      act(() => screen.getByRole('button').click())
    }
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
