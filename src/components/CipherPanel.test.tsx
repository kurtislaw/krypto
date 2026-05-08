Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CipherPanel } from './CipherPanel'
import { ThemeProvider } from '#/providers/ThemeProvider'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

describe('CipherPanel', () => {
  it('shows empty state when secret is blank', () => {
    render(<CipherPanel />, { wrapper: Wrapper })
    expect(screen.getByText('Enter a secret to get started')).toBeTruthy()
    expect(screen.queryByLabelText(/plaintext/i)).toBeNull()
    expect(screen.queryByLabelText(/ciphertext/i)).toBeNull()
  })

  it('reveals conversion boxes once a secret is entered', () => {
    render(<CipherPanel />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText(/secret/i), { target: { value: 'mykey' } })
    expect(screen.queryByText('Enter a secret to get started')).toBeNull()
    expect(screen.getByLabelText(/plaintext/i)).toBeTruthy()
    expect(screen.getByLabelText(/ciphertext/i)).toBeTruthy()
  })

  it('encrypts in real-time as plaintext is typed', () => {
    render(<CipherPanel />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText(/secret/i), { target: { value: 'mykey' } })
    fireEvent.change(screen.getByLabelText(/plaintext/i), { target: { value: 'hello' } })
    const cipherBox = screen.getByLabelText(/ciphertext/i) as HTMLTextAreaElement
    expect(cipherBox.value).toMatch(/^[A-Za-z0-9+/]+=*$/)
  })

  it('decrypts in real-time as ciphertext is typed', () => {
    render(<CipherPanel />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText(/secret/i), { target: { value: 'mykey' } })
    fireEvent.change(screen.getByLabelText(/plaintext/i), { target: { value: 'hello' } })
    const cipher = (screen.getByLabelText(/ciphertext/i) as HTMLTextAreaElement).value
    // Clear plaintext then paste cipher to test decrypt direction
    fireEvent.change(screen.getByLabelText(/plaintext/i), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText(/ciphertext/i), { target: { value: cipher } })
    expect((screen.getByLabelText(/plaintext/i) as HTMLTextAreaElement).value).toBe('hello')
  })

  it('hides conversion boxes when secret is cleared', () => {
    render(<CipherPanel />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText(/secret/i), { target: { value: 'mykey' } })
    fireEvent.change(screen.getByLabelText(/secret/i), { target: { value: '' } })
    expect(screen.getByText('Enter a secret to get started')).toBeTruthy()
  })
})
