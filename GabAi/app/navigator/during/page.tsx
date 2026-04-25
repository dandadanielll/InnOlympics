'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGabAiStore } from '@/lib/store'
import { LegalNotice } from '../../components/LegalNotice'
import { blobToBase64, getSupportedMimeType, createAudioVisualizer } from '@/lib/audioHelpers'

// ─── Interfaces ─────────────────────────────────────────────────────────────
interface RecallInstruction {
  category: string
  instruction: string
  confidence: 'clear' | 'reconstructed' | 'unclear'
}

interface RecallResult {
  instructions: RecallInstruction[]
  flagged: string[]
  rawInput: string
  processedAt: string
}

interface PatientRight {
  right: string
  how: string
  article?: string
  application?: string
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function PatientRightsSection() {
  const { user, getCurrentEncounter, getLatestEncounter, updateEncounter, getAllEncounters } = useGabAiStore()
  const encounter = getCurrentEncounter() || getLatestEncounter()

  const [rights, setRights] = useState<PatientRight[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!encounter || !encounter.symptoms) {
      setLoading(false)
      return
    }

    if (encounter.patientRights && encounter.patientRights.length > 0) {
      setRights(encounter.patientRights)
      setLoading(false)
      return
    }

    const fetchRights = async () => {
      try {
        // Derive facility level from tags if not explicitly in carePlan
        let facilityLevel = encounter.carePlan?.facilityLevel || ''
        if (!facilityLevel && encounter.selectedFacility?.tags) {
          const tags = encounter.selectedFacility.tags.map((t: string) => t.toLowerCase())
          if (tags.includes('tertiary') || tags.includes('level iii')) facilityLevel = 'Tertiary'
          else if (tags.includes('level ii')) facilityLevel = 'Secondary'
          else if (tags.includes('level i')) facilityLevel = 'Primary'
          else if (encounter.selectedFacility.isBHC) facilityLevel = 'BHC'
        }
        
        // Fallback to classification risk
        if (!facilityLevel && encounter.classification?.risk) {
          const risk = encounter.classification.risk.toLowerCase()
          if (risk === 'high' || risk === 'emergency') facilityLevel = 'Tertiary'
          else if (risk === 'moderate') facilityLevel = 'Secondary'
          else facilityLevel = 'Primary'
        }

        const res = await fetch('/api/gemini/rights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symptoms: encounter.symptoms,
            facilityLevel,
            philHealth: user?.philHealth || 'not-sure',
            language: user?.language || 'taglish',
            history: getAllEncounters().filter(e => e.id !== encounter.id).slice(-3) // last 3 past encounters
          })
        })
        const data = await res.json()
        if (data.rights) {
          setRights(data.rights)
          updateEncounter(encounter.id, { patientRights: data.rights })
        }
      } catch (err) {
        console.error('Failed to fetch rights', err)
        // Fallback rights if API fails
        setRights([
          { right: 'Karapatang malaman ang iyong diagnosis', how: 'Tanungin ang doktor: "Ano po ang aking sakit?" May karapatan kang malaman sa simpleng wika.' },
          { right: 'Karapatan sa pangalawang opinyon', how: 'Maaari kang kumunsulta sa ibang doktor. Hindi ito insulto sa doktor mo.' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchRights()
  }, [encounter?.id, encounter?.symptoms, encounter?.carePlan?.facilityLevel, user?.philHealth, user?.language, updateEncounter])

  if (!mounted) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(!encounter || !encounter.symptoms) ? (
        <div style={{ textAlign: 'center', padding: '40px 24px', background: 'rgba(139,90,60,0.05)', borderRadius: '16px', border: '1px dashed rgba(139,90,60,0.2)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📋</div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Kinakailangan ang <b>Phase 1 (Intake)</b> para makita ang mga karapatang ito.</p>
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '20px' }}
            onClick={() => window.location.href = '/navigator/before'}
          >
            ← Bumalik sa Before Phase
          </button>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: '90px', width: '100%', borderRadius: '14px' }} />
          ))}
        </div>
      ) : rights.length > 0 ? (
        rights.map((r, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid var(--border-light)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: '#510400', borderRadius: '4px 0 0 4px' }} />
            <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#510400', marginBottom: '12px' }}>{r.right}</div>
            <p style={{ fontSize: '0.875rem', color: '#6B4F3A', lineHeight: 1.65, margin: 0 }}>{r.how}</p>
          </div>
        ))
      ) : null}
    </div>
  )
}

