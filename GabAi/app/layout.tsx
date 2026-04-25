import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import Sidebar from './components/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'GabAi — Health Navigation Guide',
  description: 'Navigate the Philippine healthcare system with confidence. Guided by AI.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#510400',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Merriweather:ital,wght@1,700&family=Open+Sans:wght@800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="layout-root">
          <Sidebar />
          <div className="page-wrapper">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
