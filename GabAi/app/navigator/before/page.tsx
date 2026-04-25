'use client'

import { useState } from 'react'

const MOCK_CARE_PLAN = {
  riskFlag: 'green' as 'green' | 'yellow' | 'red',
  riskLabel: 'Safe to Wait',
  riskRationale: 'Symptoms suggest a non-urgent condition. The patient can wait for a scheduled clinic visit. Attending promptly is still recommended — worsening symptoms should prompt immediate reassessment.',
  facilityLevel: 'Barangay Health Center (BHC) — Level 1',
  facilityName: 'QC BHC — Batasan Hills',
  facilityAddress: '156 Batasan Road, Batasan Hills, Quezon City',
  facilityHours: 'Monday to Friday, 8:00 AM – 5:00 PM',
  facilityPeak: 'Avoid 8–10 AM — peak queue hours.',
  documents: [
    { doc: 'PhilHealth Membership Data Record (MDR)', where: 'PhilHealth branch or download', free: true },
    { doc: "Child's Birth Certificate (PSA)", where: 'PSA Serbilis outlet', free: false },
    { doc: 'Barangay Certificate of Indigency', where: 'Your barangay hall', free: true },
  ],
  script: 'Doc, nagpapacheck-up po kami para sa aking anak na 4 na taong gulang. Lagnat po siya ng 3 araw... Walang kahirapan sa paghinga.',
  keyPoints: ['Fever duration: 3 days', 'Temperature peak: 38.5°C'],
}

export default function BeforePage() {
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const toggle = (i: number) => setChecked(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      
      {/* 0. OVERVIEW */}
      <div style={{ marginBottom: '48px' }}>
        <div className="section-eyebrow" style={{ marginBottom: '8px' }}>Phase 1 · Handa Ka Na Ba?</div>
        <h1 className="text-h1" style={{ marginBottom: '16px' }}>Preparation Companion</h1>
        <p className="text-body text-secondary" style={{ maxWidth: '600px' }}>
          Describe your concern below. GabAI will process your symptoms and generate a complete care plan — a routed facility, a documents checklist, and a doctor consultation script.
        </p>

        {/* INPUT AREA */}
        <div className="card" style={{ marginTop: '24px', maxWidth: '600px' }}>
          <div className="card-body">
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <textarea
                  className="input textarea"
                  placeholder="Voice or type your concern: 'Lagnat ang anak ko ng 3 araw...'"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={3}
                />
              </div>
              <button
                className={`btn ${isRecording ? 'btn-primary' : 'btn-secondary'} feature-anchor`}
                style={{ padding: '0 24px', borderRadius: 'var(--radius-md)' }}
                onMouseDown={() => setIsRecording(true)}
                onMouseUp={() => { setIsRecording(false); setInput('Lagnat ang anak ko ng 3 araw. Nasa QC kami, may PhilHealth kami. Ubo din siya at sipon.') }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isRecording ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '12px' }}
              onClick={() => setShowPlan(true)}
              disabled={!input.trim()}
            >
              Generate Care Plan
            </button>
          </div>
        </div>
      </div>

      {showPlan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          
          {/* 1. FACILITY ROUTING */}
          <div id="routing" className="feature-anchor">
            <div className="section-eyebrow" style={{ color: 'var(--primary)', marginBottom: '8px' }}>1. Facility Routing</div>
            <h2 className="text-h2" style={{ marginBottom: '24px' }}>Recommended Facility</h2>
            
            <div className="two-col" style={{ gap: '20px' }}>
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="badge badge-success">Low Risk</span>
                    <span className="text-sm font-semibold">{MOCK_CARE_PLAN.riskLabel}</span>
                  </div>
                  <h3 className="text-h3" style={{ marginBottom: '8px' }}>{MOCK_CARE_PLAN.facilityName}</h3>
                  <p className="text-sm text-secondary" style={{ marginBottom: '2px' }}>{MOCK_CARE_PLAN.facilityAddress}</p>
                  <p className="text-sm text-secondary" style={{ marginBottom: '16px' }}>{MOCK_CARE_PLAN.facilityHours}</p>
                  <button className="btn btn-secondary" style={{ width: '100%' }}>
                    Open in Google Maps
                  </button>
                </div>
              </div>
              <div className="card" style={{ background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-sm text-muted">Google Maps Embed Placeholder</span>
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: '0' }} />

          {/* 2. DOCUMENTS CHECKLIST */}
          <div id="checklist" className="feature-anchor">
            <div className="section-eyebrow" style={{ color: 'var(--primary)', marginBottom: '8px' }}>2. Documents Checklist</div>
            <h2 className="text-h2" style={{ marginBottom: '24px' }}>What to bring</h2>
            
            <div className="card" style={{ maxWidth: '700px' }}>
              <div className="card-body">
                {MOCK_CARE_PLAN.documents.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 0', borderBottom: i < MOCK_CARE_PLAN.documents.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <button
                      onClick={() => toggle(i)}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${checked.has(i) ? 'var(--success)' : 'var(--border)'}`, background: checked.has(i) ? 'var(--success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      {checked.has(i) && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                    <div style={{ flex: 1, textDecoration: checked.has(i) ? 'line-through' : 'none', opacity: checked.has(i) ? 0.6 : 1 }}>
                      <div className="text-sm" style={{ fontWeight: 600 }}>{d.doc}</div>
                      <div className="text-xs text-secondary">Get it from: {d.where}</div>
                    </div>
                    {d.free && <span className="badge badge-success">Free</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: '0' }} />

          {/* 3. DOCTOR SCRIPT */}
          <div id="script" className="feature-anchor">
            <div className="section-eyebrow" style={{ color: 'var(--primary)', marginBottom: '8px' }}>3. Doctor Script</div>
            <h2 className="text-h2" style={{ marginBottom: '24px' }}>Dapat Sabihin Mo</h2>
            
            <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
              <div className="card-body" style={{ background: 'var(--primary-light)' }}>
                <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '1.25rem', lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: '20px' }}>
                  "{MOCK_CARE_PLAN.script}"
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                    Read Aloud
                  </button>
                  <button className="btn btn-secondary">Copy Script</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
