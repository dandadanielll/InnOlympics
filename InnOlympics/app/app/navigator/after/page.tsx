// AFTER Phase — "Uwi Ka Na"
// Features: WhatsApp summary, Follow-up check-in, Referral companion, Community logger
// TODO: Wire up to /api/gemini/whatsapp, /api/gemini/followup, Firestore community collection

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AfterPage() {
  const [followUpSent, setFollowUpSent] = useState(false);
  const [communityLogged, setCommunityLogged] = useState(false);

  const handleWhatsApp = () => {
    const summary = encodeURIComponent(
      '🏥 *Ulat ng Bisita sa Ospital*\n\n' +
      '📋 *Ano ang nangyari:*\n[summary here]\n\n' +
      '💊 *Mga gamot:*\n[prescriptions here]\n\n' +
      '📅 *Susunod na hakbang:*\n[follow-up here]\n\n' +
      '_Gawa sa Gabay App_'
    );
    window.open(`https://wa.me/?text=${summary}`);
  };

  return (
    <main className="min-h-screen bg-[#f2ecdc] pb-24">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3d1b11] font-jakarta">
            Uwi Ka Na 🏠
          </h1>
          <p className="text-[#6b5c53] mt-1">
            Magaling! Nandito ang mga susunod mong hakbang.
          </p>
        </div>

        {/* WhatsApp Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="font-bold text-[#3d1b11]">💬 Ipaliwanag sa Pamilya</h2>
          <p className="text-sm text-[#6b5c53]">
            I-share ang buod ng iyong bisita sa pamilya mo sa WhatsApp.
          </p>
          <button
            onClick={handleWhatsApp}
            className="w-full bg-[#25D366] text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span>📲</span> I-share sa WhatsApp
          </button>
        </div>

        {/* To Remember */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="font-bold text-[#3d1b11]">✅ Dapat Tandaan</h2>
          {/* TODO: Pull from Firestore toRemember array */}
          {[
            'Uminom ng Amoxicillin 500mg, 3x bawat araw, sa loob ng 7 araw',
            'Bumalik kung hindi bumaba ang lagnat pagkatapos ng 3 araw',
            'Mag-follow up sa BHC sa Biyernes',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#868859] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-[#3d1b11]">{item}</p>
            </div>
          ))}
        </div>

        {/* Follow-up Check-in */}
        {!followUpSent && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="font-bold text-[#3d1b11]">🔔 Okay Ka Pa Ba?</h2>
            <p className="text-sm text-[#6b5c53]">
              Tutukuyin ka namin pagkatapos ng 24-48 oras para malaman kung kumusta ka na.
            </p>
            <button
              onClick={() => setFollowUpSent(true)}
              className="w-full border-2 border-[#7e2625] text-[#7e2625] font-semibold py-3 rounded-xl hover:bg-[#fff5f5] transition-colors"
            >
              Pwede — Abisuhan Ako
            </button>
          </div>
        )}

        {followUpSent && (
          <div className="bg-[#868859] text-white rounded-2xl p-4 text-center">
            ✅ Maaalala ka namin. Kumusta ka! Get well soon!
          </div>
        )}

        {/* Community Logger */}
        {!communityLogged && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-[#3d1b11]">🤝 Tulungan ang Ibang Pasyente</h2>
            <p className="text-sm text-[#6b5c53]">
              Anonymously i-rate ang iyong karanasan para matulungan ang susunod na bibisita.
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-[#3d1b11] mb-2">Gaano katagal ang pila?</p>
                <div className="grid grid-cols-4 gap-2">
                  {['< 1 hr', '1-2 hrs', '2-3 hrs', '3+ hrs'].map((t) => (
                    <button key={t} className="border border-[#d4c9b5] rounded-lg py-2 text-xs text-[#3d1b11] hover:border-[#7e2625]">
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 border border-[#d4c9b5] rounded-lg py-2 text-sm text-[#3d1b11] hover:border-[#868859]">
                  👍 Helpful ang doktor
                </button>
                <button className="flex-1 border border-[#d4c9b5] rounded-lg py-2 text-sm text-[#3d1b11] hover:border-[#7e2625]">
                  👎 Hindi helpful
                </button>
              </div>

              <button
                onClick={() => setCommunityLogged(true)}
                className="w-full bg-[#3d1b11] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                I-submit ang Rating
              </button>
            </div>
          </div>
        )}

        {communityLogged && (
          <div className="bg-[#868859] text-white rounded-2xl p-4 text-center">
            🙏 Salamat! Nakatulong ka sa iba.
          </div>
        )}

        {/* Start over / referral */}
        <Link
          href="/navigator/before"
          className="block w-full text-center border-2 border-[#3d1b11] text-[#3d1b11] font-semibold py-4 rounded-xl hover:bg-[#3d1b11] hover:text-white transition-colors"
        >
          May Susunod Pa (Referral / Labs) →
        </Link>
      </div>
    </main>
  );
}
