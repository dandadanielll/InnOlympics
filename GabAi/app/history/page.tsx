'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGabAiStore, type Encounter, type UserProfile } from '@/lib/store'

export default function AlaalaKoPage() {
  const router = useRouter()
  const { user, setUser, getAllEncounters } = useGabAiStore()
  const [mounted, setMounted] = useState(false)
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [search, setSearch] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})

  useEffect(() => {
    setMounted(true)
    const all = getAllEncounters()
    const sorted = [...all].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setEncounters(sorted)
    
    if (user) {
      setEditForm(user)
    }
  }, [getAllEncounters, user])

  if (!mounted) return null

  const filtered = search.trim()
    ? encounters.filter(
        (e) =>
          e.symptoms.toLowerCase().includes(search.toLowerCase()) ||
          (e.carePlan?.recommendedFacility ?? '').toLowerCase().includes(search.toLowerCase()) ||
          e.toRemember.some(item => item.toLowerCase().includes(search.toLowerCase()))
      )
    : encounters

  const statusLabel = (e: Encounter) => {
    if (e.phase === 'complete') return e.followUpStatus === 'improving' ? 'Gumagaling' : e.followUpStatus === 'flagged' ? 'Kailangan ng Atensyon' : 'Kumpleto'
    if (e.phase === 'after') return 'Pauwi Na'
    if (e.phase === 'during') return 'Nasa Pasilidad'
    return 'Bago Bumisita'
  }

  const statusColor = (e: Encounter) => {
    if (e.followUpStatus === 'improving') return 'badge-success'
    if (e.followUpStatus === 'flagged') return 'badge-danger'
    if (e.phase !== 'complete') return 'badge-warning'
    return 'badge-neutral'
  }

  const handleSaveProfile = () => {
    if (user) {
      setUser({ ...user, ...editForm } as UserProfile)
    } else {
      setUser({ 
        id: 'new-user', 
        city: editForm.city || '', 
        language: editForm.language || 'taglish', 
        philHealth: editForm.philHealth || 'not-sure', 
        onboardingComplete: true 
      } as UserProfile)
    }
    setIsEditingProfile(false)
  }

  const activeEncounters = encounters.filter(e => e.phase !== 'complete' || e.followUpStatus === 'flagged')
  const pastEncounters = encounters.filter(e => e.phase === 'complete' && e.followUpStatus !== 'flagged')

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: '8px' }}>User Dashboard</div>
          <h1 className="text-h1">Alaala Ko</h1>
          <p className="text-secondary" style={{ marginTop: '8px' }}>Ang iyong personal na health history at profile sa GabAi.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* Profile Card */}
        <div className="card" style={{ borderTop: '4px solid var(--primary)', background: 'var(--bg-base)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
              </svg>
              Aking Profile
            </div>
            {!isEditingProfile && (
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setIsEditingProfile(true)}>
                I-edit
              </button>
            )}
          </div>
          <div className="card-body">
            {isEditingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="text-xs font-semibold" style={{ display: 'block', marginBottom: '4px' }}>Lungsod</label>
                  <input type="text" className="input" value={editForm.city || ''} onChange={e => setEditForm({...editForm, city: e.target.value})} placeholder="Hal. Quezon City" />
                </div>
                <div>
                  <label className="text-xs font-semibold" style={{ display: 'block', marginBottom: '4px' }}>PhilHealth Status</label>
                  <select className="input" value={editForm.philHealth || 'not-sure'} onChange={e => setEditForm({...editForm, philHealth: e.target.value as any})}>
                    <option value="yes">May PhilHealth</option>
                    <option value="no">Walang PhilHealth</option>
                    <option value="not-sure">Hindi Sigurado</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold" style={{ display: 'block', marginBottom: '4px' }}>Pangunahing Wika</label>
                  <select className="input" value={editForm.language || 'taglish'} onChange={e => setEditForm({...editForm, language: e.target.value as any})}>
                    <option value="taglish">Taglish</option>
                    <option value="filipino">Filipino</option>
                    <option value="english">English</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveProfile}>I-save</button>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setIsEditingProfile(false); setEditForm(user || {}) }}>I-cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {user ? (
                  <>
                    <div>
                      <div className="text-xs text-muted">Lungsod</div>
                      <div className="text-sm font-semibold">{user.city || 'Hindi pa nakalagay'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">PhilHealth Status</div>
                      <div className="text-sm font-semibold">
                        {user.philHealth === 'yes' ? 'Aktibo' : user.philHealth === 'no' ? 'Wala' : 'Hindi Sigurado'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Pangunahing Wika</div>
                      <div className="text-sm font-semibold" style={{ textTransform: 'capitalize' }}>{user.language}</div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <p className="text-sm text-secondary" style={{ marginBottom: '16px' }}>Hindi pa kumpleto ang iyong profile.</p>
                    <button className="btn btn-primary" onClick={() => router.push('/onboarding')}>Pumunta sa Setup</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header"><div className="card-title">GabAi Stats Mo</div></div>
          <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{encounters.length}</div>
                <div className="text-xs text-muted" style={{ marginTop: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Kabuuang Bisita</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>{activeEncounters.length}</div>
                <div className="text-xs text-muted" style={{ marginTop: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Aktibong Isyu</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-h2" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Kasaysayan ng mga Bisita
      </h2>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '40px' }}
                placeholder="Hanapin ang sintomas, pasilidad, o reseta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary" style={{ padding: '12px 24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
              Voice Search
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ background: 'var(--bg-muted)', border: '1px dashed var(--border)' }}>
          <div className="card-body" style={{ textAlign: 'center', padding: '64px 24px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            <h3 className="text-h3" style={{ marginBottom: '8px' }}>Walang Nahanap na Alaala</h3>
            <p className="text-sm text-secondary">
              {encounters.length === 0
                ? 'Wala pang naka-save na health encounter. Ang iyong mga bisita sa doktor ay awtomatikong mase-save dito.'
                : 'Walang nahanap na tugma para sa iyong paghahanap.'}
            </p>
            {encounters.length === 0 && (
              <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => router.push('/navigator/before')}>
                Magsimula ng Bagong Encounter
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Encounters first, if any */}
          {activeEncounters.length > 0 && !search && (
             <div className="text-xs font-semibold text-muted" style={{ textTransform: 'uppercase', marginTop: '8px', letterSpacing: '0.05em' }}>Kasalukuyang Inaaksyunan</div>
          )}
          
          {filtered.map((e) => (
            <div key={e.id} className="card" style={{ borderLeft: e.phase !== 'complete' || e.followUpStatus === 'flagged' ? '4px solid var(--warning)' : 'none' }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div className="text-xs text-muted" style={{ marginBottom: '4px', fontWeight: 600 }}>
                      {new Date(e.createdAt).toLocaleDateString('fil-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-h3" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {e.symptoms || 'Walang nai-record na sintomas'}
                    </div>
                  </div>
                  <span className={`badge ${statusColor(e)}`}>{statusLabel(e)}</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'var(--bg-muted)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div className="text-xs text-muted" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      Pasilidad
                    </div>
                    <div className="text-sm" style={{ fontWeight: 600 }}>
                      {e.carePlan?.recommendedFacility ?? 'Hindi pa natukoy'}
                    </div>
                  </div>
                  
                  {e.toRemember && e.toRemember.length > 0 && (
                    <div>
                      <div className="text-xs text-muted" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5 19 12a4.95 4.95 0 1 0-7-7L3.5 13.5a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>
                        Mahiwagang Bilin (To Remember)
                      </div>
                      <div className="text-sm" style={{ fontWeight: 600 }}>
                        {e.toRemember.length} items na naitala
                      </div>
                    </div>
                  )}

                  {e.referralTriggered && (
                    <div>
                      <div className="text-xs text-muted" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 9 8 12 2 12"></polyline></svg>
                        Aksyon
                      </div>
                      <div className="text-sm" style={{ fontWeight: 600, color: 'var(--warning)' }}>
                        Nangangailangan ng Referral
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8125rem', padding: '6px 16px' }} onClick={() => {
                     // In a real app, this would route to a detailed view of the specific encounter.
                     // For demo purposes, we can navigate them back to the active phase if it's not complete.
                     if (e.phase !== 'complete') {
                       router.push(`/navigator/${e.phase}`)
                     } else {
                       alert('Ang buong detalye ng encounter na ito ay ilalabas sa susunod na update ng GabAi.')
                     }
                  }}>
                    {e.phase !== 'complete' ? 'Ipagpatuloy ang Bisita \u2192' : 'Tingnan ang Detalye \u2192'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
