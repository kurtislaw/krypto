# Krypto Cipher Tool — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-time bidirectional RC5 cipher SPA with dark/light mode and a refined, borderless UI.

**Architecture:** Strict one-way layer dependency (Types → Config → Service → Runtime → UI). Cross-cutting concerns enter only through Providers. All crypto runs client-side as pure functions consumed by a single `useConverter` hook. `CipherPanel` is the only smart component — everything else is dumb.

**Tech Stack:** React 19, TanStack Start, Tailwind CSS v4, tw-animate-css, Vitest, @testing-library/react, TypeScript, pnpm

---

## File Map

| Action | Path | Layer | Responsibility |
|---|---|---|---|
| Create | `src/types/cipher.ts` | Types | `Algorithm` enum, `CipherDef` interface, `ConversionState` type |
| Create | `src/config/algorithms.ts` | Config | Registry mapping each `Algorithm` → its `CipherDef` |
| Create | `src/lib/ciphers/rc5.ts` | Service | RC5-32/12 pure `encrypt` / `decrypt` |
| Create | `src/lib/ciphers/rc5.test.ts` | Service | Tests for RC5 |
| Create | `src/lib/hooks/useConverter.ts` | Runtime | Bidirectional state + real-time conversion logic |
| Create | `src/lib/hooks/useConverter.test.ts` | Runtime | Tests for useConverter |
| Create | `src/providers/ThemeProvider.tsx` | Providers | Dark/light context, `.dark` class on `<html>` |
| Create | `src/providers/ThemeProvider.test.tsx` | Providers | Tests for ThemeProvider |
| Create | `src/components/ThemeToggle.tsx` | UI | Fixed top-right sun/moon button |
| Create | `src/components/SecretInput.tsx` | UI | Borderless password input |
| Create | `src/components/AlgorithmSelect.tsx` | UI | Borderless algorithm dropdown |
| Create | `src/components/ConversionBox.tsx` | UI | Borderless textarea + inline error |
| Create | `src/components/EmptyState.tsx` | UI | "Enter a secret to get started" prompt |
| Create | `src/components/CipherPanel.tsx` | UI | Smart container, uses `useConverter` |
| Create | `src/components/CipherPanel.test.tsx` | UI | Integration tests for CipherPanel |
| Modify | `src/styles.css` | — | CSS variables, Geist font, dark mode variant, base resets |
| Modify | `vite.config.ts` | — | Add vitest jsdom config |
| Modify | `src/routes/__root.tsx` | — | Mount ThemeProvider, update page title |
| Modify | `src/routes/index.tsx` | — | Mount CipherPanel |

---

## Task 1: Setup — vitest + font + CSS foundation

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Install Geist Sans font package**

```bash
pnpm add @fontsource/geist-sans
```

Expected: Package added to `dependencies` in `package.json`.

- [ ] **Step 2: Add vitest jsdom config to vite.config.ts**

Read current `vite.config.ts` first, then replace with:

```typescript
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), netlify(), tailwindcss(), tanstackStart(), viteReact()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})

export default config
```

- [ ] **Step 3: Replace src/styles.css**

```css
@import "@fontsource/geist-sans/400.css";
@import "@fontsource/geist-sans/500.css";
@import "tailwindcss";
@import "tw-animate-css";
@plugin "@tailwindcss/typography";

/* Class-based dark mode: add .dark to <html> to activate */
@variant dark (&:where(.dark, .dark *));

/* ── Design tokens ── */
:root {
  --color-bg: #f7f7f5;
  --color-surface: #f0f0ee;
  --color-surface-focus: #ebebea;
  --color-text: #1a1a1a;
  --color-muted: #999999;
  --color-error: #c0392b;
}

.dark {
  --color-bg: #0d0d0d;
  --color-surface: #161616;
  --color-surface-focus: #1e1e1e;
  --color-text: #e0e0e0;
  --color-muted: #555555;
  --color-error: #e57373;
}

/* ── Base resets ── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  transition: background-color 200ms ease-out;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: 'Geist Sans', system-ui, -apple-system, sans-serif;
  font-size: 13px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  margin: 0;
  transition: background-color 200ms ease-out, color 200ms ease-out;
}

/* ── Form element resets — borderless, blending ── */
input,
select,
textarea {
  font-family: inherit;
  font-size: inherit;
  color: var(--color-text);
  background-color: var(--color-surface);
  border: none;
  outline: none;
  box-shadow: none;
  border-radius: 0;
  width: 100%;
  padding: 10px 12px;
  transition: background-color 200ms ease-out;
  appearance: none;
  -webkit-appearance: none;
}

input:focus,
select:focus,
textarea:focus {
  background-color: var(--color-surface-focus);
}

textarea {
  resize: none;
}

select option {
  background-color: var(--color-surface);
  color: var(--color-text);
}

/* ── Animations ── */
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fade-up 280ms ease-out forwards;
}
```

