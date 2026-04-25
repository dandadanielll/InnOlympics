// Onboarding: 3 screens — Location → PhilHealth → Language
// Stores to Firebase Firestore under anonymous user session
// TODO: Implement full animated onboarding flow

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[#f2ecdc] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#3d1b11] font-jakarta">
            Sabihan mo kami nang kaunti...
          </h1>
          <p className="text-[#6b5c53] mt-2">Para mas makapag-gabay namin sa iyo.</p>
        </div>

        {/* Step 1: Location */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <label className="block text-[#3d1b11] font-semibold mb-3">
            📍 Saan ka sa Metro Manila?
          </label>
          <select className="w-full border border-[#d4c9b5] rounded-xl p-4 text-[#3d1b11] bg-white text-base">
            <option value="">Piliin ang iyong lungsod...</option>
            {[
              'Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig',
              'Caloocan', 'Marikina', 'Parañaque', 'Las Piñas',
              'Muntinlupa', 'Mandaluyong', 'San Juan', 'Pasay',
              'Malabon', 'Navotas', 'Valenzuela', 'Pateros',
            ].map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Step 2: PhilHealth */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-[#3d1b11] font-semibold mb-3">
            🏥 May PhilHealth ka ba?
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'yes', label: 'Oo', emoji: '✅' },
              { value: 'no', label: 'Wala', emoji: '❌' },
              { value: 'unsure', label: 'Hindi alam', emoji: '🤔' },
            ].map((opt) => (
              <button
                key={opt.value}
                className="flex flex-col items-center justify-center p-4 border-2 border-[#d4c9b5] rounded-xl hover:border-[#7e2625] hover:bg-[#fff5f5] transition-colors text-[#3d1b11]"
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-sm font-medium mt-1">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Language */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-[#3d1b11] font-semibold mb-3">
            🗣️ Anong wika ang mas komportable mo?
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'filipino', label: 'Filipino' },
              { value: 'taglish', label: 'Taglish' },
              { value: 'english', label: 'English' },
            ].map((lang) => (
              <button
                key={lang.value}
                className="p-4 border-2 border-[#d4c9b5] rounded-xl hover:border-[#7e2625] hover:bg-[#fff5f5] transition-colors text-[#3d1b11] font-medium"
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <a
          href="/navigator"
          className="block w-full text-center bg-[#7e2625] text-white font-semibold py-4 rounded-xl text-lg hover:bg-[#6a1f1e] transition-colors"
        >
          Handa Na Ako →
        </a>
      </div>
    </main>
  );
}
