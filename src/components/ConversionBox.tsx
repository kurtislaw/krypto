interface ConversionBoxProps {
	label: string
	value: string
	error?: string | null
	onChange?: (value: string) => void
	onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
	placeholder?: string
	readOnly?: boolean
}

export function ConversionBox({
	label,
	value,
	error,
	onChange,
	onKeyDown,
	placeholder,
	readOnly,
}: ConversionBoxProps) {
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
				onChange={e => onChange?.(e.target.value)}
				onKeyDown={onKeyDown}
				placeholder={placeholder}
				readOnly={readOnly}
				rows={10}
				spellCheck={false}
				style={{
					fontFamily: 'monospace',
					fontSize: '12px',
					...(readOnly ? { color: 'var(--color-muted)', cursor: 'default' } : {}),
				}}
			/>
			{error && (
				<span style={{ fontSize: '11px', color: 'var(--color-error)' }}>{error}</span>
			)}
		</div>
	)
}
