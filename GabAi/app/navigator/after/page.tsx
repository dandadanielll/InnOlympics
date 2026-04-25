'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGabAiStore } from '@/lib/store'

interface CommunityFormState {
  waitTime: string
  doctorHelpful: boolean | null
  turnedAway: boolean
  rating: number
}

const WHATSAPP_TEXT = `GabAi Visit Summary: I've completed my hospital visit. Here are the details...\n\nStatus: Recovering\nFacility: PGH\nNext Steps: Follow-up in 2 days.`

export default function AfterPage() {
  const router = useRouter()
  const { currentEncounterId, getLatestEncounter, updateEncounter, createEncounter, getAllEncounters, user, getCurrentEncounter } = useGabAiStore()
  const encounter = getCurrentEncounter() || getLatestEncounter()

  const [followUp, setFollowUp] = useState<'improving' | 'same' | 'worse' | null>(null)
  const [logDone, setLogDone] = useState(false)
  const [shared, setShared] = useState(false)

  // Stepper states
  const [completedStep2, setCompletedStep2] = useState(false)
  const [completedStep3, setCompletedStep3] = useState(false)
  const [completedStep4, setCompletedStep4] = useState(false)

  // ── JOURNEY PERSISTENCE ──
  useEffect(() => {
    const enc = getCurrentEncounter() || getLatestEncounter()
    if (enc && enc.stepState?.after) {
      const as = enc.stepState.after
      if (as.step2) setCompletedStep2(true)
      if (as.step3) setCompletedStep3(true)
      if (as.step4) setCompletedStep4(true)
      if (as.shared) setShared(true)
      if (as.logDone) setLogDone(true)
    }
  }, [currentEncounterId])

  // Save steps to store when they change
  useEffect(() => {
    const id = currentEncounterId || getLatestEncounter()?.id
    if (id) {
      const enc = getCurrentEncounter() || getLatestEncounter()
      if (enc) {
        updateEncounter(id, {
          stepState: {
            ...enc.stepState,
            after: {
              step2: completedStep2,
              step3: completedStep3,
              step4: completedStep4,
              shared: shared,
              logDone: logDone
            }
          }
        })
      }
    }
  }, [completedStep2, completedStep3, completedStep4, shared, logDone])

  // Refs for scrolling
  const step3Ref = useRef<HTMLDivElement>(null)
  const step4Ref = useRef<HTMLDivElement>(null)
  const step5Ref = useRef<HTMLDivElement>(null)

  const handleShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(WHATSAPP_TEXT)}`, '_blank')
    setShared(true)
  }

  const handleStartNew = (isReferral: boolean) => {
    router.push('/navigator/before')
  }

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px', padding: '40px 20px' }}>

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
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y2="15" />
                </svg>
                Send via WhatsApp
              </button>
            ) : (
              <div className="card fade-in-up" style={{ width: '100%', maxWidth: '700px', borderTop: '4px solid var(--warning)', background: 'var(--bg-base)', animation: 'borderPulse 1s ease 2, fadeInUp 300ms ease-out forwards' }}>
                <div className="card-body">
                  <div style={{ display: 'inline-flex', background: 'var(--warning)', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                    May Referral ang Iyong Doktor
                  </div>
                  <p className="text-sm text-secondary" style={{ marginTop: '12px' }}>
                    Binigyan ka ng referral ng iyong doktor. Ang susunod na hakbang ay isa pang encounter — at tutulungan ka ng GabAi sa buong proseso.
                  </p>
                  <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {/* Step 1 */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
                        <div style={{ width: '2px', height: '32px', background: 'var(--border)', margin: '4px auto' }} />
                      </div>
                      <div style={{ paddingBottom: '16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Kumuha ng Referral Form</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Humingi ng referral slip sa doktor mo bago umalis. Kailangan ito para matanggap ka sa susunod na pasilidad.</div>
                      </div>
                    </div>
                    {/* Step 2 */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
                        <div style={{ width: '2px', height: '32px', background: 'var(--border)', margin: '4px auto' }} />
                      </div>
                      <div style={{ paddingBottom: '16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Alamin ang Susunod na Pasilidad</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>I-click ang button sa ibaba para simulan ang bagong Before Phase para sa iyong referral na pasilidad o laboratoryo.</div>
                      </div>
                    </div>
                    {/* Step 3 */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Dalhin ang Iyong Alaala Ko</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Awtomatikong dadalhin ng GabAi ang kasaysayan ng iyong encounter para sa susunod mong bisita.</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" style={{ flex: '1 1 auto' }} onClick={() => handleStartNew(true)}>
                      Simulan ang Bagong Encounter &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button className="phase-pri-btn" style={{ marginTop: '24px', alignSelf: 'center' }} onClick={() => { setCompletedStep2(true); setTimeout(() => step3Ref.current?.scrollIntoView({ behavior: 'smooth' }), 200) }}>
              Ipagpatuloy <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      {/* 2. FOLLOW-UP CHECK */}
      <div id="followup" className="feature-anchor" ref={step3Ref}>
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
                { val: 'same' as const, label: 'No change — About the same', color: 'var(--warning)' },
                { val: 'worse' as const, label: 'Worsening — Condition declined', color: 'var(--danger)' },
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

            <button className="phase-pri-btn" style={{ marginTop: '24px', alignSelf: 'center' }} onClick={() => { setCompletedStep3(true); setTimeout(() => step4Ref.current?.scrollIntoView({ behavior: 'smooth' }), 200) }}>
              Ipagpatuloy <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      {/* 3. COMMUNITY LOG */}
      <div id="experience" className="feature-anchor" ref={step4Ref}>
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

        <button className="phase-pri-btn" style={{ marginTop: '24px', alignSelf: 'center' }} onClick={() => { setCompletedStep4(true); setTimeout(() => step5Ref.current?.scrollIntoView({ behavior: 'smooth' }), 200) }}>
          Ipagpatuloy <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* STEP 5: ALAALA KO (DONE) */}
      <section className={`phase-sec ${completedStep4 ? '' : 'locked'}`} ref={step5Ref}>
        <div className="phase-num-col">
          <div className={`phase-circ ${completedStep4 ? 'active' : ''}`}>5</div>
        </div>
        <div className="phase-main">
          <span className="phase-tag">Tapos Na</span>
          <h1 className="phase-h1">Saved to Alaala Ko</h1>
          <p className="phase-p">Ang encounter na ito ay naka-imbak sa iyong device. Awtomatikong gagamitin ng GabAi ang kasaysayang ito para mas maging handa ka sa susunod.</p>
          <div className="phase-main-scrollable" style={{ paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '700px', background: 'var(--bg-dark)', border: 'none' }}>
              <div className="card-body">
                <h3 className="text-h3" style={{ color: '#fff', marginBottom: '8px' }}>Saved to Alaala Ko</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                  Ang encounter na ito ay naka-imbak sa iyong device. Sa susunod mong bisita, awtomatikong gagamitin ng GabAi ang kasaysayang ito para mas maging handa ka.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => router.push('/dashboard')}
                >
                  Bumalik sa Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
