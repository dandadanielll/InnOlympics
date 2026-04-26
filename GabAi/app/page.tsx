'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import LogoLoop from './components/LogoLoop'

export default function LandingPage() {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const partnerLogos = [
    { src: "/logo1.png", alt: "Partner Logo 1" },
    { src: "/logo2.png", alt: "Partner Logo 2" },
    { src: "/logo3.png", alt: "Partner Logo 3" },
    { src: "/logo4.png", alt: "Partner Logo 4" },
    { src: "/logo5.png", alt: "Partner Logo 5" },
    { src: "/logo6.png", alt: "Partner Logo 6" },
  ];

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>

      {/* HERO — full-viewport arc background */}
      <section style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        margin: '-120px -48px 0',
        padding: '160px 48px 0', // Reduced bottom padding to fit logo loop
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
            radial-gradient(ellipse 150% 100% at 50% 100%, rgba(242,236,220,1) 40%, rgba(242,236,220,0.8) 55%, rgba(242,236,220,0) 80%)
          `,
          zIndex: -1,
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '900px',
          margin: '0 auto',
          transform: 'translateY(-40px)'
        }}>
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
                Get Started
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>
        </div>

        {/* Logo Loop at the bottom */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          width: '100%',
          left: 0,
          animation: 'fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1s both',
          opacity: 0.6,
          color: 'var(--primary)'
        }}>
          <LogoLoop
            logos={partnerLogos}
            speed={60}
            direction="left"
            logoHeight={32}
            gap={60}
            fadeOut
            fadeOutColor="#f2ecdc"
            ariaLabel="Health features"
          />
        </div>
      </section>

    </div>
  )
}
