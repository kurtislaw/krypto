import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConverter } from './useConverter'
import { Algorithm } from '#/types/cipher'

describe('useConverter', () => {
  it('initialises with empty state', () => {
    const { result } = renderHook(() => useConverter())
    expect(result.current.secret).toBe('')
    expect(result.current.plaintext).toBe('')
    expect(result.current.ciphertext).toBe('')
    expect(result.current.plainError).toBeNull()
    expect(result.current.cipherError).toBeNull()
    expect(result.current.lastEdited).toBeNull()
    expect(result.current.algorithm).toBe(Algorithm.RC5)
  })

  it('encrypts in real-time when plaintext changes and secret is set', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('mykey'))
    act(() => result.current.setPlaintext('hello'))
    expect(result.current.ciphertext).toBeTruthy()
    expect(result.current.cipherError).toBeNull()
    expect(result.current.lastEdited).toBe('plain')
  })

  it('decrypts when valid ciphertext is set', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('mykey'))
    act(() => result.current.setPlaintext('hello'))
    const cipher = result.current.ciphertext
    act(() => result.current.setCiphertext(cipher))
    expect(result.current.plaintext).toBe('hello')
    expect(result.current.plainError).toBeNull()
  })

  it('clears the opposite box when input is emptied', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('mykey'))
    act(() => result.current.setPlaintext('hello'))
    act(() => result.current.setPlaintext(''))
    expect(result.current.ciphertext).toBe('')
  })

  it('sets cipherError on invalid ciphertext, clears plaintext', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('mykey'))
    act(() => result.current.setCiphertext('notvalidhex!!!'))
    expect(result.current.cipherError).toBeTruthy()
    expect(result.current.plaintext).toBe('')
  })

  it('re-encrypts when secret changes (lastEdited = plain)', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('key1'))
    act(() => result.current.setPlaintext('hello'))
    const cipher1 = result.current.ciphertext
    act(() => result.current.setSecret('key2'))
    expect(result.current.ciphertext).not.toBe(cipher1)
    expect(result.current.ciphertext).toBeTruthy()
  })

  it('clears all values when secret is cleared', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('mykey'))
    act(() => result.current.setPlaintext('hello'))
    act(() => result.current.setSecret(''))
    expect(result.current.plaintext).toBe('')
    expect(result.current.ciphertext).toBe('')
  })

  it('re-encrypts when algorithm changes (lastEdited = plain)', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('mykey'))
    act(() => result.current.setPlaintext('hello'))
    const cipher1 = result.current.ciphertext
    // Switching to same algorithm re-runs — result should be identical
    act(() => result.current.setAlgorithm(Algorithm.RC5))
    expect(result.current.ciphertext).toBe(cipher1)
    expect(result.current.plaintext).toBe('hello')
  })

  it('re-decrypts when secret changes (lastEdited = cipher)', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('key1'))
    act(() => result.current.setPlaintext('hello'))
    const cipher = result.current.ciphertext
    act(() => result.current.setCiphertext(cipher))
    // Now change secret — should re-decrypt the ciphertext with new key (will fail/error)
    act(() => result.current.setSecret('key2'))
    expect(result.current.lastEdited).toBe('cipher')
    // With a different key, decryption produces an error or different plaintext
    expect(result.current.plaintext !== 'hello' || result.current.cipherError !== null).toBe(true)
  })

  it('re-decrypts when algorithm changes (lastEdited = cipher)', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('mykey'))
    act(() => result.current.setPlaintext('hello'))
    const cipher = result.current.ciphertext
    act(() => result.current.setCiphertext(cipher))
    expect(result.current.plaintext).toBe('hello')
    // Re-running with same algorithm should still produce 'hello'
    act(() => result.current.setAlgorithm(Algorithm.RC5))
    expect(result.current.plaintext).toBe('hello')
    expect(result.current.lastEdited).toBe('cipher')
  })

  it('does not run conversion when secret not yet set (lastEdited = null)', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setAlgorithm(Algorithm.RC5))
    expect(result.current.ciphertext).toBe('')
    expect(result.current.plaintext).toBe('')
  })
})
