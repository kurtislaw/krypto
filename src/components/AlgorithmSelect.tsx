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
