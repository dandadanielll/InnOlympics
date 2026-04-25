// Alaala Ko — Encounter history page
// Lists all past encounters from Firestore, voice-queryable
// TODO: Wire up to Firebase Firestore users/{uid}/encounters collection

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-[#f2ecdc] pb-24">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3d1b11] font-jakarta">
            Alaala Ko 🧠
          </h1>
          <p className="text-[#6b5c53] mt-1">
            Ang kasaysayan ng iyong mga bisita sa ospital. Hindi ka na magsisimula mula sa zero.
          </p>
        </div>

        {/* Voice query */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <button className="w-14 h-14 rounded-full bg-[#7e2625] text-white flex items-center justify-center text-xl flex-shrink-0">
            🎤
          </button>
          <p className="text-sm text-[#6b5c53]">
            Tanungin mo ako: "Kailan ako huling pumunta sa doktor?"
          </p>
        </div>

        {/* Encounter cards placeholder */}
        <div className="space-y-3">
          {[
            { date: 'Abril 20, 2026', facility: 'Batasan Hills Health Center', concern: 'Lagnat ng bata', phase: 'complete' },
            { date: 'Marso 5, 2026', facility: 'QCGH OPD', concern: 'Check-up para sa presyon', phase: 'complete' },
          ].map((enc, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6b5c53]">{enc.date}</span>
                <span className="text-xs bg-[#868859] text-white rounded-full px-2 py-0.5">Tapos na</span>
              </div>
              <p className="font-semibold text-[#3d1b11] text-sm">{enc.facility}</p>
              <p className="text-sm text-[#6b5c53]">{enc.concern}</p>
              <button className="text-sm text-[#7e2625] font-medium">
                Tingnan ang buong talaan →
              </button>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div className="text-center text-[#6b5c53] text-sm py-4">
          Ito ang iyong personal na health record. Libre at lagi mong available.
        </div>
      </div>
    </main>
  );
}
