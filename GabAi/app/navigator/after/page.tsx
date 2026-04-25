'use client'

import { useState } from 'react'

const WHATSAPP_TEXT = `*VISIT SUMMARY — GabAi*
Date: April 25, 2026
Facility: QC BHC

*Doctor's notes:*
Viral infection. Rest and symptomatic treatment.

*Medications:*
- Paracetamol Syrup 250mg — every 6 hours`

export default function AfterPage() {
  const [followUp, setFollowUp] = useState<'improving' | 'same' | 'worse' | null>(null)
  const [logDone, setLogDone] = useState(false)
  const [shared, setShared] = useState(false)

  const handleShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(WHATSAPP_TEXT)}`, '_blank')
    setShared(true)
  }

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
      
      {/* 0. OVERVIEW */}
      <div>
        <div className="section-eyebrow" style={{ marginBottom: '8px' }}>Phase 3 · Uwi Ka Na</div>
        <h1 className="text-h1" style={{ marginBottom: '16px' }}>Post-Visit & Follow-up</h1>
        <p className="text-body text-secondary" style={{ maxWidth: '600px' }}>
          Share your visit summary with family, log your experience to help the community, and let GabAi track your recovery and remember this encounter for next time.
        </p>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      {/* 1. WHATSAPP SHARE */}
      <div id="share" className="feature-anchor">
        <div className="section-eyebrow" style={{ color: '#25d366', marginBottom: '8px' }}>1. Communication</div>
        <h2 className="text-h2" style={{ marginBottom: '24px' }}>Share with Family</h2>
        
        <div className="card" style={{ maxWidth: '700px', borderTop: '4px solid #25d366' }}>
          <div className="card-body">
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', padding: '16px', fontSize: '0.875rem', lineHeight: 1.7, color: '#166534', marginBottom: '24px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {WHATSAPP_TEXT}
            </div>
            {!shared ? (
              <button className="btn btn-primary" style={{ background: '#25d366', width: '100%' }} onClick={handleShare}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Send via WhatsApp
              </button>
            ) : (
              <div className="text-sm font-semibold" style={{ color: '#25d366', textAlign: 'center' }}>
                Shared successfully.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      {/* 2. FOLLOW-UP CHECK */}
      <div id="followup" className="feature-anchor">
        <div className="section-eyebrow" style={{ color: 'var(--primary)', marginBottom: '8px' }}>2. Recovery Tracking</div>
        <h2 className="text-h2" style={{ marginBottom: '24px' }}>24-48 Hour Check-in</h2>
        
        <div className="card" style={{ maxWidth: '700px' }}>
          <div className="card-body">
            <p className="text-sm text-secondary" style={{ marginBottom: '24px' }}>
              How is the patient doing after the visit? GabAi will evaluate if you need to return sooner.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                { val: 'improving' as const, label: 'Improving — Getting better', color: 'var(--success)' },
                { val: 'same' as const,      label: 'No change — About the same', color: 'var(--warning)' },
                { val: 'worse' as const,     label: 'Worsening — Condition declined', color: 'var(--danger)' },
              ].map((opt) => (
                <div
                  key={opt.val}
                  className={`radio-card ${followUp === opt.val ? 'selected' : ''}`}
                  style={{ border: `2px solid ${followUp === opt.val ? opt.color : 'var(--border)'}`, padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                  onClick={() => setFollowUp(opt.val)}
                >
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: followUp === opt.val ? opt.color : 'transparent', border: `2px solid ${opt.color}` }} />
                  <span className="text-sm" style={{ fontWeight: 600 }}>{opt.label}</span>
                </div>
              ))}
            </div>

            {followUp === 'improving' && <div className="info-box"><span className="text-sm">Great — continue as prescribed and rest.</span></div>}
            {followUp === 'same'      && <div className="warn-box" style={{ background: 'var(--warning-bg)', borderLeftColor: 'var(--warning)' }}><span className="text-sm" style={{ color: 'var(--warning)' }}>Monitor closely. Return if no improvement tomorrow.</span></div>}
            {followUp === 'worse'     && <div className="warn-box"><span className="text-sm">Return to facility immediately for reassessment.</span></div>}
          </div>
        </div>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      {/* 3. COMMUNITY LOG */}
      <div id="experience" className="feature-anchor">
        <div className="section-eyebrow" style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>3. Future Patients</div>
        <h2 className="text-h2" style={{ marginBottom: '24px' }}>Community Experience Log</h2>
        
        <div className="card" style={{ maxWidth: '700px' }}>
          <div className="card-body">
            {!logDone ? (
              <>
                <p className="text-sm text-secondary" style={{ marginBottom: '24px' }}>
                  Your anonymous feedback helps the LGU optimize facility wait times.
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <label className="section-eyebrow" style={{ display: 'block', marginBottom: '8px' }}>Wait Time</label>
                  <select className="input select">
                    <option>Under 30 min</option>
                    <option>1–2 hours</option>
                    <option>5+ hours</option>
                  </select>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={() => setLogDone(true)}>
                  Submit Anonymous Log
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <h3 className="text-h3" style={{ color: 'var(--success)', marginBottom: '8px' }}>Thank you.</h3>
                <p className="text-sm text-muted">Your log was recorded anonymously via GabAi.</p>
              </div>
            )}
          </div>
        </div>

        {/* Alaala Ko Save */}
        <div className="card" style={{ maxWidth: '700px', background: 'var(--bg-dark)', border: 'none', marginTop: '24px' }}>
          <div className="card-body">
            <h3 className="text-h3" style={{ color: '#fff', marginBottom: '8px' }}>Saved to Alaala Ko</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
              This encounter is stored. Your next visit will begin with this context already loaded.
            </p>
            <button className="btn btn-secondary" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'transparent' }}>
              Start New Encounter
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
