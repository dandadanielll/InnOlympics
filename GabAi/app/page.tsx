'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div style={{ position: 'relative' }}>

      {/* HERO — full-viewport arc background */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        margin: '-120px -48px 0',
        padding: '160px 48px 120px',
      }}>

        {/* Background photo — fixed to truly cover 100% viewport */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/landing-page-bg.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top center',
          backgroundSize: 'cover',
          opacity: 0.55,
          zIndex: -2,
        }} />

        {/* Gradient fade — curved arc fade using radial gradient */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse 150% 80% at 50% 100%, rgba(242,236,220,1) 52%, rgba(242,236,220,0) 62%)
          `,
          zIndex: -1,
        }} />
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '40px auto 0' }}>
          <h1 className="text-display" style={{ marginBottom: '32px', fontSize: '6rem', lineHeight: '1.05' }}>
            <div style={{ 
              animation: 'slideInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
            }}>
              Abot-kamay na
            </div>
            <div style={{ 
              color: 'var(--warning)',
              animation: 'slideInRight 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both'
            }}>
              Alagang Tunay.
            </div>
          </h1>



          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px',
            marginTop: '48px',
            animation: 'fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both'
          }}>
            <Link href="/navigator/before">
              <button className="btn btn-primary btn-lg">
                Try the Navigator
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
