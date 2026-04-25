'use client'

import { useState } from 'react'

const MOCK_TRANSCRIPT = [
  { speaker: 'Doctor', text: 'Magandang umaga. Ano ang dahilan ng inyong pagpunta ngayon?' },
  { speaker: 'Patient', text: 'Lagnat po ang anak ko ng 3 araw. 38.5 degrees kahapon.' },
]

const MOCK_TO_REMEMBER = [
  'Paracetamol 250mg syrup — every 6 hours when fever is present (37.8°C or above)',
  'Follow-up appointment on Friday at 9:00 AM',
]

const PATIENT_RIGHTS = [
  { right: 'Free consultation under Konsulta', how: 'Ensure facility is PhilHealth-accredited.' },
  { right: 'Copy of medical records', how: 'Always request written copies of prescriptions.' },
]

export default function DuringPage() {
  const [isLogging, setIsLogging] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(false)

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => { setScanning(false); setScanned(true) }, 1000)
  }

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
      
      {/* 0. OVERVIEW */}
      <div>
        <div className="section-eyebrow" style={{ marginBottom: '8px' }}>Phase 2 · Nandito Ka Na</div>
        <h1 className="text-h1" style={{ marginBottom: '16px' }}>Encounter Support</h1>
        <p className="text-body text-secondary" style={{ maxWidth: '600px' }}>
          Use the tools below while you are waiting or speaking with your doctor to log the conversation, know your PhilHealth rights, and decode any documents hand-written by the clinic.
        </p>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      {/* 1. PATIENT RIGHTS */}
      <div id="rights" className="feature-anchor">
        <div className="section-eyebrow" style={{ color: 'var(--warning)', marginBottom: '8px' }}>1. Know Your Rights</div>
        <h2 className="text-h2" style={{ marginBottom: '24px' }}>PhilHealth Entitlements</h2>
        
        <div className="card" style={{ maxWidth: '700px', borderTop: '4px solid var(--warning)' }}>
          <div className="card-body">
            {PATIENT_RIGHTS.map((r, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < PATIENT_RIGHTS.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{r.right}</div>
                <div className="text-sm text-secondary">{r.how}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      {/* 2. VOICE LOGGER */}
      <div id="voice" className="feature-anchor">
        <div className="section-eyebrow" style={{ color: 'var(--primary)', marginBottom: '8px' }}>2. Encounter Voice Logger</div>
        <h2 className="text-h2" style={{ marginBottom: '24px' }}>Record Consultation</h2>
        
        <div className="two-col" style={{ gap: '24px' }}>
          <div className="card">
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 24px' }}>
              <button
                className={`btn ${isLogging ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '80px', height: '80px', borderRadius: '50%', padding: 0, marginBottom: '24px' }}
                onMouseDown={() => { setIsLogging(true); setShowTranscript(true) }}
                onMouseUp={() => setIsLogging(false)}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill={isLogging ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
              <h3 className="text-h3" style={{ marginBottom: '8px' }}>Push to Listen</h3>
              <p className="text-sm text-secondary">GabAI will securely transcribe the consult and extract key medical advice.</p>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-muted)' }}>
            <div className="card-body">
              {showTranscript ? (
                <>
                  <div className="section-eyebrow" style={{ marginBottom: '12px' }}>AI Extracted Notes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {MOCK_TO_REMEMBER.map((note, i) => (
                      <div key={i} style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                        <span className="text-sm font-semibold color: var(--text-primary)">{note}</span>
                      </div>
                    ))}
                  </div>
                  <div className="section-eyebrow" style={{ marginBottom: '12px' }}>Live Transcript</div>
                  {MOCK_TRANSCRIPT.map((line, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>
                      <span className="text-xs font-bold" style={{ color: i === 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{line.speaker}: </span>
                      <span className="text-sm text-secondary">{line.text}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="text-sm text-muted">Transcript and notes will appear here.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      {/* 3. DOCUMENT SCANNER */}
      <div id="scanner" className="feature-anchor">
        <div className="section-eyebrow" style={{ color: 'var(--success)', marginBottom: '8px' }}>3. Document Scanner</div>
        <h2 className="text-h2" style={{ marginBottom: '24px' }}>Analyze Prescriptions</h2>
        
        <div className="card" style={{ borderTop: '4px solid var(--success)', maxWidth: '700px' }}>
          <div className="card-body">
            {!scanned ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-base)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
                <div style={{ maxWidth: '300px', marginBottom: '24px' }}>
                  <h3 className="text-h3" style={{ marginBottom: '8px' }}>Scan Document</h3>
                  <p className="text-sm text-secondary">Upload or take a photo of your prescription to get a plain-Filipino explanation.</p>
                </div>
                <button className="btn btn-secondary" style={{ borderColor: 'var(--success)', color: 'var(--success)' }} onClick={handleScan}>
                  {scanning ? 'Scanning...' : 'Open Camera'}
                </button>
              </div>
            ) : (
              <div>
                <span className="badge badge-success" style={{ marginBottom: '16px' }}>Prescription Detected</span>
                <p className="text-sm" style={{ lineHeight: 1.8, marginBottom: '24px' }}>
                  This is a prescription for <strong>Paracetamol Syrup 250mg</strong>. Give this to your child every 6 hours when their temperature is 37.8°C or higher. Do not exceed 5 doses in 24 hours.
                </p>
                <button className="btn btn-ghost btn-sm" onClick={() => setScanned(false)}>Scan Another</button>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