- [ ] **Step 4: Start dev server to verify no CSS or build errors**

```bash
pnpm dev
```

Expected: Server starts on port 3000. Page loads without console errors. Body uses Geist Sans font.

- [ ] **Step 5: Stop dev server (Ctrl+C) and commit**

```bash
git add vite.config.ts src/styles.css package.json pnpm-lock.yaml
git commit -m "chore: setup vitest jsdom, Geist font, CSS design tokens and base resets"
```

---

## Task 2: Types layer

**Files:**
- Create: `src/types/cipher.ts`

- [ ] **Step 1: Create types file**

```typescript
/** All supported cipher algorithms. Add a new value here to extend the registry. */
export enum Algorithm {
  RC5 = 'RC5',
}

/** Contract that every cipher implementation must satisfy. */
export interface CipherDef {
  /** Human-readable label shown in the algorithm dropdown. */
  label: string
  /** Encrypts UTF-8 plaintext with the given secret. Returns a printable string. */
  encrypt: (plaintext: string, secret: string) => string
  /** Decrypts ciphertext with the given secret. Throws on invalid input. */
  decrypt: (ciphertext: string, secret: string) => string
}

/** Full state managed by useConverter. */
export interface ConversionState {
  secret: string
  algorithm: Algorithm
  plaintext: string
  ciphertext: string
  plainError: string | null
  cipherError: string | null
  /** Which box was last edited — determines re-run direction on secret/algorithm change. */
  lastEdited: 'plain' | 'cipher' | null
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/cipher.ts
git commit -m "feat: add cipher types (Algorithm, CipherDef, ConversionState)"
```

---

## Task 3: RC5 service (TDD)

**Files:**
- Create: `src/lib/ciphers/rc5.test.ts`
- Create: `src/lib/ciphers/rc5.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/ciphers/rc5.test.ts
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
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
pnpm test src/lib/ciphers/rc5.test.ts
```

Expected: All 9 tests fail with `Cannot find module './rc5'`.

- [ ] **Step 3: Implement RC5 service**

```typescript
// src/lib/ciphers/rc5.ts
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
```

- [ ] **Step 4: Run tests — verify they all pass**

```bash
pnpm test src/lib/ciphers/rc5.test.ts
```

Expected: All 9 tests pass.

- [ ] **Step 5: TypeScript check**

```bash
pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/ciphers/
git commit -m "feat: implement RC5-32/12 encrypt/decrypt with tests"
```

---

## Task 4: Algorithm config

**Files:**
- Create: `src/config/algorithms.ts`

- [ ] **Step 1: Create the registry**

```typescript
// src/config/algorithms.ts
import { Algorithm, type CipherDef } from '#/types/cipher'
import { encrypt, decrypt } from '#/lib/ciphers/rc5'

/**
 * Maps each Algorithm to its CipherDef.
 * To add a new cipher: add its enum value in types/cipher.ts,
 * implement a service module in lib/ciphers/, then register it here.
 */
export const ALGORITHMS: Record<Algorithm, CipherDef> = {
  [Algorithm.RC5]: {
    label: 'RC5',
    encrypt,
    decrypt,
  },
}
```

- [ ] **Step 2: TypeScript check**

```bash
pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/config/algorithms.ts
git commit -m "feat: add algorithm registry with RC5 entry"
```

---

## Task 5: useConverter hook (TDD)

**Files:**
- Create: `src/lib/hooks/useConverter.test.ts`
- Create: `src/lib/hooks/useConverter.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/hooks/useConverter.test.ts
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
})
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
pnpm test src/lib/hooks/useConverter.test.ts
```

