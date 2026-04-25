export default function AboutPage() {
  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      <div className="section-eyebrow" style={{ marginBottom: '8px' }}>Project Background</div>
      <h1 className="text-h1" style={{ marginBottom: '32px' }}>Gabay + AI = GabAi</h1>

      <div className="card" style={{ marginBottom: '48px' }}>
        <div className="card-body">
          <h2 className="text-h2" style={{ marginBottom: '16px' }}>The Mission</h2>
          <p className="text-body text-secondary" style={{ lineHeight: 1.8 }}>
            No Filipino should lose a day's wages because the system did not give them a map. 
            Philippine public healthcare is not absent — it is a maze. Five or more entry points, no routing logic for patients, no document guide, no shared memory between visits. Every encounter starts from zero. GabAi is that map, guided by Gemini AI.
          </p>
        </div>
      </div>

      <h2 className="text-h2" style={{ marginBottom: '24px' }}>Tech Stack</h2>
      <div className="three-col" style={{ gap: '24px' }}>
        <div className="card">
          <div className="card-body">
            <h3 className="text-h3" style={{ marginBottom: '8px', color: 'var(--primary)' }}>Gemini 2.0 Flash</h3>
            <p className="text-sm text-secondary">Powers care navigation, script generation, audio summarization, and document vision.</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-h3" style={{ marginBottom: '8px', color: 'var(--primary)' }}>Firebase Backend</h3>
            <p className="text-sm text-secondary">Anonymous authentication and Firestore database for persistent 'Alaala Ko' history.</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-h3" style={{ marginBottom: '8px', color: 'var(--primary)' }}>Next.js App Router</h3>
            <p className="text-sm text-secondary">React-based edge routing, optimizing the payload for low-bandwidth mobile devices.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
