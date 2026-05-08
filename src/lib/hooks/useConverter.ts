import { useState, useCallback, useMemo } from 'react'
import { Algorithm } from '#/types/cipher'
import { ALGORITHMS } from '#/config/algorithms'

export interface UseConverterReturn {
	secret: string
	input: string
	output: string
	mode: 'encrypt' | 'decrypt'
	error: string | null
	setSecret: (s: string) => void
	setInput: (s: string) => void
	clearInput: () => void
	decodeIfCipher: (text: string) => string | null
}

const def = ALGORITHMS[Algorithm.RC5]

function compute(
	input: string,
	secret: string,
): { output: string; mode: 'encrypt' | 'decrypt'; error: string | null } {
	if (!input || !secret) return { output: '', mode: 'encrypt', error: null }
	// Try decrypt first; if it throws (not valid base64 / wrong length / bad padding), encrypt instead.
	try {
		return { output: def.decrypt(input, secret), mode: 'decrypt', error: null }
	} catch {
		try {
			return { output: def.encrypt(input, secret), mode: 'encrypt', error: null }
		} catch {
			return { output: '', mode: 'encrypt', error: 'Encryption failed' }
		}
	}
}

export function useConverter(): UseConverterReturn {
	const [secret, setSecretState] = useState('')
	const [input, setInputState] = useState('')

	const { output, mode, error } = useMemo(() => compute(input, secret), [input, secret])

	const setSecret = useCallback((s: string) => setSecretState(s), [])
	const setInput = useCallback((s: string) => setInputState(s), [])
	const clearInput = useCallback(() => setInputState(''), [])
	const decodeIfCipher = useCallback((text: string): string | null => {
		if (!secret) return null
		try {
			return def.decrypt(text, secret)
		} catch {
			return null
		}
	}, [secret])

	return { secret, input, output, mode, error, setSecret, setInput, clearInput, decodeIfCipher }
}
