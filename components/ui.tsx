import { getInitials } from '@/lib/utils'
import { CSSProperties } from 'react'

export function Avatar({ name, color, size = 36 }: { name: string; color: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 600, color: '#fff', flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  )
}

export function Card({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 16,
      border: '0.5px solid var(--border)', padding: 16,
      margin: '12px 16px', ...style,
    }}>
      {children}
    </div>
  )
}

export function Badge({ children, color = 'green' }: { children: React.ReactNode; color?: 'green' | 'red' | 'amber' | 'blue' }) {
  const colors = {
    green: { bg: '#dcfce7', text: '#15803d' },
    red: { bg: '#fee2e2', text: '#dc2626' },
    amber: { bg: '#fef3c7', text: '#b45309' },
    blue: { bg: '#dbeafe', text: '#1d4ed8' },
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 500,
      background: colors[color].bg, color: colors[color].text,
    }}>
      {children}
    </span>
  )
}

export function Btn({
  children, onClick, variant = 'primary', full = false, small = false, style,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost'
  full?: boolean
  small?: boolean
  style?: CSSProperties
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: full ? 'center' : undefined,
        gap: 6, width: full ? '100%' : undefined,
        padding: small ? '6px 12px' : '10px 18px',
        borderRadius: small ? 8 : 10, border: variant === 'ghost' ? '0.5px solid var(--border)' : 'none',
        fontFamily: 'inherit', fontSize: small ? 13 : 14, fontWeight: 500, cursor: 'pointer',
        background: variant === 'primary' ? 'var(--accent)' : 'transparent',
        color: variant === 'primary' ? '#fff' : 'var(--text2)',
        transition: 'all .15s', ...style,
      }}
    >
      {children}
    </button>
  )
}

export function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export const inputStyle: CSSProperties = {
  width: '100%', padding: '10px 12px', border: '0.5px solid var(--border)',
  borderRadius: 10, fontFamily: 'inherit', fontSize: 14,
  background: 'var(--surface)', color: 'var(--text)', outline: 'none',
}

export function Select({ id, value, onChange, children }: {
  id?: string; value: string; onChange: (v: string) => void; children: React.ReactNode
}) {
  return (
    <select id={id} value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
      {children}
    </select>
  )
}

export function ProgressBar({ value, color = 'var(--green)' }: { value: number; color?: string }) {
  return (
    <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: 3, transition: 'width .4s' }} />
    </div>
  )
}

export function SubTabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '12px 16px 0', overflowX: 'auto' }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
            border: '0.5px solid var(--border)',
            background: active === t.id ? 'var(--accent)' : 'var(--surface)',
            color: active === t.id ? '#fff' : 'var(--text2)',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
      <div style={{ fontSize: 40 }}>{emoji}</div>
      <p style={{ marginTop: 8, fontWeight: 500 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, marginTop: 4 }}>{subtitle}</p>}
    </div>
  )
}
