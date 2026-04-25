// Navigator — Phase router: Before / During / After
// Reads current encounter phase from Firestore and routes accordingly
// TODO: Implement phase state management with Firebase

import Link from 'next/link';

export default function NavigatorPage() {
  return (
    <main className="min-h-screen bg-[#f2ecdc] p-6">
      {/* Phase navigation tabs */}
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-[#3d1b11] font-jakarta mb-6 text-center">
          Sama-sama Nating Harapin Ito
        </h1>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { href: '/navigator/before', label: 'BAGO', sublabel: 'Handa Ka Na Ba?', emoji: '📋', active: true },
            { href: '/navigator/during', label: 'HABANG', sublabel: 'Nandito Ka Na', emoji: '🏥', active: false },
            { href: '/navigator/after', label: 'PAGKATAPOS', sublabel: 'Uwi Ka Na', emoji: '🏠', active: false },
          ].map((phase) => (
            <Link key={phase.href} href={phase.href}>
              <div className={`rounded-2xl p-4 text-center cursor-pointer transition-all border-2 ${
                phase.active
                  ? 'bg-[#7e2625] text-white border-[#7e2625]'
                  : 'bg-white text-[#3d1b11] border-[#d4c9b5] hover:border-[#7e2625]'
              }`}>
                <div className="text-2xl mb-1">{phase.emoji}</div>
                <div className="text-xs font-bold">{phase.label}</div>
                <div className="text-xs opacity-75">{phase.sublabel}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick start */}
        <Link href="/navigator/before">
          <div className="bg-[#7e2625] text-white rounded-2xl p-6 text-center cursor-pointer hover:bg-[#6a1f1e] transition-colors">
            <div className="text-3xl mb-2">📋</div>
            <h2 className="font-bold text-lg">Simulan ang Paghahanda</h2>
            <p className="text-sm opacity-90 mt-1">Sabihin mo sa akin kung ano ang iyong nararamdaman...</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
