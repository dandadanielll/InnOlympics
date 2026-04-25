// BEFORE Phase — "Handa Ka Na Ba?"
// Features: Voice/text input → Care plan → Documents checklist → Map → Dapat Sabihin Mo script
// TODO: Wire up VoiceInput → /api/gemini/navigate → CarePlanCard + FacilityMap + ScriptCard

'use client';

import { useState } from 'react';
import { detectEmergency } from '@/lib/emergency';

export default function BeforePage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [carePlan, setCarePlan] = useState<null | Record<string, unknown>>(null);
  const [showEmergency, setShowEmergency] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    if (detectEmergency(input)) {
      setShowEmergency(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: input,
          location: 'Quezon City', // TODO: pull from Firestore user profile
          hasPhilHealth: 'yes',    // TODO: pull from Firestore user profile
          languagePreference: 'taglish',
        }),
      });
      const data = await res.json();
      setCarePlan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f2ecdc] pb-24">
      {/* Emergency modal */}
      {showEmergency && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="text-4xl">🚨</div>
            <h2 className="text-xl font-bold text-[#7e2625]">
              Mukhang emergency ito.
            </h2>
            <p className="text-[#3d1b11]">
              Mangyaring tumawag sa 911 o pumunta sa pinakamalapit na ER agad.
            </p>
            <a
              href="tel:911"
              className="block w-full bg-[#7e2625] text-white font-bold py-4 rounded-xl text-lg"
            >
              📞 Tawagan ang 911
            </a>
            <button
              onClick={() => setShowEmergency(false)}
              className="text-sm text-[#6b5c53] underline"
            >
              Ipagpatuloy sa navigator
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3d1b11] font-jakarta">
            Handa Ka Na Ba? 📋
          </h1>
          <p className="text-[#6b5c53] mt-1">
            Sabihin mo kung ano ang iyong nararamdaman o kailangan.
          </p>
        </div>

        {/* Input area */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          {/* Voice button placeholder */}
          <div className="flex justify-center">
            <button className="w-20 h-20 rounded-full bg-[#7e2625] text-white flex items-center justify-center text-3xl shadow-lg active:scale-95 transition-transform">
              🎤
            </button>
          </div>
          <p className="text-center text-sm text-[#6b5c53]">I-hold para mag-record, bitawan para ipadala</p>

          <div className="text-center text-[#6b5c53] text-sm">— o kaya —</div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="I-type ang iyong concern dito..."
            className="w-full border border-[#d4c9b5] rounded-xl p-4 text-[#3d1b11] resize-none h-24 focus:outline-none focus:border-[#7e2625]"
          />

          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="w-full bg-[#7e2625] text-white font-semibold py-4 rounded-xl disabled:opacity-50 hover:bg-[#6a1f1e] transition-colors"
          >
            {isLoading ? 'Hinahanap ang tamang gabay...' : 'Hanapin ang Tamang Paraan →'}
          </button>

          <p className="text-center text-xs text-[#6b5c53]">
            ⚠️ Navigation guide lamang ito. Hindi ito medikal na diagnosis.
          </p>
        </div>

        {/* Quick prompt chips */}
        {!carePlan && (
          <div className="flex flex-wrap gap-2">
            {[
              'Lagnat ang anak ko ng 3 araw',
              'Kailangan ng libre na check-up',
              'Sakit ang dibdib ko',
              'Saan kukuha ng medical certificate?',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => setInput(chip)}
                className="bg-white border border-[#d4c9b5] rounded-full px-4 py-2 text-sm text-[#3d1b11] hover:border-[#7e2625] transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Care plan output */}
        {carePlan && (
          <div className="space-y-4">
            {/* TODO: Replace with CarePlanCard component */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-[#3d1b11] text-lg">🏥 Ang Iyong Care Plan</h2>
              <pre className="text-sm text-[#3d1b11] whitespace-pre-wrap font-sans">
                {JSON.stringify(carePlan, null, 2)}
              </pre>
            </div>

            <a
              href="/navigator/during"
              className="block w-full text-center bg-[#868859] text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              Nasa Ospital Na Ako → DURING
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