Expected: All 8 tests fail with `Cannot find module './useConverter'`.

- [ ] **Step 3: Implement useConverter**

```typescript
// src/lib/hooks/useConverter.ts
import { useState, useCallback } from 'react'
import { Algorithm, type CipherDef, type ConversionState } from '#/types/cipher'
import { ALGORITHMS } from '#/config/algorithms'

export interface UseConverterReturn extends ConversionState {
  setSecret: (secret: string) => void
  setAlgorithm: (algorithm: Algorithm) => void
  setPlaintext: (plaintext: string) => void
  setCiphertext: (ciphertext: string) => void
}

function tryEncrypt(
  plain: string,
  secret: string,
  def: CipherDef,
): { ciphertext: string; error: string | null } {
  if (!plain) return { ciphertext: '', error: null }
  try {
    return { ciphertext: def.encrypt(plain, secret), error: null }
  } catch {
    return { ciphertext: '', error: 'Encryption failed' }
  }
}

function tryDecrypt(
  cipher: string,
  secret: string,
  def: CipherDef,
): { plaintext: string; error: string | null } {
  if (!cipher) return { plaintext: '', error: null }
  try {
    return { plaintext: def.decrypt(cipher, secret), error: null }
  } catch {
    return { plaintext: '', error: 'Invalid ciphertext or wrong secret' }
  }
}

const INITIAL: ConversionState = {
  secret: '',
  algorithm: Algorithm.RC5,
  plaintext: '',
  ciphertext: '',
  plainError: null,
  cipherError: null,
  lastEdited: null,
}

export function useConverter(): UseConverterReturn {
  const [state, setState] = useState<ConversionState>(INITIAL)

  const setSecret = useCallback((secret: string) => {
    setState(prev => {
      if (!secret) {
        return { ...prev, secret, plaintext: '', ciphertext: '', plainError: null, cipherError: null }
      }
      const def = ALGORITHMS[prev.algorithm]
      if (prev.lastEdited === 'plain') {
        const { ciphertext, error } = tryEncrypt(prev.plaintext, secret, def)
        return { ...prev, secret, ciphertext, cipherError: error, plainError: null }
      }
      if (prev.lastEdited === 'cipher') {
        const { plaintext, error } = tryDecrypt(prev.ciphertext, secret, def)
        return { ...prev, secret, plaintext, plainError: error, cipherError: null }
      }
      return { ...prev, secret }
    })
  }, [])

  const setAlgorithm = useCallback((algorithm: Algorithm) => {
    setState(prev => {
      const def = ALGORITHMS[algorithm]
      if (!prev.secret) return { ...prev, algorithm }
      if (prev.lastEdited === 'plain') {
        const { ciphertext, error } = tryEncrypt(prev.plaintext, prev.secret, def)
        return { ...prev, algorithm, ciphertext, cipherError: error, plainError: null }
      }
      if (prev.lastEdited === 'cipher') {
        const { plaintext, error } = tryDecrypt(prev.ciphertext, prev.secret, def)
        return { ...prev, algorithm, plaintext, plainError: error, cipherError: null }
      }
      return { ...prev, algorithm }
    })
  }, [])

  const setPlaintext = useCallback((plaintext: string) => {
    setState(prev => {
      if (!prev.secret) return { ...prev, plaintext, lastEdited: 'plain' }
      const { ciphertext, error } = tryEncrypt(plaintext, prev.secret, ALGORITHMS[prev.algorithm])
      return { ...prev, plaintext, ciphertext, cipherError: error, plainError: null, lastEdited: 'plain' }
    })
  }, [])

  const setCiphertext = useCallback((ciphertext: string) => {
    setState(prev => {
      if (!prev.secret) return { ...prev, ciphertext, lastEdited: 'cipher' }
      const { plaintext, error } = tryDecrypt(ciphertext, prev.secret, ALGORITHMS[prev.algorithm])
      return { ...prev, ciphertext, plaintext, plainError: error, cipherError: null, lastEdited: 'cipher' }
    })
  }, [])

  return { ...state, setSecret, setAlgorithm, setPlaintext, setCiphertext }
}
```

