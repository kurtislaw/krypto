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

  it('produces base64 output', () => {
    expect(encrypt('test', 'key')).toMatch(/^[A-Za-z0-9+/]+=*$/)
  })

  it('output decodes to a multiple of 8 bytes (one RC5 block)', () => {
    const b64 = encrypt('test', 'key')
    const raw = atob(b64)
    expect(raw.length % 8).toBe(0)
  })

  it('different secrets produce different ciphertext', () => {
    expect(encrypt('same', 'key1')).not.toBe(encrypt('same', 'key2'))
  })

  it('throws on ciphertext that is not a multiple of 8 bytes when decoded', () => {
    // base64 of 4 bytes ("AAAA" decodes to 3 bytes, not a multiple of 8)
    expect(() => decrypt('AAAA', 'key')).toThrow()
  })

  it('throws on non-base64 ciphertext', () => {
    expect(() => decrypt('not!!valid==base64!!', 'key')).toThrow()
  })
})
