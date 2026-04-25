import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '80px', paddingTop: '40px' }}>
      
      {/* HERO */}
      <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 12px' }}>
            InnOlympics 2026 — Track B
          </span>
          <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 12px' }}>
            Filipino Healthcare Navigation
          </span>
        </div>

        <h1 className="text-display" style={{ marginBottom: '24px' }}>
          The guide every Filipino patient <br/>
          <span style={{ color: 'var(--warning)' }}>deserves — but never had.</span>
        </h1>
        
        <p className="text-body text-secondary" style={{ marginBottom: '40px', maxWidth: '640px', margin: '0 auto 40px', fontSize: '1.125rem' }}>
          GabAi walks with you through every healthcare encounter: finding the right facility, preparing your documents, and logging what the doctor said. Powered by Gemini AI.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link href="/onboarding">
            <button className="btn btn-primary btn-lg">
              Get Started — Free and Anonymous
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </Link>
          <Link href="/navigator/before">
            <button className="btn btn-ghost btn-lg">
              Try the Navigator
            </button>
          </Link>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="two-col" style={{ alignItems: 'center', background: 'var(--bg-muted)', padding: '64px 48px', borderRadius: 'var(--radius-lg)' }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: '12px' }}>The Problem</div>
          <h2 className="text-h2" style={{ marginBottom: '20px' }}>Philippine healthcare is not absent.<br/>It is a maze.</h2>
          <p className="text-body text-secondary" style={{ marginBottom: '16px' }}>
            A patient in Tondo wakes at 4 AM to bring her son to the nearest public hospital. After a two-hour commute and five-hour wait, she is told she needs a referral from the barangay health center first. Another day lost, wages gone.
          </p>
          <p className="text-body text-secondary">
            This is a failure of <strong>healthcare navigability</strong>. Five entry points with no routing logic, no document guidance, and no memory between visits.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card"><div className="card-body" style={{ padding: '20px' }}><h3 className="text-h3" style={{ color: 'var(--danger)', marginBottom: '4px' }}>5+</h3><div className="text-sm font-semibold">Confusing entry points</div><div className="text-xs text-muted">BHC, RHU, Hospital, ER — no map.</div></div></div>
          <div className="card"><div className="card-body" style={{ padding: '20px' }}><h3 className="text-h3" style={{ color: 'var(--danger)', marginBottom: '4px' }}>0</h3><div className="text-sm font-semibold">Patient navigation tools</div><div className="text-xs text-muted">No official guide to tell you which door.</div></div></div>
        </div>
      </section>

    </div>
  )
}
