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
