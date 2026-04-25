export default function DashboardPage() {
  const KPI = [
    { label: 'Care Plans', val: '4,260' },
    { label: 'Encounters', val: '1,204' },
    { label: 'Correct Routing', val: '82%' },
    { label: 'Days Saved', val: '1,204' },
  ]

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      <div className="section-eyebrow" style={{ marginBottom: '8px' }}>LGU Analytics</div>
      <h1 className="text-h1" style={{ marginBottom: '32px' }}>Metro Manila Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
        {KPI.map(k => (
          <div key={k.label} className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="text-display" style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '8px' }}>{k.val}</div>
              <div className="text-sm font-semibold">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ gap: '24px' }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Top Rated Facilities</div></div>
          <div className="card-body">
            {['QC BHC — Batasan Hills', 'Manila BHC — Tondo', 'East Ave Medical Center ER'].map((f, i) => (
              <div key={f} style={{ padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none' }}>
                <span className="text-sm font-semibold">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Top Health Concerns</div></div>
          <div className="card-body">
            {[ {name: 'Viral Fever', pct: 34}, {name: 'Hypertension', pct: 22}, {name: 'Pediatric', pct: 18} ].map(c => (
              <div key={c.name} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="text-sm">{c.name}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>{c.pct}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-light)', borderRadius: '3px' }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
