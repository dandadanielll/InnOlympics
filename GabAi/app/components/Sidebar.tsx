'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <Link href="/" className="sidebar-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        <span className="sidebar-logo-text">GabAi</span>
      </Link>

      <nav className="sidebar-nav">
        {/* Core Nav */}
        <div className="sidebar-group">
          <Link href="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Home / Search
          </Link>
          <Link href="/onboarding" className={`sidebar-link ${isActive('/onboarding') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Start Setup
          </Link>
        </div>

        {/* Phase 1: Before */}
        <div className="sidebar-group">
          <div className="sidebar-group-title">1. Handa Ka Na Ba?</div>
          <Link href="/navigator/before" className={`sidebar-link ${isActive('/navigator/before') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
            Before Phase
          </Link>
          {isActive('/navigator/before') && (
            <>
              <Link href="#routing" className="sidebar-sublink">Facility Routing</Link>
              <Link href="#checklist" className="sidebar-sublink">Documents Checklist</Link>
              <Link href="#script" className="sidebar-sublink">Doctor Script</Link>
            </>
          )}
        </div>

        {/* Phase 2: During */}
        <div className="sidebar-group">
          <div className="sidebar-group-title">2. Nandito Ka Na</div>
          <Link href="/navigator/during" className={`sidebar-link ${isActive('/navigator/during') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            During Phase
          </Link>
          {isActive('/navigator/during') && (
            <>
              <Link href="#rights" className="sidebar-sublink">Patient Rights</Link>
              <Link href="#voice" className="sidebar-sublink">Voice Logger</Link>
              <Link href="#scanner" className="sidebar-sublink">Document Scanner</Link>
            </>
          )}
        </div>

        {/* Phase 3: After */}
        <div className="sidebar-group">
          <div className="sidebar-group-title">3. Uwi Ka Na</div>
          <Link href="/navigator/after" className={`sidebar-link ${isActive('/navigator/after') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            After Phase
          </Link>
          {isActive('/navigator/after') && (
            <>
              <Link href="#followup" className="sidebar-sublink">Follow-up Check</Link>
              <Link href="#referral" className="sidebar-sublink">Referral Companion</Link>
              <Link href="#experience" className="sidebar-sublink">Community Log</Link>
            </>
          )}
        </div>

        <div className="sidebar-group">
          <div className="sidebar-group-title">Auxiliary Tools</div>
          <Link href="/history" className={`sidebar-link ${isActive('/history') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Alaala Ko
          </Link>
          <Link href="/dashboard" className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            LGU Analytics
          </Link>
          <button 
            className="sidebar-link" 
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}
            onClick={() => {
              if (window.confirm('Reset all testing data?')) {
                localStorage.removeItem('gabai-storage');
                window.location.href = '/navigator/before';
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Reset Test Data
          </button>
        </div>
      </nav>

      {/* Footer Area */}
      <div className="sidebar-bottom">
        <Link href="/emergency" className={`sidebar-link ${isActive('/emergency') ? 'active' : ''}`} style={{ color: 'var(--danger)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.13h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Emergency Lines
        </Link>
        <Link href="/about" className="sidebar-link" style={{ marginTop: '4px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          About GabAi
        </Link>
      </div>
    </aside>
  )
}
