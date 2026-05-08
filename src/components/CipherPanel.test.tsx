Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CipherPanel } from './CipherPanel'
import { ThemeProvider } from '#/providers/ThemeProvider'

let store: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
})
vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

beforeEach(() => {
  store = {}
})

describe('CipherPanel', () => {
  it('shows empty state when secret is blank', () => {
    render(<CipherPanel />, { wrapper: Wrapper })
    expect(screen.getByText('Enter a secret to get started')).toBeTruthy()
    expect(screen.queryByLabelText(/^input$/i)).toBeNull()
  })

  it('reveals input box once a secret is entered', () => {
    render(<CipherPanel />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText(/secret/i), { target: { value: 'mykey' } })
    expect(screen.queryByText('Enter a secret to get started')).toBeNull()
    expect(screen.getByLabelText(/^input$/i)).toBeTruthy()
  })

  it('auto-encrypts plaintext and shows preview', () => {
    render(<CipherPanel />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText(/secret/i), { target: { value: 'mykey' } })
    fireEvent.change(screen.getByLabelText(/^input$/i), { target: { value: 'hello' } })
    const preview = screen.getByTestId('output-preview')
    expect(preview.textContent).toMatch(/^[A-Za-z0-9+/]+=*$/)
  })

  it('auto-decrypts ciphertext and shows preview', () => {
    render(<CipherPanel />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText(/secret/i), { target: { value: 'mykey' } })
    fireEvent.change(screen.getByLabelText(/^input$/i), { target: { value: 'hello' } })
    const cipher = screen.getByTestId('output-preview').textContent ?? ''
    fireEvent.change(screen.getByLabelText(/^input$/i), { target: { value: cipher } })
    expect(screen.getByTestId('output-preview').textContent).toBe('hello')
  })

  it('hides boxes when secret is cleared', () => {
    render(<CipherPanel />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText(/secret/i), { target: { value: 'mykey' } })
    fireEvent.change(screen.getByLabelText(/secret/i), { target: { value: '' } })
    expect(screen.getByText('Enter a secret to get started')).toBeTruthy()
  })

  it('shows hint initially and hides it after cmd+enter', () => {
    render(<CipherPanel />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText(/secret/i), { target: { value: 'mykey' } })
    fireEvent.change(screen.getByLabelText(/^input$/i), { target: { value: 'hello' } })
    expect(screen.getByText(/text → copies encrypted/)).toBeTruthy()
    fireEvent.keyDown(screen.getByLabelText(/^input$/i), { key: 'Enter', metaKey: true })
    expect(screen.queryByText(/text → copies encrypted/)).toBeNull()
  })

  it('does not show hint after it has been dismissed', () => {
    localStorage.setItem('krypto_hint_dismissed', '1')
    render(<CipherPanel />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText(/secret/i), { target: { value: 'mykey' } })
    expect(screen.queryByText(/text → copies encrypted/)).toBeNull()
  })
})
