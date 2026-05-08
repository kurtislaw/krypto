import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { Algorithm } from '#/types/cipher'
import { ALGORITHMS } from '#/config/algorithms'

interface AlgorithmSelectProps {
  value: Algorithm
  onChange: (value: Algorithm) => void
}

export function AlgorithmSelect({ value, onChange }: AlgorithmSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const id = useId()
  const listId = `${id}-list`

  const options = Object.values(Algorithm)
  const currentIndex = options.indexOf(value)

  useEffect(() => {
    if (!open) return
    function onOutsideClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setOpen(true)
      return
    }
    if (open) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        onChange(options[(currentIndex + 1) % options.length])
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        onChange(options[(currentIndex - 1 + options.length) % options.length])
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
  }

  function select(alg: Algorithm) {
    onChange(alg)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <label
        htmlFor={id}
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

      <button
        ref={triggerRef}
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          background: open ? 'var(--color-surface-focus)' : 'var(--color-surface)',
          border: 'none',
          color: 'var(--color-text)',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background-color 200ms ease-out',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-surface-focus)' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = open ? 'var(--color-surface-focus)' : 'var(--color-surface)' }}
      >
        <span>{ALGORITHMS[value].label}</span>
        <ChevronDown
          size={12}
          strokeWidth={1.5}
          style={{
            color: 'var(--color-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease-out',
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Algorithm"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            background: 'var(--color-surface)',
            zIndex: 10,
          }}
        >
          {options.map(alg => (
            <li
              key={alg}
              role="option"
              aria-selected={alg === value}
              onMouseDown={() => select(alg)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                color: alg === value ? 'var(--color-text)' : 'var(--color-muted)',
                background: alg === value ? 'var(--color-surface-focus)' : 'var(--color-surface)',
                fontSize: 'inherit',
                fontFamily: 'inherit',
                transition: 'background-color 100ms ease-out',
                userSelect: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-surface-focus)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = alg === value ? 'var(--color-surface-focus)' : 'var(--color-surface)' }}
            >
              {ALGORITHMS[alg].label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
