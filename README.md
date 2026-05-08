# krypto

A minimal cipher tool — encrypt and decode text in the browser using classical algorithms.

## Development

```bash
pnpm install
pnpm dev        # dev server on http://localhost:3000
pnpm build      # production build
pnpm preview    # preview production build locally
```

## Testing

```bash
pnpm test                                          # run all tests
pnpm vitest run src/lib/ciphers/rc5.test.ts        # run a single test file
```

## Linting & Formatting

Uses [Biome](https://biomejs.dev/) (tabs, double quotes).

```bash
pnpm lint
pnpm format
pnpm check      # lint + format check combined
```

## Adding a Cipher

1. Add an enum value to `src/types/cipher.ts` → `Algorithm`
2. Implement `encrypt` / `decrypt` in `src/lib/ciphers/<name>.ts` (satisfying `CipherDef`)
3. Register it in `src/config/algorithms.ts` → `ALGORITHMS`

## Adding UI Components

```bash
pnpm dlx shadcn@latest add <component>
```

## Deployment

Configured for Netlify — push to GitHub, import the repo at [app.netlify.com](https://app.netlify.com/start), and Netlify auto-detects the build. Server functions run as Netlify Functions.
