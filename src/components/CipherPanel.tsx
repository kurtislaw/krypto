import { useState } from 'react'
import { useConverter } from '#/lib/hooks/useConverter'
import { EmptyState } from './EmptyState'
import { SecretInput } from './SecretInput'
import { ThemeToggle } from './ThemeToggle'

const HINT_KEY = 'krypto_hint_dismissed'

export function CipherPanel() {
	const { secret, input, output, mode, error, setSecret, setInput, clearInput, decodeIfCipher } = useConverter()
	const [showHint, setShowHint] = useState(() => {
		if (typeof localStorage === 'undefined') return true
		return !localStorage.getItem(HINT_KEY)
	})

	function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
		const pasted = e.clipboardData.getData('text')
		const decoded = decodeIfCipher(pasted)
		if (decoded !== null) {
			e.preventDefault()
			setInput(decoded)
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (!e.metaKey || e.key !== 'Enter') return
		e.preventDefault()
		if (mode === 'encrypt' && output) {
			navigator.clipboard.writeText(output)
		}
		clearInput()
		if (showHint) {
			setShowHint(false)
			localStorage.setItem(HINT_KEY, '1')
		}
	}

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
					kryptography (˶˃ ᵕ ˂˶)
				</h1>
				<p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: 0 }}>
					encode and decode ts
				</p>
			</header>

			<SecretInput value={secret} onChange={setSecret} />

			{secret ? (
				<div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
					<textarea
						aria-label="Input"
						value={input}
						onChange={e => setInput(e.target.value)}
						onPaste={handlePaste}
						onKeyDown={handleKeyDown}
						placeholder="type or paste…"
						rows={6}
						spellCheck={false}
						style={{ fontFamily: 'monospace', fontSize: '12px', width: '100%' }}
					/>

					{(output || error) && (
						<div
							data-testid="output-preview"
							style={{
								fontFamily: 'monospace',
								fontSize: '12px',
								color: error ? 'var(--color-error)' : 'var(--color-muted)',
								opacity: error ? 1 : 0.45,
								marginTop: '12px',
								wordBreak: 'break-all',
								whiteSpace: 'pre-wrap',
								lineHeight: '1.6',
							}}
						>
							{error ?? output}
						</div>
					)}

					{showHint && (
						<p
							style={{
								fontSize: '11px',
								color: 'var(--color-muted)',
								opacity: 0.6,
								margin: '16px 0 0',
								lineHeight: '1.6',
							}}
						>
							⌘↵ &nbsp; text → copies encrypted + clears &nbsp;·&nbsp; cipher → clears
						</p>
					)}
				</div>
			) : (
				<EmptyState />
			)}
		</div>
	)
}
