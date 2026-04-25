interface LegalNoticeProps {
  text: string
  variant?: 'info' | 'warning'
}

export function LegalNotice({ text, variant = 'info' }: LegalNoticeProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: 'var(--radius-sm)',
        background: variant === 'warning' ? 'var(--warning-bg)' : 'var(--bg-muted)',
        border: '1px solid',
        borderColor: variant === 'warning' ? 'var(--warning-border)' : 'var(--border-light)',
      }}
    >
      <span style={{ fontSize: '14px', flexShrink: 0 }}>
        {variant === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {text}
      </p>
    </div>
  )
}
