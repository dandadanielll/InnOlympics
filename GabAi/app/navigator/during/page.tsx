'use client'

import { useState, useEffect, useRef } from 'react'
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
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function PatientRightsSection() {
  const { user, getLatestEncounter, updateEncounter, getAllEncounters } = useGabAiStore()
  const rawEncounter = getLatestEncounter()
  const encounter = rawEncounter?.phase === 'complete' || rawEncounter?.phase === 'after' ? null : rawEncounter

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
        const res = await fetch('/api/gemini/rights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symptoms: encounter.symptoms,
            facilityLevel: encounter.carePlan?.facilityLevel || '',
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
    <div className="card" style={{ borderTop: '4px solid var(--warning)', opacity: (!encounter || !encounter.symptoms) ? 0.6 : 1 }}>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {(!encounter || !encounter.symptoms) ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p className="text-sm text-secondary">Kinakailangan ang <b>Phase 1 (Intake)</b> para makita ang mga karapatang ito.</p>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '12px', color: 'var(--warning)' }}
              onClick={() => window.location.href = '/navigator/before'}
            >
              ← Bumalik sa Phase 1
            </button>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton" style={{ height: '50px', width: '100%', borderRadius: 'var(--radius-sm)' }} />
            <div className="skeleton" style={{ height: '50px', width: '100%', borderRadius: 'var(--radius-sm)' }} />
          </div>
        ) : rights.length > 0 ? (
          rights.map((r, i) => (
            <div key={i} style={{ padding: '16px 0 16px 16px', borderLeft: '4px solid var(--warning)', marginBottom: i < rights.length - 1 ? '16px' : 0, background: 'var(--warning-bg)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{r.right}</div>
              <div className="text-sm text-secondary">{r.how}</div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  )
}

function RecallAssistantSection() {
  const { user, getLatestEncounter, updateEncounter, getAllEncounters } = useGabAiStore()
  const [recallInput, setRecallInput] = useState('')
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

  const rawEncounter = getLatestEncounter()
  const currentEncounter = rawEncounter?.phase === 'complete' || rawEncounter?.phase === 'after' ? null : rawEncounter

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      // Restore consent from localStorage so user doesn't have to re-accept on every reload
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
            setRecallInput((prev) => prev + finalTranscript)
          }
          setInterimResult(interimTranscript)
        }

        recognitionRef.current.onerror = (event: any) => {
          if (event.error === 'no-speech') return
          // Do not kill the global isRecording state here, as MediaRecorder might still be working!
          if (event.error === 'not-allowed') {
            setMicError('Hindi pinayagan ang mikropono. I-allow sa browser settings.')
          } else if (event.error === 'network') {
            // SpeechRecognition needs internet, but MediaRecorder doesn't.
          }
        }

        recognitionRef.current.onend = () => {
          if (isRecordingRef.current) {
            try {
              recognitionRef.current.start()
            } catch (e) { }
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

  const handleMicClick = () => {
    if (isRecording) {
      isRecordingRef.current = false
      setIsRecording(false)

      // Stop Visualizer
      if (visualizerCleanupRef.current) {
        visualizerCleanupRef.current()
        visualizerCleanupRef.current = null
      }
      setVolume(0)

      // Stop MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      // Stop SpeechRecognition
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
      // 1. Capture audio stream for MediaRecorder
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Initialize Visualizer
      visualizerCleanupRef.current = createAudioVisualizer(stream, setVolume)

      const mimeType = getSupportedMimeType()
      const mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType || undefined })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        try {
          const base64 = await blobToBase64(audioBlob)
          setAudioBase64(base64)
          setAudioMimeType(mimeType || 'audio/webm')
        } catch (e) {
          console.error("Failed to process audio:", e)
        }
      }

      mediaRecorder.start(100) // Capture chunks every 100ms
      setIsRecording(true)
      isRecordingRef.current = true
      setMicError(null)

      // 2. Start SpeechRecognition (for UI visualization only)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (err) {
          console.error("SpeechRecognition error:", err)
        }
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

  async function handleRecallSubmit() {
    if (!recallInput.trim() && !audioBase64) {
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
          recallInput,
          audioBase64,
          mimeType: audioMimeType,
          script: currentEncounter?.script ?? '',
          language: user?.language ?? 'taglish',
          history: getAllEncounters().filter(e => e.id !== currentEncounter?.id).slice(-3) // context
        }),
      })

      if (!response.ok) throw new Error('Recall processing failed')

      const data = await response.json()
      const result: RecallResult = {
        instructions: data.instructions,
        flagged: data.flagged,
        rawInput: recallInput,
        processedAt: new Date().toISOString(),
      }

      setRecallResult(result)

      if (currentEncounter) {
        updateEncounter(currentEncounter.id, {
          toRemember: data.instructions.map((i: RecallInstruction) => i.instruction),
          encounterLog: [
            ...currentEncounter.encounterLog,
            { speaker: 'Patient', text: recallInput },
          ],
        })
      }
    } catch (err) {
      console.error(err)
      setError('Hindi namin naisulat ang iyong input. Subukan ulit o i-type ng manu-mano.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getBadgeColor = (category: string) => {
    const cat = category.toLowerCase()
    if (cat === 'gamot') return 'var(--success)'
    if (cat === 'bawal' || cat === 'aktibidad') return 'var(--danger)'
    if (cat === 'follow-up') return 'var(--primary)'
    return 'var(--text-muted)'
  }

  if (!mounted) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <LegalNotice
          text="Para sa iyong privacy at ayon sa RA 4200, huwag i-record ang konsultasyon nang walang pahintulot. Gamitin ang Voice Input para i-record ang iyong sariling salita lamang."
          variant="info"
        />
      </div>

      <div className="card" style={{ marginTop: '24px', maxWidth: '700px', border: showEmptyError ? '1px solid var(--danger)' : '1px solid var(--border)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {currentEncounter?.script && (
              <span className="badge badge-success" style={{ padding: '4px 10px', fontSize: '11px' }}>
                May script mula sa Before Phase
              </span>
            )}
            {getAllEncounters().length > 1 && (
              <span className="badge badge-warning" style={{ padding: '4px 10px', fontSize: '11px' }}>
                Follow-up: May Alaala mula sa mga nakaraang visit
              </span>
            )}
            <span className="badge" style={{ padding: '4px 10px', fontSize: '11px', background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
              Text at Sariling Voice Input lamang
            </span>
          </div>

          {micError && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '12px', fontSize: '13px', color: 'var(--danger)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {micError}
            </div>
          )}

          {isRecording && (
            <div style={{
              marginTop: '16px',
              marginBottom: '16px',
              padding: '24px',
              background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.15) 100%)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              position: 'relative'
            }}>
              {/* Soundwave Visualizer */}
              <div style={{ display: 'flex', gap: '6px', height: '40px', alignItems: 'center' }}>
                {[...Array(9)].map((_, i) => {
                  const maxMultiplier = [0.4, 0.6, 0.8, 1, 1.2, 1, 0.8, 0.6, 0.4][i];
                  const height = Math.max(4, volume * maxMultiplier);
                  return (
                    <div key={i} style={{
                      width: '8px',
                      height: `${height}px`,
                      background: 'var(--danger)',
                      borderRadius: '10px',
                      transition: 'height 0.1s ease-out'
                    }} />
                  )
                })}
              </div>

              <span style={{
                fontSize: '20px',
                color: interimResult ? 'var(--text-primary)' : 'var(--danger)',
                fontWeight: interimResult ? 600 : 500,
                textAlign: 'center',
                fontStyle: 'italic',
                minHeight: '28px'
              }}>
                {interimResult || "Nagsasalita..."}
              </span>
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <textarea
              className="input"
              style={{
                width: '100%',
                fontSize: '16px',
                minHeight: '150px',
                padding: '16px',
                paddingBottom: '48px',
                borderColor: showEmptyError ? 'var(--danger)' : isRecording ? 'var(--primary)' : 'var(--border)',
                outline: isRecording ? '2px solid var(--primary)' : 'none',
                resize: 'vertical',
                color: isRecording ? 'var(--text-muted)' : 'var(--text-primary)'
              }}
              placeholder="Halimbawa: sabi lagyan ng amox... yung may suspension, tatlong beses daw, wag maginom ng malamig, babalik after isang linggo..."
              value={recallInput + (interimResult ? (recallInput ? ' ' : '') + interimResult : '')}
              onChange={(e) => {
                if (isRecording) return; // Prevent manual typing collisions while recording
                setRecallInput(e.target.value.slice(0, 1000))
              }}
              rows={6}
            />
            <button
              onClick={handleMicClick}
              className="btn btn-ghost btn-sm"
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                color: isRecording ? 'var(--danger)' : 'var(--text-secondary)',
                background: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-muted)',
                borderRadius: 'var(--radius-pill)',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                animation: isRecording ? 'pulse 1.5s infinite' : 'none'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isRecording ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              {isRecording ? 'Nagsasalita...' : 'Gamitin ang boses'}
            </button>
          </div>
          {showEmptyError && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>Isulat muna ang iyong narinig bago iproseso.</p>}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span className="text-xs text-muted">Kahit hindi kumpleto — gawin mo lang ang best mo.</span>
            <span className={`text-xs ${recallInput.length > 800 ? 'text-danger' : 'text-muted'}`}>
              {recallInput.length} / 1000
            </span>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '16px', background: '#008080', border: 'none', opacity: (isRecording || (!recallInput.trim() && !audioBase64)) ? 0.5 : 1 }}
            disabled={(!recallInput.trim() && !audioBase64) || isProcessing || isRecording}
            onClick={handleRecallSubmit}
          >
            {isRecording ? 'I-stop ang mic bago mag-submit' : isProcessing ? 'Sinusuri...' : 'Ipaliwanag ng GabAi →'}
          </button>
        </div>
      </div>

      {isProcessing && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton" style={{ height: '60px', width: '100%', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: '60px', width: '100%', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: '60px', width: '100%', borderRadius: 'var(--radius-md)' }} />
        </div>
      )}

      {error && (
        <div className="card" style={{ marginTop: '24px', borderLeft: '4px solid var(--danger)', background: 'var(--danger-bg)' }}>
          <div className="card-body">
            <p className="text-sm">{error}</p>
            <button className="btn btn-ghost btn-sm" onClick={handleRecallSubmit} style={{ marginTop: '8px' }}>Subukan ulit</button>
          </div>
        </div>
      )}

      {recallResult && (
        <div style={{
          marginTop: '24px',
          width: '100%',
          maxWidth: '700px',
          animation: 'fadeUp 0.3s ease-out forwards',
          opacity: 0,
          transform: 'translateY(8px)'
        }}>
          <style>{`@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }`}</style>

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="text-h3" style={{ margin: 0 }}>Mga Tagubilin ng Doktor Mo</h3>
                <span className="text-xs text-muted">Na-process: {new Date(recallResult.processedAt).toLocaleTimeString()}</span>
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

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <button className="btn btn-ghost" onClick={() => { setRecallResult(null); setRecallInput(recallResult.rawInput) }}>Baguhin ang input</button>
            <button className="btn btn-primary" onClick={() => alert('Nai-save! Makikita mo ito sa Alaala Ko.')}>Ito na, tama na →</button>
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
  const { getLatestEncounter, updateEncounter } = useGabAiStore()
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
      const rawEnc = getLatestEncounter()
      const enc = rawEnc?.phase === 'complete' || rawEnc?.phase === 'after' ? null : rawEnc
      if (enc) {
        updateEncounter(enc.id, {
          documentScans: [...enc.documentScans, { explanation: SCAN_RESULT, scannedAt: new Date().toISOString() }],
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
    <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
      <div className="card-body">
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => processFile(e.target.files?.[0])} />
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => processFile(e.target.files?.[0])} />

        {!scanned && !scanning ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-base)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <h3 className="text-h3" style={{ marginBottom: '8px' }}>I-scan ang Dokumento</h3>
            <p className="text-sm text-secondary" style={{ maxWidth: '280px', marginBottom: '24px' }}>
              I-scan ang lab reports o results. Tutulungan ka ni GabAi sa pag-intindi ng iba pang dokumento.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--success)', border: 'none' }} onClick={() => cameraInputRef.current?.click()}>
                Kunan ng litrato
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => fileInputRef.current?.click()}>
                Mag-upload ng larawan
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
          <div>
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
    </div>
  )
}

