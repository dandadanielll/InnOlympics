// DURING Phase — "Nandito Ka Na"
// Features: Script pull-up, Patient rights, Voice encounter logger, Document camera
// TODO: Wire up EncounterLogger → /api/gemini/summarize, DocumentCamera → /api/gemini/vision

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DuringPage() {
  const [activeTab, setActiveTab] = useState<'script' | 'rights' | 'logger' | 'camera'>('logger');

  return (
    <main className="min-h-screen bg-[#f2ecdc] pb-24">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3d1b11] font-jakarta">
            Nandito Ka Na 🏥
          </h1>
          <p className="text-[#6b5c53] mt-1">
            Nandito kami para samahan ka sa loob ng konsultasyon.
          </p>
        </div>

        {/* Tab selector */}
        <div className="grid grid-cols-4 gap-1 bg-white rounded-2xl p-1 shadow-sm">
          {[
            { key: 'script', label: '📝 Script', active: activeTab === 'script' },
            { key: 'rights', label: '⚖️ Rights', active: activeTab === 'rights' },
            { key: 'logger', label: '🎤 Logger', active: activeTab === 'logger' },
            { key: 'camera', label: '📷 Scan', active: activeTab === 'camera' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-2 px-1 rounded-xl text-xs font-semibold transition-colors ${
                tab.active
                  ? 'bg-[#7e2625] text-white'
                  : 'text-[#6b5c53] hover:text-[#3d1b11]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Script Pull-up */}
        {activeTab === 'script' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-[#3d1b11]">📝 Dapat Sabihin Mo</h2>
            <div className="bg-[#f2ecdc] rounded-xl p-4 text-[#3d1b11] text-sm leading-relaxed">
              {/* TODO: Pull actual script from Firestore encounter */}
              <p className="italic text-[#6b5c53]">
                "Doc, 3 days na po ang lagnat ng anak ko. Nagtatamad po kumain at mataas ang temperatura niya — mga 38.5°C. Wala pong ibang sintomas. May PhilHealth po kami."
              </p>
            </div>
            <button className="w-full border-2 border-[#7e2625] text-[#7e2625] font-semibold py-3 rounded-xl hover:bg-[#fff5f5] transition-colors">
              🔊 Basahin Sa Akin
            </button>
          </div>
        )}

        {/* Patient Rights */}
        {activeTab === 'rights' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="font-bold text-[#3d1b11]">⚖️ Ang Iyong Mga Karapatan</h2>
            {[
              { right: 'Itemized Bill', desc: 'May karapatan kang humingi ng detalyadong listahan ng gastos.' },
              { right: 'Second Opinion', desc: 'Puwede kang kumuha ng opinyon mula sa ibang doktor.' },
              { right: 'Libreng Serbisyo', desc: 'Sa ilalim ng PhilHealth Konsulta, libre ang konsultasyon sa mga accredited na health center.' },
              { right: 'No Balance Billing', desc: 'Hindi ka dapat pagbayarin ng higit pa sa coverage ng PhilHealth para sa mga covered na serbisyo.' },
            ].map((item) => (
              <div key={item.right} className="border-l-4 border-[#868859] pl-4">
                <p className="font-semibold text-[#3d1b11] text-sm">{item.right}</p>
                <p className="text-[#6b5c53] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Voice Logger */}
        {activeTab === 'logger' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-[#3d1b11]">🎤 I-record ang Sinabi ng Doktor</h2>
            <p className="text-sm text-[#6b5c53]">
              Pindutin ang mikropono habang nagsasalita ang doktor. Isa-isahin namin ang mga importanteng detalye para sa iyo.
            </p>

            <div className="flex justify-center py-4">
              <button className="w-24 h-24 rounded-full bg-[#7e2625] text-white flex items-center justify-center text-4xl shadow-xl active:scale-95 transition-transform">
                🎤
              </button>
            </div>

            <div className="bg-[#f2ecdc] rounded-xl p-4 min-h-[80px]">
              <p className="text-sm text-[#6b5c53] italic">
                Ang transcript ay lalabas dito...
              </p>
            </div>

            {/* TODO: Wire to /api/gemini/summarize, show "To Remember" cards */}
          </div>
        )}

        {/* Document Camera */}
        {activeTab === 'camera' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-[#3d1b11]">📷 I-scan ang Dokumento</h2>
            <p className="text-sm text-[#6b5c53]">
              Kunan ng larawan ang reseta, lab request, o referral. Ipapaliwanag namin sa madaling salita.
            </p>

            <label className="block w-full border-2 border-dashed border-[#d4c9b5] rounded-xl p-8 text-center cursor-pointer hover:border-[#7e2625] transition-colors">
              <input type="file" accept="image/*" capture="environment" className="hidden" />
              <div className="text-4xl mb-2">📷</div>
              <p className="text-[#3d1b11] font-semibold">I-tap para mag-capture</p>
              <p className="text-sm text-[#6b5c53]">Reseta, lab request, referral, o discharge summary</p>
            </label>

            {/* TODO: Wire to /api/gemini/vision, show explanation card */}
          </div>
        )}

        <Link
          href="/navigator/after"
          className="block w-full text-center bg-[#868859] text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity"
        >
          Tapos Na ang Konsultasyon → AFTER
        </Link>
      </div>
    </main>
  );
}
