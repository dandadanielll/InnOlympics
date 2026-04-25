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

export default function AfterPage() {
  const router = useRouter()
  const { getLatestEncounter, updateEncounter, createEncounter, getAllEncounters, user } = useGabAiStore()
  const encounter = getLatestEncounter()

  const [followUp, setFollowUp] = useState<'improving' | 'same' | 'worse' | null>(null)
  const [logDone, setLogDone] = useState(false)
  const [communityForm, setCommunityForm] = useState<CommunityFormState>({
    waitTime: 'under-30',
    doctorHelpful: null,
    turnedAway: false,
    rating: 0,
  })

  function waitTimeToMinutes(val: string): number {
    const map: Record<string, number> = {
      'under-30': 15,
      '30-60': 45,
      '1-2hrs': 90,
      '2-5hrs': 210,
      '5plus': 360,
    }
    return map[val] ?? 30
  }

  const [userMessage, setUserMessage] = useState('')
  const [isChatStarted, setIsChatStarted] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [followUpMessage, setFollowUpMessage] = useState<string | null>(null)
  const [followUpAction, setFollowUpAction] = useState<string | null>(null)

  const handleFollowUpSave = async (val: 'improving' | 'same' | 'worse') => {
    setFollowUp(val)
    setIsEvaluating(true)

    if (encounter) {
      updateEncounter(encounter.id, {
        followUpStatus: val === 'improving' ? 'improving' : val === 'worse' ? 'flagged' : 'pending',
      })
    }

    try {
      const response = await fetch('/api/gemini/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followUpStatus: val,
          userMessage: userMessage,
          symptoms: encounter?.symptoms ?? '',
          toRemember: encounter?.toRemember ?? [],
          language: user?.language || 'taglish',
          history: getAllEncounters().filter(e => e.id !== encounter?.id).slice(-3)
        }),
      })
      const data = await response.json()
      setFollowUpMessage(data.message ?? null)
      setFollowUpAction(data.recommendedAction ?? null)
    } catch {
      setFollowUpMessage(null)
      setFollowUpAction(null)
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleStartNew = (isReferral = false) => {
    const prevSymptoms = encounter?.symptoms || ''
    const newId = createEncounter()
    if (isReferral && prevSymptoms) {
      updateEncounter(newId, {
        symptoms: `[Referred] ${prevSymptoms}`
      })
    }
    router.push('/navigator/before')
  }

  // Visit Recap formatting
  const visitFacilityName = encounter?.selectedFacility?.name || encounter?.carePlan?.recommendedFacility || 'Hindi natukoy ang facility'
  const [visitDateStr, setVisitDateStr] = useState('Kamakailan')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (encounter && encounter.phase !== 'complete') {
      updateEncounter(encounter.id, { phase: 'complete' })
    }
  }, [])

  useEffect(() => {
    if (encounter?.updatedAt) {
      const date = new Date(encounter.updatedAt)
      setVisitDateStr(date.toLocaleDateString('fil-PH', { year: 'numeric', month: 'long', day: 'numeric' }))
    }
  }, [encounter?.updatedAt])

  // Suppress hydration mismatch by not rendering encounter data until mounted
  const mountedEncounter = isMounted ? encounter : null

  // Timeline Refs & State
  const [completedStep1, setCompletedStep1] = useState(false)
  const [completedStep2, setCompletedStep2] = useState(false)
  const [completedStep3, setCompletedStep3] = useState(false)
  const [completedStep4, setCompletedStep4] = useState(false)

  const step1Ref = useRef<HTMLElement>(null)
  const step2Ref = useRef<HTMLElement>(null)
  const step3Ref = useRef<HTMLElement>(null)
  const step4Ref = useRef<HTMLElement>(null)
  const step5Ref = useRef<HTMLElement>(null)

  return (
    <div className="bfr">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        @keyframes borderPulse {
          0%, 100% { border-color: var(--warning) }
          50% { border-color: transparent }
        }
        .fade-in-up {
          animation: fadeInUp 300ms ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bfr{margin:-120px -48px -48px; position:relative; overflow:visible !important}
        .phase-sec{display:flex;flex-direction:column;min-height:100vh;padding:160px 48px 120px;box-sizing:border-box;transition:opacity .4s,filter .4s;border-bottom:1px solid var(--border-light);overflow:visible !important;align-items:center}
        .phase-main{flex:1;min-width:0;display:flex;flex-direction:column;max-width:1040px;margin:0 auto;width:100%;overflow:visible !important;align-items:center;text-align:center}
        .phase-h1{font-family:'Outfit',sans-serif;font-size:3.5rem;font-weight:800;color:var(--text-primary);margin:0 0 12px;line-height:1.05;letter-spacing:-.04em}
        .phase-p{font-size:.9375rem;color:var(--text-secondary);line-height:1.6;margin:0 0 28px;max-width:800px}
        .phase-main-content{flex:1;padding-bottom:40px;overflow:visible !important;display:flex;flex-direction:column;align-items:center;width:100%}
        .phase-pri-btn{display:inline-flex;align-items:center;gap:6px;background:var(--primary);color:#fff;border:none;border-radius:40px;padding:9px 18px;font-weight:700;font-size:.6875rem;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif}
        .phase-pri-btn:hover{background:var(--primary-hover)}.phase-pri-btn:disabled{opacity:.35;cursor:not-allowed}
      ` }} />

      {/* STEP 1: VISIT RECAP */}
      <section className="phase-sec" ref={step1Ref}>
        <div className="phase-main">
          <h1 className="phase-h1">Buod ng Iyong Bisita</h1>
          <p className="phase-p">Suriin ang kabuuan ng iyong check-up bago tayo pumunta sa mga susunod na hakbang.</p>
          <div className="phase-main-content">
            <div className="card fade-in-up" style={{ width: '100%', maxWidth: '800px', borderTop: '6px solid var(--primary)', background: 'var(--bg-base)', padding: '32px', boxShadow: '0 12px 40px rgba(0,0,0,0.08)', overflow: 'visible', height: 'auto' }}>
              {mountedEncounter ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* TOP GRID */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
                    <div>
                      <div className="text-xs tracking-wide uppercase" style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>Status ng Encounter</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: mountedEncounter.phase === 'complete' ? 'var(--success)' : 'var(--warning)' }}>
                        {mountedEncounter.phase === 'complete' ? 'Tapos na ang Bisita' : 'Kasalukuyang Aktibo'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="text-xs text-muted uppercase" style={{ fontWeight: 600, marginBottom: '4px' }}>Petsa ng Check-up</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{visitDateStr}</div>
                    </div>
                  </div>

                  {/* MAIN SUMMARY DATA */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    <div>
                      <div className="text-xs tracking-wide uppercase" style={{ color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>Pasilidad</div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'color-mix(in srgb, var(--primary) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                          {visitFacilityName}
                        </div>
                      </div>
                    </div>

                    {mountedEncounter.classification && mountedEncounter.needType === 'diagnosis' && (
                      <div>
                        <div className="text-xs tracking-wide uppercase" style={{ color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>Diagnosis / Classification</div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'color-mix(in srgb, var(--warning) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                            {mountedEncounter.classification.title}
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>Risk Level: {mountedEncounter.classification.risk.toUpperCase()}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MEDICINES SECTION */}
                  <div style={{ background: 'var(--bg-muted)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.5 20.5 19 12a4.95 4.95 0 1 0-7-7L3.5 13.5a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" />
                      </svg>
                      <div className="text-sm uppercase" style={{ fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>Mga Gamot at Bilin na Dapat Tandaan</div>
                    </div>
                    
                    {mountedEncounter.toRemember && mountedEncounter.toRemember.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {mountedEncounter.toRemember.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--bg-base)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                            <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1rem' }}>•</div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{item}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted" style={{ fontStyle: 'italic' }}>Walang nakatalang partikular na gamot o bilin.</div>
                    )}
                  </div>

                  {/* DOCUMENT FINDINGS */}
                  {mountedEncounter.documentScans && mountedEncounter.documentScans.length > 0 && (
                    <div>
                      <div className="text-sm uppercase" style={{ fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                        </svg>
                        Medical Findings mula sa Scans
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {mountedEncounter.documentScans.map((scan, idx) => (
                          <div key={idx} style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px' }}>
                            <div className="text-xs text-muted" style={{ marginBottom: '8px' }}>Scan #{idx + 1}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{scan.explanation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REFERRAL ALERT IF ANY */}
                  {mountedEncounter.referralTriggered && (
                    <div style={{ display: 'flex', gap: '16px', background: 'color-mix(in srgb, var(--warning) 8%, transparent)', padding: '20px', borderRadius: '16px', border: '1px solid var(--warning)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" />
                      </svg>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>May Inirekomendang Referral</div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Sumangguni sa susunod na seksyon para sa detalye ng iyong referral.</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p className="text-body text-secondary" style={{ marginBottom: '16px' }}>Walang encounter data. Magsimula sa Before Phase para mag-log ng bagong bisita.</p>
                  <button className="btn btn-primary" onClick={() => router.push('/navigator/before')}>Pumunta sa Before Phase &rarr;</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STEP 2: REFERRAL COMPANION */}
      <section className="phase-sec">
        <div className="phase-main">
          <h1 className="phase-h1">Susunod na Hakbang</h1>
          <p className="phase-p">Kung ikaw ay nirefer sa ibang pasilidad o laboratoryo, ito ang iyong gabay para sa susunod na hakbang.</p>
          <div className="phase-main-content">
            {!mountedEncounter || (!mountedEncounter.referralTriggered && mountedEncounter.needType !== 'diagnosis') ? (
              <div className="card" style={{ width: '100%', maxWidth: '700px', background: 'var(--bg-muted)', border: '1px dashed var(--border)', opacity: 0.6 }}>
                <div className="card-body" style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Walang referral sa encounter na ito.</div>
                    <div className="text-xs text-muted" style={{ marginTop: '4px' }}>Kung bibigyan ka ng referral sa susunod, lilitaw dito ang gabay para sa susunod na hakbang mo.</div>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="card fade-in-up" 
                style={{ 
                  width: '100%', 
                  maxWidth: '600px', 
                  border: '2px solid var(--warning)', 
                  background: 'var(--bg-base)', 
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  padding: '0'
                }}
                onClick={() => handleStartNew(true)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(176, 124, 57, 0.15)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-soft)'
                }}
              >
                <div style={{ background: 'var(--warning)', color: '#fff', padding: '12px', textAlign: 'center', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Inirerekomendang Susunod na Hakbang
                </div>
                <div className="card-body" style={{ padding: '40px', textAlign: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                      <path d="M12 11h4" />
                      <path d="M12 16h4" />
                      <path d="M8 11h.01" />
                      <path d="M8 16h.01" />
                    </svg>
                  </div>
                  
                  <div className="text-xs uppercase" style={{ color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>Serbisyong Kakaingailanganin:</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px', lineHeight: 1.2 }}>
                    {mountedEncounter.classification?.title || 'Specialist Consultation'}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                    I-click ang card na ito para simulan ang paghahanap ng pinakamalapit na pasilidad para sa iyong referral.
                  </p>
                  
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', fontWeight: 700, fontSize: '0.875rem' }}>
                    SIMULAN ANG ENCOUNTER <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STEP 3: FOLLOW-UP INTELLIGENCE */}
      <section className="phase-sec">
        <div className="phase-main">
          <h1 className="phase-h1">Okay Ka Pa Ba?</h1>
          <p className="phase-p">
            {mountedEncounter?.symptoms
              ? `Kumusta ang lagay mo mula sa iyong bisita para sa "${mountedEncounter.symptoms.length > 60 ? mountedEncounter.symptoms.substring(0, 60) + '...' : mountedEncounter.symptoms}"?`
              : 'I-update ang iyong lagay para masubaybayan ng GabAi ang iyong pagbabago.'}
          </p>
          <div className="phase-main-content">
            <div className="card" style={{ width: '100%', maxWidth: '700px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!isChatStarted && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { val: 'improving' as const, label: 'Gumagaling — Bumubuti na', color: 'var(--success)' },
                    { val: 'same' as const, label: 'Pareho pa rin — Walang pagbabago', color: 'var(--warning)' },
                    { val: 'worse' as const, label: 'Lumala — Bumaba ang kalagayan', color: 'var(--danger)' },
                  ].map((opt) => {
                    const isSelected = followUp === opt.val
                    return (
                      <div
                        key={opt.val}
                        style={{
                          borderTop: `1px solid ${isSelected ? opt.color : 'var(--border)'}`,
                          borderRight: `1px solid ${isSelected ? opt.color : 'var(--border)'}`,
                          borderBottom: `1px solid ${isSelected ? opt.color : 'var(--border)'}`,
                          borderLeft: `4px solid ${opt.color}`,
                          background: isSelected ? `color-mix(in srgb, ${opt.color} 10%, transparent)` : 'var(--bg-base)',
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 150ms ease'
                        }}
                        onClick={() => setFollowUp(opt.val)}
                      >
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          border: `2px solid ${isSelected ? opt.color : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: opt.color }} />}
                        </div>
                        <span style={{ fontWeight: isSelected ? 600 : 500, color: 'var(--text-primary)' }}>{opt.label}</span>
                      </div>
                    )
                  })}

                  <textarea
                    placeholder="May iba ka pa bang nararamdaman? (Opsiyonal)"
                    className="input"
                    style={{ width: '100%', minHeight: '80px', marginTop: '8px', resize: 'vertical' }}
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                  />

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '8px' }}
                    disabled={!followUp || isEvaluating}
                    onClick={() => {
                      if (followUp) {
                        setIsChatStarted(true)
                        handleFollowUpSave(followUp)
                      }
                    }}
                  >
                    Ipadala ang Status
                  </button>
                </div>
              )}

              {isChatStarted && (
                <div style={{
                  borderLeft: `4px solid ${followUp === 'worse' ? 'var(--danger)' : followUp === 'same' ? 'var(--warning)' : 'var(--success)'}`,
                  background: 'var(--bg-muted)', padding: '16px', borderRadius: 'var(--radius-md)'
                }}>
                  <p className="text-sm" style={{ fontWeight: 600 }}>
                    Status: {followUp === 'improving' ? 'Gumagaling' : followUp === 'same' ? 'Pareho pa rin' : 'Lumalala'}
                  </p>
                  {userMessage && <p className="text-sm text-secondary" style={{ marginTop: '4px' }}>"{userMessage}"</p>}
                </div>
              )}

              {isEvaluating ? (
                <div className="fade-in-up" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'pulse 1s infinite' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'pulse 1s infinite 0.2s' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'pulse 1s infinite 0.4s' }} />
                  <span className="text-sm text-muted" style={{ marginLeft: '8px' }}>Pinoproseso ang iyong status...</span>
                </div>
              ) : followUpMessage ? (
                <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    background: followUp === 'worse' ? 'var(--danger-bg, #fff5f5)' : followUp === 'same' ? 'var(--warning-bg)' : 'color-mix(in srgb, var(--success) 10%, transparent)',
                    border: `1px solid ${followUp === 'worse' ? 'var(--danger)' : followUp === 'same' ? 'var(--warning)' : 'var(--success)'}`,
                    padding: '16px', borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={followUp === 'worse' ? 'var(--danger)' : followUp === 'same' ? 'var(--warning)' : 'var(--success)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <div>
                        <p className="text-sm" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{followUpMessage}</p>
                        {followUpAction && (
                          <p className="text-sm" style={{ marginTop: '8px', color: followUp === 'worse' ? 'var(--danger)' : 'var(--text-secondary)' }}>
                            <strong>Aksyon:</strong> {followUpAction}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {followUp === 'worse' && (
                    <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)', width: '100%' }} onClick={() => handleStartNew(false)}>
                      Hanapin ang Pinakamalapit na Pasilidad &rarr;
                    </button>
                  )}
                </div>
              ) : isChatStarted && !isEvaluating ? (
                <div className="fade-in-up" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <p className="text-sm" style={{ marginBottom: '8px' }}>Paumanhin, hindi maabot ang GabAi intelligence sa ngayon. Narito ang pangkalahatang payo:</p>
                  {followUp === 'improving' && <p className="text-sm" style={{ fontWeight: 500 }}>Magpatuloy sa iyong mga gamot at magpahinga nang maayos.</p>}
                  {followUp === 'same' && <p className="text-sm" style={{ fontWeight: 500, color: 'var(--warning)' }}>Bantayan mabuti. Bumalik sa pasilidad kung walang pagbabago bukas.</p>}
                  {followUp === 'worse' && <p className="text-sm" style={{ fontWeight: 500, color: 'var(--danger)' }}>Bumalik agad sa pasilidad para sa muling pagsusuri.</p>}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* STEP 4: COMMUNITY LOG */}
      <section className="phase-sec">
        <div className="phase-main">
          <h1 className="phase-h1">Community Experience Log</h1>
          <p className="phase-p">Ang iyong anonymous na feedback ay tumutulong sa mga susunod na pasyente at sa LGU para mapabuti ang serbisyo.</p>
          <div className="phase-main-content">
            <div className="card" style={{ width: '100%', maxWidth: '700px' }}>
              <div className="card-body">
                {!logDone ? (
                  <>
                    <p className="text-sm text-secondary" style={{ marginBottom: '24px' }}>
                      Punan ang form na ito para makatulong sa komunidad.
                    </p>
                    <div style={{ marginBottom: '24px' }}>
                      <label className="section-eyebrow" style={{ display: 'block', marginBottom: '8px' }}>Gaano katagal ang iyong hinintay?</label>
                      <select className="input" value={communityForm.waitTime} onChange={e => setCommunityForm(prev => ({ ...prev, waitTime: e.target.value }))}>
                        <option value="under-30">Wala pang 30 minuto</option>
                        <option value="30-60">30 minuto hanggang 1 oras</option>
                        <option value="1-2hrs">1 hanggang 2 oras</option>
                        <option value="2-5hrs">2 hanggang 5 oras</option>
                        <option value="5plus">Higit sa 5 oras</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label className="section-eyebrow" style={{ display: 'block', marginBottom: '12px' }}>Nakatulong ba ang doktor o nars?</label>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div
                          style={{
                            flex: '1 1 200px',
                            border: `2px solid ${communityForm.doctorHelpful === true ? 'var(--primary)' : 'var(--border)'}`,
                            background: communityForm.doctorHelpful === true ? 'color-mix(in srgb, var(--primary) 5%, var(--bg-base))' : 'var(--bg-base)',
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 150ms ease',
                          }}
                          onClick={() => setCommunityForm(prev => ({ ...prev, doctorHelpful: true }))}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: communityForm.doctorHelpful === true ? 'var(--primary)' : 'inherit' }}>
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                          </svg>
                          <span className="text-sm" style={{ fontWeight: 600 }}>Oo, nakatulong</span>
                        </div>
                        <div
                          style={{
                            flex: '1 1 200px',
                            border: `2px solid ${communityForm.doctorHelpful === false ? 'var(--danger)' : 'var(--border)'}`,
                            background: communityForm.doctorHelpful === false ? 'color-mix(in srgb, var(--danger) 5%, var(--bg-base))' : 'var(--bg-base)',
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 150ms ease',
                          }}
                          onClick={() => setCommunityForm(prev => ({ ...prev, doctorHelpful: false }))}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: communityForm.doctorHelpful === false ? 'var(--danger)' : 'inherit' }}>
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                          </svg>
                          <span className="text-sm" style={{ fontWeight: 600 }}>Hindi masyadong nakatulong</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label className="section-eyebrow" style={{ display: 'block', marginBottom: '12px' }}>Na-turn away ka ba? (Pinauwi nang walang konsultasyon?)</label>
                      <div
                        style={{
                          border: `1px solid ${communityForm.turnedAway ? 'var(--danger)' : 'var(--border)'}`,
                          background: communityForm.turnedAway ? 'color-mix(in srgb, var(--danger) 5%, var(--bg-base))' : 'var(--bg-base)',
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 150ms ease',
                        }}
                        onClick={() => setCommunityForm(prev => ({ ...prev, turnedAway: !prev.turnedAway }))}
                      >
                        <div style={{ width: '20px', height: '20px', border: `2px solid ${communityForm.turnedAway ? 'var(--danger)' : 'var(--border)'}`, borderRadius: '4px', background: communityForm.turnedAway ? 'var(--danger)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {communityForm.turnedAway && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <span className="text-sm" style={{ fontWeight: 600 }}>Oo, pinauwi ako nang hindi nakonsulta</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                      <label className="section-eyebrow" style={{ display: 'block', marginBottom: '12px' }}>Overall, paano mo i-rate ang iyong karanasan?</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill={communityForm.rating >= star ? '#FAC775' : 'none'}
                            stroke={communityForm.rating >= star ? '#FAC775' : 'var(--border)'}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ cursor: 'pointer', transition: 'transform 100ms ease' }}
                            onClick={() => setCommunityForm(prev => ({ ...prev, rating: star }))}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        ))}
                      </div>
                      {communityForm.rating > 0 && (
                        <div className="text-sm text-secondary" style={{ marginTop: '8px', fontWeight: 600 }}>
                          {communityForm.rating === 1 && 'Napakahirap ng karanasan'}
                          {communityForm.rating === 2 && 'Mahirap'}
                          {communityForm.rating === 3 && 'Okay naman'}
                          {communityForm.rating === 4 && 'Maganda'}
                          {communityForm.rating === 5 && 'Napakaganda ng serbisyo'}
                        </div>
                      )}
                    </div>

                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      disabled={communityForm.doctorHelpful === null || communityForm.rating === 0}
                      onClick={() => {
                        if (encounter) {
                          updateEncounter(encounter.id, {
                            communityRating: {
                              waitTime: waitTimeToMinutes(communityForm.waitTime),
                              doctorHelpful: communityForm.doctorHelpful ?? false,
                              turnedAway: communityForm.turnedAway,
                              rating: communityForm.rating,
                            },
                          })
                        }
                        setLogDone(true)
                      }}
                    >
                      I-submit ang Anonymous na Log
                    </button>
                    <p className="text-sm text-muted" style={{ marginTop: '8px', textAlign: 'center', fontSize: '0.75rem' }}>
                      Kakailanganin pang kumpletuhin ang rating at doctor feedback bago mag-submit.
                    </p>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <h3 className="text-h3" style={{ color: 'var(--success)', marginBottom: '8px' }}>Salamat!</h3>
                    <p className="text-sm" style={{ color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 600 }}>
                      Wait time: {communityForm.waitTime} &middot; Doktor: {communityForm.doctorHelpful ? 'Nakatulong' : 'Hindi'} &middot; Rating: {communityForm.rating}/5 <span style={{ color: '#FAC775' }}>★</span>
                    </p>
                    <p className="text-sm text-muted">Nai-save ang iyong feedback. Tumutulong ito sa mga susunod na pasyente.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 5: ALAALA KO (DONE) */}
      <section className="phase-sec">
        <div className="phase-main">
          <h1 className="phase-h1">Saved to Alaala Ko</h1>
          <p className="phase-p">Ang encounter na ito ay naka-imbak sa iyong device. Awtomatikong gagamitin ng GabAi ang kasaysayang ito para mas maging handa ka sa susunod.</p>
          <div className="phase-main-content">
            <div className="card" style={{ width: '100%', maxWidth: '700px', background: 'var(--bg-dark)', border: 'none' }}>
              <div className="card-body">
                <h3 className="text-h3" style={{ color: '#fff', marginBottom: '8px' }}>Saved to Alaala Ko</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                  Ang encounter na ito ay naka-imbak sa iyong device. Sa susunod mong bisita, awtomatikong gagamitin ng GabAi ang kasaysayang ito para mas maging handa ka.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => router.push('/history')}
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