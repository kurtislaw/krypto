export enum Algorithm {
  RC5 = 'RC5',
}

export interface CipherDef {
  label: string
  encrypt: (plaintext: string, secret: string) => string
  decrypt: (ciphertext: string, secret: string) => string
}