function RecallAssistantSection() {
  const { user, getCurrentEncounter, getLatestEncounter, updateEncounter, getAllEncounters } = useGabAiStore()
  const [recallInput, setRecallInput] = useState('')
  const recallInputRef = useRef('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [recallResult, setRecallResult] = useState<RecallResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set())
  const [showEmptyError, setShowEmptyError] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [interimResult, setInterimResult] = useState('')
  const [micError, setMicError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const isRecordingRef = useRef(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const [audioBase64, setAudioBase64] = useState<string | null>(null)
  const [audioMimeType, setAudioMimeType] = useState<string | null>(null)
  const [volume, setVolume] = useState(0)
  const visualizerCleanupRef = useRef<(() => void) | null>(null)

  const currentEncounter = getCurrentEncounter() || getLatestEncounter()

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('gabai-voice-consent') === 'true') {
        setConsentGiven(true)
      }
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'fil'

        recognitionRef.current.onstart = () => setMicError(null)

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ''
          let interimTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' '
            } else {
              interimTranscript += event.results[i][0].transcript
            }
          }
          if (finalTranscript) {
            setRecallInput((prev) => {
              const next = prev + finalTranscript
              recallInputRef.current = next
              return next
            })
          }
          setInterimResult(interimTranscript)
        }

        recognitionRef.current.onerror = (event: any) => {
          if (event.error === 'no-speech') return
          if (event.error === 'not-allowed') {
            setMicError('Hindi pinayagan ang mikropono. I-allow sa browser settings.')
          }
        }

        recognitionRef.current.onend = () => {
          if (isRecordingRef.current) {
            try { recognitionRef.current.start() } catch (e) { }
          } else {
            setIsRecording(false)
            setInterimResult('')
          }
        }
      } else {
        setMicError('Hindi sinusuportahan ng iyong browser. Gamitin ang Chrome.')
      }
    }
  }, [])

  async function submitDirectly(b64: string | null, mime: string | null, text: string) {
    if (!text.trim() && !b64) {
      setShowEmptyError(true)
      setTimeout(() => setShowEmptyError(false), 3000)
      return
    }
    if (isProcessing) return
    setIsProcessing(true)
    setError(null)
    setRecallResult(null)

    try {
      const response = await fetch('/api/gemini/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recallInput: text,
          audioBase64: b64,
          mimeType: mime,
          script: currentEncounter?.script ?? '',
          language: user?.language ?? 'taglish',
          history: getAllEncounters().filter(e => e.id !== currentEncounter?.id).slice(-3)
        }),
      })

      if (!response.ok) throw new Error('Recall processing failed')

      const data = await response.json()
      const result: RecallResult = {
        instructions: data.instructions,
        flagged: data.flagged,
        rawInput: text,
        processedAt: new Date().toISOString(),
      }

      setRecallResult(result)

      if (currentEncounter) {
        updateEncounter(currentEncounter.id, {
          toRemember: data.instructions.map((i: RecallInstruction) => i.instruction),
          encounterLog: [
            ...currentEncounter.encounterLog,
            { speaker: 'Patient', text: text },
          ],
        })
      }
    } catch (err) {
      console.error(err)
      setError('Hindi namin naisulat ang iyong input. Paki-try ulit.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMicClick = () => {
    if (isRecording) {
      isRecordingRef.current = false
      setIsRecording(false)

      if (visualizerCleanupRef.current) {
        visualizerCleanupRef.current()
        visualizerCleanupRef.current = null
      }
      setVolume(0)

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      try {
        recognitionRef.current?.stop()
      } catch (e) { }
    } else {
      if (!consentGiven) {
        setShowConsentModal(true)
      } else {
        startRecording()
      }
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      visualizerCleanupRef.current = createAudioVisualizer(stream, setVolume)

      const mimeType = getSupportedMimeType()
      const mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType || undefined })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        try {
          const base64 = await blobToBase64(audioBlob)
          setAudioBase64(base64)
          setAudioMimeType(mimeType || 'audio/webm')
          
          await submitDirectly(base64, mimeType || 'audio/webm', recallInputRef.current)
        } catch (e) {
          console.error("Failed to process audio:", e)
        }
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      isRecordingRef.current = true
      setMicError(null)

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (err) {}
      }
    } catch (err: any) {
      console.error(err)
      if (err.name === 'NotAllowedError') {
        setMicError('I-allow ang microphone access sa browser settings.')
      } else {
        setMicError('Hindi ma-access ang microphone.')
      }
      setIsRecording(false)
      isRecordingRef.current = false
    }
  }

  const acceptConsent = () => {
    setConsentGiven(true)
    localStorage.setItem('gabai-voice-consent', 'true')
    setShowConsentModal(false)
    startRecording()
  }

  const toggleExpand = (i: number) => {
    const next = new Set(expandedIndices)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    setExpandedIndices(next)
  }

  const getBadgeColor = (category: string) => {
    const cat = category.toLowerCase()
    if (cat === 'gamot') return 'var(--success)'
    if (cat === 'bawal' || cat === 'aktibidad') return 'var(--danger)'
    if (cat === 'follow-up') return 'var(--primary)'
    return 'var(--text-muted)'
  }

  const handleRestart = () => {
    setRecallResult(null)
    setRecallInput('')
    recallInputRef.current = ''
    setAudioBase64(null)
    setInterimResult('')
  }

  if (!mounted) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      
      {/* 1. Legal Notice (Image 2 aesthetics) */}
      {/* 1. Legal Notice */}
      <div style={{ width: '100%', maxWidth: '700px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
         <div style={{ flexShrink: 0, color: '#510400' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
         </div>
         <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#510400' }}>Data Privacy Act of 2012 (RA 10173)</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B4F3A', lineHeight: 1.6 }}>Para sa iyong privacy, huwag i-record ang doktor nang walang consent. Gamitin ang mikropono para <b>i-record ang sarili mong boses</b>.</p>
         </div>
      </div>

      {micError && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '12px', fontSize: '13px', color: 'var(--danger)', display: 'flex', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '700px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {micError}
        </div>
      )}

      {/* 2. Recording Mode (Hidden when results exist) */}
      {!recallResult && (
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0 40px', minHeight: '300px', width: '100%' }}>
            {/* The Big Red Button */}
            <button
               onClick={handleMicClick}
               disabled={isProcessing}
               style={{
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: isRecording ? 'var(--danger)' : '#fff',
                  border: isRecording ? 'none' : '2px solid var(--danger)',
                  color: isRecording ? '#fff' : 'var(--danger)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: isRecording ? '0 12px 40px rgba(239, 68, 68, 0.4)' : '0 8px 30px rgba(239, 68, 68, 0.08)',
                  cursor: isProcessing ? 'default' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isRecording ? 'scale(1.05)' : 'scale(1)',
                  animation: isRecording ? 'bpulse 2s infinite' : 'none',
                  opacity: isProcessing ? 0.5 : 1
               }}
            >
               <svg width="48" height="48" viewBox="0 0 24 24" fill={isRecording ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
               </svg>
            </button>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes bpulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 30px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
            ` }} />

            <h3 style={{ marginTop: '40px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
               {isProcessing ? 'Sinisuri ang narinig...' : isRecording ? 'I-click ulit upang itigil...' : 'Gamitin ang Boses'}
            </h3>
            
            {/* Visualizer when recording */}
            {isRecording && (
               <div style={{ display: 'flex', gap: '6px', height: '40px', alignItems: 'center', marginTop: '16px' }}>
                 {[...Array(9)].map((_, i) => {
                   const maxMultiplier = [0.4, 0.6, 0.8, 1, 1.2, 1, 0.8, 0.6, 0.4][i];
                   const height = Math.max(4, volume * maxMultiplier);
                   return <div key={i} style={{ width: '8px', height: `${height}px`, background: 'var(--danger)', borderRadius: '10px', transition: 'height 0.1s ease-out' }} />
                 })}
               </div>
            )}

            <p style={{ marginTop: '12px', fontSize: '0.9375rem', color: isRecording ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center', maxWidth: '480px', fontStyle: isRecording ? 'italic' : 'normal' }}>
               {isProcessing ? 'Mangyaring maghintay habang pino-process ng GabAi ang iyong audio.' : isRecording ? (interimResult || recallInput || 'Maaari ka nang magsalita...') : 'Pindutin para simulan ang pag-record ng mga tagubilin ng doktor.'}
            </p>

            {/* In processing state */}
            {isProcessing && (
              <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '600px' }}>
                <div className="skeleton" style={{ height: '60px', width: '100%', borderRadius: 'var(--radius-md)' }} />
                <div className="skeleton" style={{ height: '60px', width: '100%', borderRadius: 'var(--radius-md)' }} />
              </div>
            )}
            
            {/* Error handling manually triggering resubmit if needed */}
            {error && (
              <div style={{ marginTop: '24px', color: 'var(--danger)', fontSize: '14px' }}>
                {error} <button onClick={() => submitDirectly(audioBase64, audioMimeType, recallInputRef.current)} style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>Gawin ulit</button>
              </div>
            )}
         </div>
      )}

      {/* 3. Result UI */}
      {recallResult && (
        <div style={{
          width: '100%',
          maxWidth: '800px',
          animation: 'fadeUp 0.3s ease-out forwards',
          opacity: 0,
          transform: 'translateY(8px)'
        }}>
          <style>{`@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }`}</style>
          
          <div>
            <div style={{ padding: 0 }}>
              <div style={{ padding: '0 0 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(139,90,60,0.2)' }}>
                <h3 className="text-h3" style={{ margin: 0, color: '#510400' }}>Mga Tagubilin ng Doktor Mo</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="text-xs text-muted">Na-process: {new Date(recallResult.processedAt).toLocaleTimeString()}</span>
                  <button onClick={handleRestart} className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)', borderRadius: '20px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                     Restart / Record Again
                  </button>
                </div>
              </div>
              <div className="divider" style={{ margin: 0 }} />

              <div>
                {recallResult.instructions.map((inst, idx) => (
                  <div key={idx} style={{ padding: '20px 24px', borderBottom: idx === recallResult.instructions.length - 1 ? 'none' : '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge" style={{ background: getBadgeColor(inst.category), color: '#fff', fontSize: '10px' }}>{inst.category}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: inst.confidence === 'clear' ? 'var(--success)' : inst.confidence === 'reconstructed' ? 'var(--warning)' : 'var(--danger)' }} />
                        <span className="text-xs" style={{ fontWeight: 600 }}>
                          {inst.confidence === 'clear' ? 'Malinaw' : inst.confidence === 'reconstructed' ? 'Inayos ng AI' : 'Hindi sigurado'}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: 500, marginTop: '12px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{inst.instruction}</p>

                    {(inst.confidence === 'reconstructed' || inst.confidence === 'unclear') && (
                      <div style={{ marginTop: '12px' }}>
                        <button className="btn btn-ghost btn-sm" style={{ padding: 0, height: 'auto', gap: '4px' }} onClick={() => toggleExpand(idx)}>
                          <span style={{ fontSize: '12px' }}>Ano ito?</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: expandedIndices.has(idx) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                        {expandedIndices.has(idx) && (
                          <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-muted)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                            Ibig sabihin: {inst.instruction}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {recallResult.flagged.length > 0 && (
            <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid var(--danger)', background: '#fff5f5' }}>
              <div className="card-body">
                <h4 style={{ color: 'var(--danger)', fontWeight: 700, margin: '0 0 12px 0', fontSize: '14px' }}>⚠️ I-double check ito</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recallResult.flagged.map((f, idx) => (
                    <li key={idx} className="text-sm" style={{ fontWeight: 500 }}>{f}</li>
                  ))}
                </ul>
                <p style={{ marginTop: '16px', fontSize: '12px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  I-verify ang mga ito sa iyong mga dokumento o tanungin ang doktor sa susunod na bisita.
                </p>
              </div>
            </div>
          )}

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', gap: '12px', paddingBottom: '40px' }}>
            <button 
              onClick={() => { setRecallResult(null); setRecallInput(recallResult.rawInput) }}
              style={{ padding: '12px 24px', background: 'transparent', color: '#510400', fontSize: '0.875rem', fontWeight: 700, borderRadius: '30px', border: '1px solid rgba(81,4,0,0.3)', cursor: 'pointer' }}
            >
              Baguhin ang input
            </button>
            <button 
              onClick={() => alert('Nai-save! Makikita mo ito sa Alaala Ko.')}
              style={{ padding: '12px 24px', background: '#510400', color: '#fff', fontSize: '0.875rem', fontWeight: 700, borderRadius: '30px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(81,4,0,0.2)' }}
            >
              Ito na, tama na →
            </button>
          </div>
        </div>
      )}

      {showConsentModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', animation: 'fadeUp 0.2s ease-out forwards' }}>
            <div className="card-body">
              <h3 className="text-h3" style={{ marginBottom: '12px', color: 'var(--danger)' }}>⚠️ Paalala (RA 4200)</h3>
              <p className="text-sm" style={{ marginBottom: '16px', lineHeight: 1.6 }}>
                Ang voice input na ito ay para sa iyong sariling mga salita lamang — hindi para i-record ang iyong doktor.
                <br /><br />
                Ang pagrerecord ng ibang tao nang walang pahintulot ay labag sa batas ng Pilipinas (Anti-Wiretapping Law).
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowConsentModal(false)}>Bumalik</button>
                <button className="btn btn-primary" onClick={acceptConsent} style={{ background: 'var(--danger)', border: 'none' }}>Naiintindihan ko</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DocumentScannerSection() {
  const { getCurrentEncounter, getLatestEncounter, updateEncounter } = useGabAiStore()
  const enc = getCurrentEncounter() || getLatestEncounter()
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const SCAN_RESULT = 'Ito ay isang halimbawa ng Lab Result Analysis. Ipinapakita nito na ang iyong Blood Sugar ay nasa normal na range (95 mg/dL), ngunit ang iyong Cholesterol ay medyo mataas (210 mg/dL). Siguraduhing itanong sa doktor kung kailangan mo ng diet adjustment.'

  const processFile = (file: File | undefined) => {
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setScanned(true)
      if (enc) {
        updateEncounter(enc.id, {
          documentScans: [...(enc.documentScans || []), { explanation: SCAN_RESULT, scannedAt: new Date().toISOString() }],
        })
      }
    }, 1500)
  }

  const handleReadResult = () => {
    if (typeof window === 'undefined') return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utt = new SpeechSynthesisUtterance(SCAN_RESULT)
    utt.lang = 'fil-PH'
    utt.onend = () => setSpeaking(false)
    utt.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utt)
  }

  return (
    <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => processFile(e.target.files?.[0])} />
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => processFile(e.target.files?.[0])} />

        {!scanned && !scanning ? (
          <div style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', textAlign: 'center', 
            minHeight: '400px', justifyContent: 'center'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(139,90,60,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '20px' }}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.25rem', fontWeight: 800, color: '#510400' }}>I-scan ang Dokumento</h3>
            <p style={{ margin: '0 0 32px', fontSize: '0.9375rem', color: '#6B4F3A', lineHeight: 1.6, maxWidth: '320px' }}>
              I-scan ang lab reports o results.<br/>Tutulungan ka ni GabAi sa pag-intindi<br/>ng iba pang dokumento.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '320px' }}>
              <button 
                style={{ width: '100%', padding: '16px', background: '#510400', color: '#fff', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.05em', borderRadius: '30px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(81,4,0,0.2)' }} 
                onClick={() => cameraInputRef.current?.click()}
              >
                KUNAN NG LITRATO
              </button>
              <button 
                style={{ width: '100%', padding: '16px', background: 'transparent', color: '#510400', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.05em', borderRadius: '30px', border: '1px solid rgba(81,4,0,0.3)', cursor: 'pointer' }} 
                onClick={() => fileInputRef.current?.click()}
              >
                MAG-UPLOAD NG LARAWAN
              </button>
            </div>
          </div>
        ) : scanning ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' }}>
            <div className="section-eyebrow">Sinusuri ng AI...</div>
            {[90, 70, 80].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%` }} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            {previewUrl && <img src={previewUrl} alt="Na-scan" style={{ maxHeight: '200px', width: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px' }} />}
            <span className="badge badge-success" style={{ marginBottom: '12px', display: 'inline-block' }}>Dokumento Nakilala</span>
            <p className="text-sm" style={{ lineHeight: 1.8, marginBottom: '20px' }}>{SCAN_RESULT}</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={handleReadResult}>
                {speaking ? 'Binabasa...' : 'Basahin para sa akin'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setScanned(false); setPreviewUrl(null) }}>I-scan Uli</button>
            </div>
          </div>
        )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type DuringTab = 'karapatan' | 'narinig' | 'lab'

const TABS: { id: DuringTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'karapatan',
    label: 'Karapatan Mo',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'narinig',
    label: 'Ano ang Narinig Mo',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    id: 'lab',
    label: 'I-scan ang Lab Report',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0h10m-10 0a2 2 0 0 1-2 2H3m16-2a2 2 0 0 0 2-2V3" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
]

export default function DuringPage() {
  const [activeTab, setActiveTab] = useState<DuringTab>('karapatan')

  const tabContent: Record<DuringTab, { tag: string; title: string; subtitle: string; content: React.ReactNode }> = {
    karapatan: {
      tag: 'Patient Rights',
      title: 'Karapatan Mo',
      subtitle: 'Ayon sa iyong sitwasyon at pasilidad na pupuntahan, ito ang mga karapatan mo bilang pasyente — at ang batas na nagbibigay sa iyo ng karapatang ito.',
      content: <PatientRightsSection />,
    },
    narinig: {
      tag: 'Recall Assistant',
      title: 'Ano ang Narinig Mo?',
      subtitle: 'Isulat ang iyong narinig mula sa doktor — kahit hindi kumpleto, mali ang spelling, o Taglish. Itatama at ipapaliwanag ng GabAi para sa iyo.',
      content: <RecallAssistantSection />,
    },
    lab: {
      tag: 'Lab & Documents',
      title: 'I-scan ang Lab Report',
      subtitle: 'I-scan ang lab results o prescriptions. Ipapaliwanag ng GabAi ang mga medical terms sa simpleng salita.',
      content: <DocumentScannerSection />,
    },
  }

  const current = tabContent[activeTab]

  return (
    <div style={{ height: 'calc(100vh - 168px - 40px)', marginTop: '40px', display: 'flex', gap: '24px', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* ── Left Column: Step/Icon (Simulating Image 1 Before layout) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '44px', paddingTop: '2px' }}>
        <div style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '2px solid var(--primary)', fontWeight: 800 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
      </div>

      {/* ── Right Column: Main Content ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* ── Header (Simulating Image 1 typography) ── */}
        <div style={{ flexShrink: 0, marginBottom: '24px' }}>
          <span style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '.7rem', textTransform: 'uppercase', 
            letterSpacing: '.12em', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', 
            padding: '5px 14px', borderRadius: '20px', width: 'fit-content', marginBottom: '10px' 
          }}>
            Patient Navigation
          </span>
          <h1 style={{ 
            fontFamily: "'Inter', -apple-system, sans-serif", fontSize: '2.5rem', fontWeight: 800, 
            color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.1, letterSpacing: '-.03em' 
          }}>
            During Phase
          </h1>
          <p style={{ 
            fontSize: '.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '560px' 
          }}>
            Manage your care, protect your rights, and digitize important files.
          </p>
        </div>

        {/* ── Pill Tabs ── */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexShrink: 0, overflowX: 'auto', paddingBottom: '4px' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '40px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? '#fff' : 'transparent',
                  border: isActive ? '1.5px solid var(--border)' : '1.5px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 2px 8px rgba(61,27,17,0.04)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.6, color: isActive ? 'var(--primary)' : 'inherit' }}>{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Big Card Frame ── */}
        <div style={{
          flex: 1,
          minHeight: 0, 
          background: '#fff',
          borderRadius: '24px',
          border: '1px solid var(--border-light)',
          boxShadow: '0 8px 30px rgba(61,27,17,0.03)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Scrollable interior */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              
              {/* Tab Content (Direct injection inside the white card) */}
              <div key={activeTab} style={{ animation: 'duringFadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                {current.content}
              </div>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes duringFadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      ` }} />
    </div>
  )
}


