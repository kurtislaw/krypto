import { describe, it, expect } from 'vitest'
import { encrypt, decrypt } from './rc5'

describe('RC5-32/12', () => {
  it('roundtrips a plain ASCII message', () => {
    const secret = 'mysecret'
    expect(decrypt(encrypt('Hello, world!', secret), secret)).toBe('Hello, world!')
  })

  it('roundtrips an empty string', () => {
    const secret = 'key'
    expect(decrypt(encrypt('', secret), secret)).toBe('')
  })

  it('roundtrips unicode text', () => {
    const plain = 'こんにちは 🔐'
    const secret = 'key'
    expect(decrypt(encrypt(plain, secret), secret)).toBe(plain)
  })

  it('roundtrips a long message', () => {
    const plain = 'a'.repeat(500)
    const secret = 'longkey'
    expect(decrypt(encrypt(plain, secret), secret)).toBe(plain)
  })

  it('produces hex-only output', () => {
    expect(encrypt('test', 'key')).toMatch(/^[0-9a-f]+$/)
  })

  it('output length is a multiple of 16 hex chars (one 8-byte block)', () => {
    expect(encrypt('test', 'key').length % 16).toBe(0)
  })

  it('different secrets produce different ciphertext', () => {
    expect(encrypt('same', 'key1')).not.toBe(encrypt('same', 'key2'))
  })

  it('throws on ciphertext not a multiple of 16 hex chars', () => {
    expect(() => decrypt('aabbccdd', 'key')).toThrow()
  })

  it('throws on non-hex ciphertext', () => {
    expect(() => decrypt('zzzzzzzzzzzzzzzz', 'key')).toThrow()
  })
})