- [ ] **Step 4: Run tests — verify they all pass**

```bash
pnpm test src/lib/hooks/useConverter.test.ts
```

Expected: All 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hooks/
git commit -m "feat: implement useConverter hook with bidirectional real-time conversion"
```

---

## Task 6: ThemeProvider (TDD)

**Files:**
- Create: `src/providers/ThemeProvider.tsx`
- Create: `src/providers/ThemeProvider.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/providers/ThemeProvider.test.tsx
import { describe, it, expect } from 'vitest'
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
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
pnpm test src/providers/ThemeProvider.test.tsx
```

Expected: All 4 tests fail with `Cannot find module './ThemeProvider'`.

- [ ] **Step 3: Implement ThemeProvider**

```typescript
// src/providers/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
})

/** Access the current theme and toggle function from any component. */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getSystemTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    setTheme(t => (t === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

- [ ] **Step 4: Run tests — verify they all pass**

```bash
pnpm test src/providers/ThemeProvider.test.tsx
```

Expected: All 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/providers/
git commit -m "feat: add ThemeProvider with system-preference default and .dark class toggle"
```

---

## Task 7: Dumb UI components

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Create: `src/components/SecretInput.tsx`
- Create: `src/components/AlgorithmSelect.tsx`
- Create: `src/components/ConversionBox.tsx`
- Create: `src/components/EmptyState.tsx`

- [ ] **Step 1: Create ThemeToggle**

```typescript
// src/components/ThemeToggle.tsx
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
```

- [ ] **Step 2: Create SecretInput**

```typescript
// src/components/SecretInput.tsx
interface SecretInputProps {
  value: string
  onChange: (value: string) => void
}

/** Borderless password-style input for the cipher secret/key. */
export function SecretInput({ value, onChange }: SecretInputProps) {
  return (
    <div>
      <label
        htmlFor="secret-input"
        style={{
          display: 'block',
          fontSize: '11px',
          color: 'var(--color-muted)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
      >
        Secret
      </label>
      <input
        id="secret-input"
        type="password"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Enter secret key"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  )
}
```

- [ ] **Step 3: Create AlgorithmSelect**

```typescript
// src/components/AlgorithmSelect.tsx
import { Algorithm } from '#/types/cipher'
import { ALGORITHMS } from '#/config/algorithms'

interface AlgorithmSelectProps {
  value: Algorithm
  onChange: (value: Algorithm) => void
}

/** Borderless dropdown for selecting the cipher algorithm. */
export function AlgorithmSelect({ value, onChange }: AlgorithmSelectProps) {
  return (
    <div>
      <label
        htmlFor="algorithm-select"
        style={{
          display: 'block',
          fontSize: '11px',
          color: 'var(--color-muted)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
      >
        Algorithm
      </label>
      <select
        id="algorithm-select"
        value={value}
        onChange={e => onChange(e.target.value as Algorithm)}
        style={{ cursor: 'pointer' }}
      >
        {Object.values(Algorithm).map(alg => (
          <option key={alg} value={alg}>
            {ALGORITHMS[alg].label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

- [ ] **Step 4: Create ConversionBox**

Note: the `id` is derived from the label so that `<label htmlFor>` links correctly, enabling `getByLabelText` in tests.

```typescript
// src/components/ConversionBox.tsx
interface ConversionBoxProps {
  label: string
  value: string
  error: string | null
  onChange: (value: string) => void
  placeholder?: string
}

/** Borderless textarea with an associated label and optional inline error. */
export function ConversionBox({ label, value, error, onChange, placeholder }: ConversionBoxProps) {
  const id = `box-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: '11px',
          color: 'var(--color-muted)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={10}
        spellCheck={false}
        style={{ fontFamily: 'monospace', fontSize: '12px' }}
      />
      {error && (
        <span style={{ fontSize: '11px', color: 'var(--color-error)' }}>
          {error}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Create EmptyState**

```typescript
// src/components/EmptyState.tsx

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
```

- [ ] **Step 6: TypeScript check**

```bash
pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/ThemeToggle.tsx src/components/SecretInput.tsx src/components/AlgorithmSelect.tsx src/components/ConversionBox.tsx src/components/EmptyState.tsx
git commit -m "feat: add dumb UI components (ThemeToggle, SecretInput, AlgorithmSelect, ConversionBox, EmptyState)"
```

---

## Task 8: CipherPanel (TDD)

**Files:**
- Create: `src/components/CipherPanel.test.tsx`
- Create: `src/components/CipherPanel.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/components/CipherPanel.test.tsx
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
    expect(cipherBox.value).toMatch(/^[0-9a-f]+$/)
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
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
pnpm test src/components/CipherPanel.test.tsx
```

Expected: All 5 tests fail with `Cannot find module './CipherPanel'`.

- [ ] **Step 3: Implement CipherPanel**

```typescript
// src/components/CipherPanel.tsx
import { useConverter } from '#/lib/hooks/useConverter'
import { AlgorithmSelect } from './AlgorithmSelect'
import { ConversionBox } from './ConversionBox'
import { EmptyState } from './EmptyState'
import { SecretInput } from './SecretInput'
import { ThemeToggle } from './ThemeToggle'

/**
 * Smart container for the cipher tool.
 * Owns no crypto logic — delegates entirely to useConverter.
 * All child components are dumb and receive values + callbacks only.
 */
export function CipherPanel() {
  const {
    secret,
    algorithm,
    plaintext,
    ciphertext,
    plainError,
    cipherError,
    setSecret,
    setAlgorithm,
    setPlaintext,
    setCiphertext,
  } = useConverter()

  return (
    <div
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '72px 24px 64px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '36px',
      }}
    >
      <ThemeToggle />

      <header style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h1
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--color-text)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          krypto
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: 0 }}>
          encode and decode messages
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SecretInput value={secret} onChange={setSecret} />
        <AlgorithmSelect value={algorithm} onChange={setAlgorithm} />
      </div>

      {secret ? (
        <div
          className="animate-fade-up"
          style={{ display: 'flex', gap: '20px' }}
        >
          <ConversionBox
            label="Plaintext"
            value={plaintext}
            error={plainError}
            onChange={setPlaintext}
            placeholder="Type or paste plaintext…"
          />
          <ConversionBox
            label="Ciphertext"
            value={ciphertext}
            error={cipherError}
            onChange={setCiphertext}
            placeholder="Type or paste ciphertext…"
          />
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify they all pass**

```bash
pnpm test src/components/CipherPanel.test.tsx
```

Expected: All 5 tests pass.

- [ ] **Step 5: Run the full test suite**

```bash
pnpm test
```

Expected: All tests across all files pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/CipherPanel.tsx src/components/CipherPanel.test.tsx
git commit -m "feat: implement CipherPanel smart container with conversion UI"
```

---

## Task 9: Wire routes

**Files:**
- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Update __root.tsx to mount ThemeProvider and set page title**

Read `src/routes/__root.tsx` first to confirm current content, then replace:

```typescript
// src/routes/__root.tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ThemeProvider } from '#/providers/ThemeProvider'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'krypto' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Replace index route with CipherPanel**

```typescript
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CipherPanel } from '#/components/CipherPanel'

export const Route = createFileRoute('/')({ component: CipherPanel })
```

- [ ] **Step 3: TypeScript check**

```bash
pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Run full test suite one final time**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 5: Start dev server and verify manually**

```bash
pnpm dev
```

Check each of the following in the browser at `http://localhost:3000`:

- [ ] Page loads showing "krypto" heading and "Enter a secret to get started"
- [ ] Typing a secret reveals the two conversion boxes with a fade-up animation
- [ ] Typing in the Plaintext box immediately fills the Ciphertext box with hex
- [ ] Pasting hex into the Ciphertext box immediately fills the Plaintext box
- [ ] Clearing the secret hides the boxes and shows the empty state again
- [ ] Invalid ciphertext shows "Invalid ciphertext or wrong secret" inline under the Plaintext box
- [ ] Theme toggle (top right) switches between light and dark mode smoothly
- [ ] No visible borders on any input, textarea, or select at rest or on focus
- [ ] All inputs visually blend into the page background

- [ ] **Step 6: Commit**

```bash
git add src/routes/__root.tsx src/routes/index.tsx
git commit -m "feat: wire ThemeProvider and CipherPanel into route tree — cipher tool complete"
```
