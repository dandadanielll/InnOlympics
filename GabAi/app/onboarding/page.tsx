'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGabAiStore, getOrCreateUserId } from '@/lib/store'

export default function OnboardingPage() {
  const router = useRouter()
  const { setUser } = useGabAiStore()
  const [step, setStep] = useState(1)
  const [city, setCity] = useState('')
  const [philHealth, setPhilHealth] = useState<'yes' | 'no' | 'not-sure' | ''>('')

  const CITIES = ['Caloocan', 'Las Piñas', 'Makati', 'Manila', 'Quezon City', 'Taguig']

  const handleFinish = () => {
    const id = getOrCreateUserId()
    setUser({
      id,
      city,
      philHealth: philHealth as 'yes' | 'no' | 'not-sure',
      language: 'taglish',
      onboardingComplete: true,
    })
    router.push('/navigator/before')
  }

  return (
    <div style={{ maxWidth: '600px', margin: '64px auto' }}>
      <div className="section-eyebrow" style={{ textAlign: 'center', marginBottom: '8px' }}>Step {step} of 2</div>
      <h1 className="text-h1" style={{ textAlign: 'center', marginBottom: '32px' }}>
        {step === 1 ? 'Where are you located?' : 'PhilHealth Coverage'}
      </h1>

      <div className="card" style={{ padding: '32px' }}>
        <div className="card-body" style={{ padding: 0 }}>

          {step === 1 && (
            <div>
              <p className="text-sm text-secondary" style={{ marginBottom: '24px' }}>
                GabAi will find the right facility for you within Metro Manila's healthcare system.
              </p>
              <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">— Select City —</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm text-secondary" style={{ marginBottom: '24px' }}>
                This determines which free benefits you qualify for.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { id: 'yes' as const, label: 'Yes, I am a member' },
                  { id: 'no' as const, label: 'No, I do not have coverage' },
                  { id: 'not-sure' as const, label: 'I am not sure' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      border: `2px solid ${philHealth === opt.id ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      value={opt.id}
                      checked={philHealth === opt.id}
                      onChange={() => setPhilHealth(opt.id)}
                      style={{ display: 'none' }}
                    />
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--primary)', background: philHealth === opt.id ? 'var(--primary)' : 'transparent' }} />
                    <span className="text-sm" style={{ fontWeight: 600 }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            {step > 1 && (
              <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>
            )}
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={(step === 1 && !city) || (step === 2 && !philHealth)}
              onClick={() => step === 1 ? setStep(2) : handleFinish()}
            >
              {step === 1 ? 'Continue' : 'Start Using GabAi'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
