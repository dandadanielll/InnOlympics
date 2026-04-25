'use client'

export default function HistoryPage() {
  const ENCOUNTERS = [
    { id: '1', date: 'April 25, 2026', facility: 'QC BHC — Batasan Hills', concern: 'Child fever for 3 days', status: 'Improving' },
    { id: '2', date: 'March 10, 2026', facility: 'East Ave Medical Center', concern: 'Persistent cough', status: 'Referred' }
  ]

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      <div className="section-eyebrow" style={{ marginBottom: '8px' }}>Persistent Memory</div>
      <h1 className="text-h1" style={{ marginBottom: '32px' }}>Alaala Ko History</h1>

      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input type="text" className="input" placeholder="Search your health history..." />
            </div>
            <button className="btn btn-primary" style={{ padding: '12px 24px' }}>
              Voice Search
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {ENCOUNTERS.map(e => (
          <div key={e.id} className="card">
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', alignItems: 'center', gap: '24px' }}>
              <div>
                <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>{e.date}</div>
                <div style={{ fontWeight: 600 }}>{e.facility}</div>
              </div>
              <div>
                <div className="text-sm text-secondary">{e.concern}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success">{e.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
