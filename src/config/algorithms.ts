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
