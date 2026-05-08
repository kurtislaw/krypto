/**
 * RC5-32/12 block cipher.
 * Block size: 64 bits (two 32-bit words). Rounds: 12. Key: any length.
 * Plaintext is UTF-8 encoded, PKCS7 padded, then encrypted in ECB mode.
 * Ciphertext is hex-encoded.
 */

const ROUNDS = 12
const SUBKEYS = 2 * (ROUNDS + 1) // 26
const P32 = 0xb7e15163
const Q32 = 0x9e3779b9

function u32add(a: number, b: number): number {
  return (a + b) >>> 0
}

function u32sub(a: number, b: number): number {
  return (a - b) >>> 0
}

function rotl32(x: number, n: number): number {
  n = n & 31
  return ((x << n) | (x >>> (32 - n))) >>> 0
}

function rotr32(x: number, n: number): number {
  n = n & 31
  return ((x >>> n) | (x << (32 - n))) >>> 0
}

function expandKey(secret: string): Uint32Array {
  const keyBytes = new TextEncoder().encode(secret || '\x00')
  const wordCount = Math.max(1, Math.ceil(keyBytes.length / 4))
  const L = new Uint32Array(wordCount)

  for (let i = keyBytes.length - 1; i >= 0; i--) {
    L[Math.floor(i / 4)] = u32add(rotl32(L[Math.floor(i / 4)], 8), keyBytes[i])
  }

  const S = new Uint32Array(SUBKEYS)
  S[0] = P32
  for (let i = 1; i < SUBKEYS; i++) S[i] = u32add(S[i - 1], Q32)

  let A = 0, B = 0, si = 0, li = 0
  const iters = 3 * Math.max(SUBKEYS, wordCount)
  for (let k = 0; k < iters; k++) {
    S[si] = rotl32(u32add(u32add(S[si], A), B), 3)
    A = S[si]
    si = (si + 1) % SUBKEYS
    L[li] = rotl32(u32add(u32add(L[li], A), B), u32add(A, B))
    B = L[li]
    li = (li + 1) % wordCount
  }

  return S
}

function encryptBlock(A: number, B: number, S: Uint32Array): [number, number] {
  A = u32add(A, S[0])
  B = u32add(B, S[1])
  for (let i = 1; i <= ROUNDS; i++) {
    A = u32add(rotl32(A ^ B, B), S[2 * i])
    B = u32add(rotl32(B ^ A, A), S[2 * i + 1])
  }
  return [A, B]
}

function decryptBlock(A: number, B: number, S: Uint32Array): [number, number] {
  for (let i = ROUNDS; i >= 1; i--) {
    B = rotr32(u32sub(B, S[2 * i + 1]), A) ^ A
    A = rotr32(u32sub(A, S[2 * i]), B) ^ B
  }
  return [u32sub(A, S[0]), u32sub(B, S[1])]
}

/** Encrypts a UTF-8 string with RC5-32/12. Returns a lowercase hex string. */
export function encrypt(plaintext: string, secret: string): string {
  const bytes = new TextEncoder().encode(plaintext)
  const padLen = 8 - (bytes.length % 8)
  const padded = new Uint8Array(bytes.length + padLen)
  padded.set(bytes)
  padded.fill(padLen, bytes.length)

  const S = expandKey(secret)
  const out = new Uint8Array(padded.length)
  const inView = new DataView(padded.buffer)
  const outView = new DataView(out.buffer)

  for (let i = 0; i < padded.length; i += 8) {
    const [A, B] = encryptBlock(inView.getUint32(i, true), inView.getUint32(i + 4, true), S)
    outView.setUint32(i, A, true)
    outView.setUint32(i + 4, B, true)
  }

  return Array.from(out).map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Decrypts a hex-encoded RC5-32/12 ciphertext. Throws on malformed input. */
export function decrypt(ciphertext: string, secret: string): string {
  if (ciphertext.length % 16 !== 0) {
    throw new Error('Ciphertext length must be a multiple of 16 hex characters')
  }
  if (!/^[0-9a-fA-F]+$/.test(ciphertext)) {
    throw new Error('Ciphertext must be hex-encoded')
  }

  const bytes = new Uint8Array(ciphertext.length / 2)
  for (let i = 0; i < ciphertext.length; i += 2) {
    bytes[i / 2] = parseInt(ciphertext.slice(i, i + 2), 16)
  }

  const S = expandKey(secret)
  const out = new Uint8Array(bytes.length)
  const inView = new DataView(bytes.buffer)
  const outView = new DataView(out.buffer)

  for (let i = 0; i < bytes.length; i += 8) {
    const [A, B] = decryptBlock(inView.getUint32(i, true), inView.getUint32(i + 4, true), S)
    outView.setUint32(i, A, true)
    outView.setUint32(i + 4, B, true)
  }

  const padLen = out[out.length - 1]
  if (padLen < 1 || padLen > 8) throw new Error('Invalid PKCS7 padding')

  return new TextDecoder().decode(out.slice(0, out.length - padLen))
}
