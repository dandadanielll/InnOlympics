export default function EmergencyPage() {
  const HOTLINES = [
    { name: 'Philippine Emergency Hotline', number: '911', note: 'Ambulance, Fire, Police — 24/7' },
    { name: 'Philippine Red Cross', number: '143', note: 'Medical emergency and disaster response' },
    { name: 'DOH National Hotline', number: '1555', note: 'Health concerns, referrals' },
  ]

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      <div className="section-eyebrow" style={{ color: 'var(--danger)', marginBottom: '8px' }}>Critical Assistance</div>
      <h1 className="text-h1" style={{ marginBottom: '32px' }}>Emergency Lines</h1>

      <div className="warn-box" style={{ marginBottom: '32px' }}>
        <p className="text-sm">For immediate life-threatening emergencies, call 911 without delay.</p>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">National Action Center</div></div>
        <div className="card-body">
          {HOTLINES.map((h, i) => (
            <div key={h.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < HOTLINES.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{h.name}</div>
                <div className="text-sm text-secondary">{h.note}</div>
              </div>
              <a href={`tel:${h.number}`}>
                <button className="btn btn-primary" style={{ background: 'var(--danger)' }}>
                  Call {h.number}
                </button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
