'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [city, setCity] = useState('')
  const [philHealth, setPhilHealth] = useState<'yes' | 'no' | 'unsure' | ''>('')
  
  const CITIES = ['Caloocan', 'Las Piñas', 'Makati', 'Manila', 'Quezon City', 'Taguig']

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
                  { id: 'yes', label: 'Yes, I am a member' },
                  { id: 'no', label: 'No, I do not have coverage' },
                  { id: 'unsure', label: 'I am not sure' }
                ].map((opt) => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: `2px solid ${philHealth === opt.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                    <input type="radio" value={opt.id} checked={philHealth === opt.id} onChange={(e) => setPhilHealth(e.target.value as any)} style={{ display: 'none' }} />
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--primary)', background: philHealth === opt.id ? 'var(--primary)' : 'transparent' }} />
                    <span className="text-sm font-semibold">{opt.label}</span>
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
              onClick={() => step === 1 ? setStep(2) : router.push('/navigator/before')}
            >
              {step === 1 ? 'Continue' : 'Start Using GabAi'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
