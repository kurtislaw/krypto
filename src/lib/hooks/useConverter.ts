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
      return { ...prev, ciphertext, plaintext, cipherError: error, plainError: null, lastEdited: 'cipher' }
    })
  }, [])

  return { ...state, setSecret, setAlgorithm, setPlaintext, setCiphertext }
}
