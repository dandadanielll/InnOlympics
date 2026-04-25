'use client'

import { useState, useEffect } from 'react'
import { useGabAiStore, type Encounter } from '@/lib/store'

export default function HistoryPage() {
  const { getAllEncounters } = useGabAiStore()
  const [mounted, setMounted] = useState(false)
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    setMounted(true)
    const all = getAllEncounters()
    const sorted = [...all].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setEncounters(sorted)
  }, [getAllEncounters])

  if (!mounted) return null

  const filtered = search.trim()
    ? encounters.filter(
        (e) =>
          e.symptoms.toLowerCase().includes(search.toLowerCase()) ||
          (e.carePlan?.recommendedFacility ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : encounters

  const statusLabel = (e: Encounter) => {
    if (e.phase === 'complete') return e.followUpStatus === 'improving' ? 'Improving' : e.followUpStatus === 'flagged' ? 'Flagged' : 'Complete'
    if (e.phase === 'after') return 'Post-Visit'
    if (e.phase === 'during') return 'In Progress'
    return 'Before Visit'
  }

  const statusColor = (e: Encounter) => {
    if (e.followUpStatus === 'improving') return 'badge-success'
    if (e.followUpStatus === 'flagged') return 'badge-danger'
    return 'badge-neutral'
  }

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      <div className="section-eyebrow" style={{ marginBottom: '8px' }}>Persistent Memory</div>
      <h1 className="text-h1" style={{ marginBottom: '32px' }}>Alaala Ko History</h1>

      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                className="input"
                placeholder="Search your health history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" style={{ padding: '12px 24px' }}>
              Voice Search
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p className="text-sm text-muted">
              {encounters.length === 0
                ? 'Wala pang naka-save na encounter. Pumunta sa Before Phase para magsimula.'
                : 'Walang nahanap na encounter para sa iyong paghahanap.'}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((e) => (
            <div key={e.id} className="card">
              <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', alignItems: 'center', gap: '24px' }}>
                <div>
                  <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>
                    {new Date(e.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {e.carePlan?.recommendedFacility ?? 'Facility TBD'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-secondary">
                    {e.symptoms || 'No symptoms recorded'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${statusColor(e)}`}>{statusLabel(e)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