function TaposNaCard() {
  const router = useRouter()
  const { getLatestEncounter, updateEncounter } = useGabAiStore()
  const [loading, setLoading] = useState(false)

  const handleTaposNa = () => {
    setLoading(true)
    const rawEnc = getLatestEncounter()
    const enc = rawEnc?.phase === 'complete' || rawEnc?.phase === 'after' ? null : rawEnc
    if (enc) updateEncounter(enc.id, { phase: 'complete' })
    router.push('/navigator/after')
  }

  return (
    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ background: 'var(--primary)', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
        <h2 className="text-h2" style={{ color: '#fff', marginBottom: '4px' }}>I-save ang iyong encounter</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '360px' }}>At dumiretso sa After Phase.</p>
        <button
          className="btn btn-lg"
          onClick={handleTaposNa}
          disabled={loading}
          style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700, marginTop: '8px' }}
        >
          {loading ? 'Sine-save...' : 'Pumunta sa After Phase →'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DuringPage() {
  const [completedStep1, setCompletedStep1] = useState(false)
  const [completedStep2, setCompletedStep2] = useState(false)
  const [completedStep3, setCompletedStep3] = useState(false)

  const step1Ref = useRef<HTMLElement>(null)
  const step2Ref = useRef<HTMLElement>(null)
  const step3Ref = useRef<HTMLElement>(null)
  const step4Ref = useRef<HTMLElement>(null)

  return (
    <div className="bfr">
      <section className="phase-sec" ref={step1Ref}>
        <div className="phase-num-col">
          <div className="phase-circ active">1</div>
          <div className="phase-line filled" />
        </div>
        <div className="phase-main">
          <span className="phase-tag">Patient Rights</span>
          <h1 className="phase-h1">Karapatan Mo</h1>
          <p className="phase-p">Ayon sa iyong sitwasyon at pasilidad na pupuntahan, ito ang mga karapatan mo bilang pasyente:</p>
          <div className="phase-main-scrollable" style={{ paddingBottom: '100px' }}>
            <PatientRightsSection />

            <button className="phase-pri-btn" style={{ marginTop: '24px' }} onClick={() => { setCompletedStep1(true); setTimeout(() => step2Ref.current?.scrollIntoView({ behavior: 'smooth' }), 200) }}>
              Ipagpatuloy <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>

      <section className={`phase-sec ${completedStep1 ? '' : 'locked'}`} ref={step2Ref}>
        <div className="phase-num-col">
          <div className={`phase-circ ${completedStep1 ? 'active' : ''}`}>2</div>
          <div className={`phase-line ${completedStep2 ? 'filled' : ''}`} />
        </div>
        <div className="phase-main">
          <span className="phase-tag">Recall Assistant</span>
          <h1 className="phase-h1">Ano ang Narinig Mo?</h1>
          <p className="phase-p">Isulat ang iyong narinig mula sa doktor — kahit hindi kumpleto, mali ang spelling, o Taglish. Itatama at ipapaliwanag ng GabAi para sa iyo.</p>
          <div className="phase-main-scrollable" style={{ paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <RecallAssistantSection />

            <button className="phase-pri-btn" style={{ marginTop: '24px', alignSelf: 'center' }} onClick={() => { setCompletedStep2(true); setTimeout(() => step3Ref.current?.scrollIntoView({ behavior: 'smooth' }), 200) }}>
              Susunod: Lab Reports <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>

      <section className={`phase-sec ${completedStep2 ? '' : 'locked'}`} ref={step3Ref}>
        <div className="phase-num-col">
          <div className={`phase-circ ${completedStep2 ? 'active' : ''}`}>3</div>
          <div className={`phase-line ${completedStep3 ? 'filled' : ''}`} />
        </div>
        <div className="phase-main">
          <span className="phase-tag">Lab & Documents</span>
          <h1 className="phase-h1">I-scan ang Lab Report</h1>
          <p className="phase-p">I-scan ang lab reports o results. Tutulungan ka ni GabAi sa pag-intindi ng iba pang dokumento.</p>
          <div className="phase-main-scrollable" style={{ paddingBottom: '100px' }}>
            <DocumentScannerSection />

            <button className="phase-pri-btn" style={{ marginTop: '24px' }} onClick={() => { setCompletedStep3(true); setTimeout(() => step4Ref.current?.scrollIntoView({ behavior: 'smooth' }), 200) }}>
              Susunod: Tapusin <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>

      <section className={`phase-sec ${completedStep3 ? '' : 'locked'}`} ref={step4Ref}>
        <div className="phase-num-col">
          <div className={`phase-circ ${completedStep3 ? 'active' : ''}`}>4</div>
        </div>
        <div className="phase-main">
          <span className="phase-tag">Done</span>
          <h1 className="phase-h1">Tapos na?</h1>
          <p className="phase-p">Pumunta sa next phase para sa follow-ups at survey.</p>
          <div className="phase-main-scrollable">
            <TaposNaCard />
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        .bfr{margin:-48px}
        .phase-sec{height:100vh;display:flex;padding:40px 48px;gap:24px;box-sizing:border-box;transition:opacity .4s,filter .4s;overflow:hidden}
        .phase-sec.locked{opacity:.15;pointer-events:none;filter:blur(3px)}
        .phase-num-col{display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:44px;padding-top:2px}
        .phase-circ{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;border:2px solid var(--border);color:var(--text-muted);background:#fff;transition:all .35s;flex-shrink:0}
        .phase-circ.active{background:var(--text-primary);border-color:var(--text-primary);color:#fff}
        .phase-circ.done{background:var(--primary);border-color:var(--primary);color:#fff}
        .phase-line{flex:1;width:2px;background:var(--border-light);margin-top:10px;transition:background .4s}
        .phase-line.filled{background:var(--primary)}
        .phase-main{flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden}
        .phase-tag{display:inline-flex;align-items:center;gap:6px;font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;font-weight:700;color:var(--primary);background:var(--primary-light);padding:5px 14px;border-radius:20px;width:fit-content;margin-bottom:14px}
        .phase-h1{font-family:'Inter',-apple-system,sans-serif;font-size:2.5rem;font-weight:800;color:var(--text-primary);margin:0 0 10px;line-height:1.1;letter-spacing:-.03em}
        .phase-p{font-size:.9375rem;color:var(--text-secondary);line-height:1.6;margin:0 0 28px;max-width:560px}
        .phase-main-scrollable{flex:1;overflow-y:auto;padding-right:8px;padding-bottom:40px}
        .phase-pri-btn{display:inline-flex;align-items:center;gap:6px;background:var(--primary);color:#fff;border:none;border-radius:40px;padding:9px 18px;font-weight:700;font-size:.6875rem;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif}
        .phase-pri-btn:hover{background:var(--primary-hover)}.phase-pri-btn:disabled{opacity:.35;cursor:not-allowed}
      ` }} />
    </div>
  )
}

