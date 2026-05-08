import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConverter } from './useConverter'

describe('useConverter', () => {
  it('initialises with empty state', () => {
    const { result } = renderHook(() => useConverter())
    expect(result.current.secret).toBe('')
    expect(result.current.input).toBe('')
    expect(result.current.output).toBe('')
    expect(result.current.error).toBeNull()
    expect(result.current.mode).toBe('encrypt')
  })

  it('auto-encrypts plaintext', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('mykey'))
    act(() => result.current.setInput('hello'))
    expect(result.current.output).toBeTruthy()
    expect(result.current.mode).toBe('encrypt')
    expect(result.current.error).toBeNull()
  })

  it('auto-decrypts valid ciphertext', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('mykey'))
    act(() => result.current.setInput('hello'))
    const cipher = result.current.output
    act(() => result.current.setInput(cipher))
    expect(result.current.output).toBe('hello')
    expect(result.current.mode).toBe('decrypt')
    expect(result.current.error).toBeNull()
  })

  it('clears output when input is emptied', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('mykey'))
    act(() => result.current.setInput('hello'))
    act(() => result.current.setInput(''))
    expect(result.current.output).toBe('')
  })

  it('encrypts with different ciphertexts for different secrets', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('key1'))
    act(() => result.current.setInput('hello'))
    const cipher1 = result.current.output
    act(() => result.current.setSecret('key2'))
    expect(result.current.output).not.toBe(cipher1)
    expect(result.current.output).toBeTruthy()
  })

  it('produces no output when secret is empty', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setInput('hello'))
    expect(result.current.output).toBe('')
  })

  it('clearInput resets input and output', () => {
    const { result } = renderHook(() => useConverter())
    act(() => result.current.setSecret('mykey'))
    act(() => result.current.setInput('hello'))
    expect(result.current.output).toBeTruthy()
    act(() => result.current.clearInput())
    expect(result.current.input).toBe('')
    expect(result.current.output).toBe('')
  })
})
