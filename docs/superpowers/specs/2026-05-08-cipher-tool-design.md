# Cipher Tool — Design Spec
**Date:** 2026-05-08
**Status:** Approved

## Overview

A single-page cipher tool that lets users encrypt and decrypt text in real time. The user enters a secret key, selects an algorithm, and types into either the plaintext or ciphertext box — the other box updates instantly.

---

## Architecture

Dependency direction is strictly one-way: **Types → Config → Service → Runtime → UI**. Cross-cutting concerns enter only through **Providers**. No backward imports. All files must stay under 300–500 lines.

### Layer Map

| Layer | Path | Responsibility |
|---|---|---|
| Types | `src/types/cipher.ts` | `Algorithm` enum, `CipherDef` interface, `ConversionState` type |
| Config | `src/config/algorithms.ts` | Registry mapping each `Algorithm` → `CipherDef` |
| Service | `src/lib/ciphers/rc5.ts` | RC5 pure `encrypt(plain, secret): string` and `decrypt(cipher, secret): string` |
| Runtime | `src/lib/hooks/useConverter.ts` | Bidirectional state + real-time conversion logic |
| UI | `src/components/`, `src/routes/index.tsx` | Dumb components: `CipherPanel`, `SecretInput`, `AlgorithmSelect`, `ConversionBox`, `ThemeToggle` |
| Providers | `src/providers/ThemeProvider.tsx` | Dark/light mode context and toggle |

---

## Component Tree

```
ThemeProvider
└── RootDocument (__root.tsx)
    └── Home (routes/index.tsx)
        └── CipherPanel
            ├── ThemeToggle
            ├── SecretInput
            ├── AlgorithmSelect
            ├── [if secret empty] → EmptyState: "Enter a secret to get started"
            └── [if secret present]
                ├── ConversionBox (plaintext)  — onChange triggers encrypt
                └── ConversionBox (ciphertext) — onChange triggers decrypt
```

All components below `CipherPanel` are dumb — they receive values and callbacks only, own no state.

---

## State (`useConverter`)

```ts
interface ConverterState {
  secret: string
  algorithm: Algorithm
  plaintext: string
  ciphertext: string
  plainError: string | null
  cipherError: string | null
  lastEdited: 'plain' | 'cipher' | null  // determines re-run direction on secret/algorithm change
}
```

- Typing in the **plaintext** box → runs `encrypt(plaintext, secret)` → updates `ciphertext` (or sets `cipherError`)
- Typing in the **ciphertext** box → runs `decrypt(ciphertext, secret)` → updates `plaintext` (or sets `plainError`)
- Secret change → re-runs whichever box was last edited
- Algorithm change → re-runs whichever box was last edited

---

## UI Behaviour

- **Empty secret**: conversion boxes are hidden; an `EmptyState` message reads "Enter a secret to get started". `SecretInput` and `AlgorithmSelect` remain visible.
- **Secret present, valid input**: opposite box updates on every keystroke.
- **Secret present, invalid ciphertext**: plaintext box shows inline error "Invalid ciphertext or wrong secret". Ciphertext box retains typed value.
- **Secret present, encryption failure**: ciphertext box shows inline error "Encryption failed".
- **Empty input in either box**: opposite box clears silently (no error).

---

## Algorithm Registry

`src/config/algorithms.ts` exports a `ALGORITHMS` record keyed by `Algorithm` enum:

```ts
const ALGORITHMS: Record<Algorithm, CipherDef> = {
  [Algorithm.RC5]: rc5CipherDef,
}
```

Adding a new algorithm means: add the enum value to `Types`, implement the service module, register it in `Config`. No other files change.

---

## RC5 Service

- Pure functions only — no side effects, no global state.
- `encrypt(plaintext: string, secret: string): string` — returns hex-encoded ciphertext.
- `decrypt(ciphertext: string, secret: string): string` — returns decoded plaintext, throws on invalid input.
- Implemented inline (~100 lines) with no external npm dependency for RC5.

---

## Theme

- `ThemeProvider` manages a `theme: 'light' | 'dark'` context value and a `toggleTheme` function.
- Applies a `dark` class to `<html>` for Tailwind's dark-mode variant.
- `ThemeToggle` component reads context and renders a sun/moon icon button.
- Default: system preference via `prefers-color-scheme`.

---

## Design Language

Inspired by tommytrinh.me — minimal, calming, show-not-tell.

### Typography
- **Font family:** Geist Sans (`@fontsource-variable/geist` or via CDN)
- **Weights:** 400 (body), 500 (labels), no bold
- **Size scale:** 13px base, 11px meta/labels, 20px headings — everything small and unobtrusive

### Color Tokens (Tailwind CSS variables)

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#f7f7f5` | `#0d0d0d` |
| `--surface` | `#f0f0ee` | `#161616` |
| `--border` | `#e5e5e3` | `#242424` |
| `--text` | `#1a1a1a` | `#e0e0e0` |
| `--muted` | `#999999` | `#555555` |
| `--error` | `#c0392b` | `#e57373` |

No accent color — hierarchy through weight and opacity only.

### Motion
- All interactive state changes: `transition: 200ms ease-out`
- Conversion boxes mount with `opacity 0 → 1` + `translateY(6px) → 0`
- EmptyState ↔ conversion boxes cross-fade (no layout jump)
- Theme toggle: smooth `200ms` background/color transition across entire page
- Input focus: hairline border fades in, no jump

### Input / Textarea Style
- No borders ever — not at rest, not on focus
- Fields are distinguished purely by background: `--surface` on `--bg` (a barely-perceptible shift)
- On focus: background nudges one step warmer/cooler (not darker — just a different temperature), no outline, no ring, no box-shadow (`outline: none; box-shadow: none`)
- Border radius: `0` — flat, no rounding
- No shadows
- Resize handle hidden on textareas (`resize: none`)
- Generous internal padding
- Fields should read as part of the page, not inserted form controls

### Layout
- Single centered column, max-width `640px`, vertically centered in viewport
- Breathing room: `48px` top padding minimum, `32px` gap between sections
- Theme toggle pinned top-right

---

## File Structure

```
src/
  types/
    cipher.ts               # Algorithm enum, CipherDef, ConversionState
  config/
    algorithms.ts           # ALGORITHMS registry
  lib/
    ciphers/
      rc5.ts                # RC5 encrypt/decrypt
    hooks/
      useConverter.ts       # bidirectional state + conversion logic
  components/
    CipherPanel.tsx         # smart container, uses useConverter
    SecretInput.tsx         # controlled input
    AlgorithmSelect.tsx     # dropdown
    ConversionBox.tsx       # textarea + inline error
    ThemeToggle.tsx         # sun/moon toggle
    EmptyState.tsx          # "Enter a secret to get started"
  providers/
    ThemeProvider.tsx       # dark/light context
  routes/
    index.tsx               # mounts CipherPanel
    __root.tsx              # mounts ThemeProvider, existing shell
```
