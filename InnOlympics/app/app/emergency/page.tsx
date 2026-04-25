import { EMERGENCY_HOTLINES } from '@/lib/emergency';

export default function EmergencyPage() {
  return (
    <main className="min-h-screen bg-[#f2ecdc] pb-24">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="bg-[#7e2625] text-white rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">🚨</div>
          <h1 className="text-2xl font-bold font-jakarta">Emergency Hotlines</h1>
          <p className="text-sm opacity-90 mt-1">
            Available kahit wala kang internet connection (i-save ang page na ito)
          </p>
        </div>

        <div className="space-y-3">
          {EMERGENCY_HOTLINES.map((hotline) => (
            <a
              key={hotline.number}
              href={`tel:${hotline.number.replace(/[^0-9+]/g, '')}`}
              className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#3d1b11]">{hotline.name}</p>
                  <p className="text-sm text-[#6b5c53]">{hotline.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#7e2625] text-lg">{hotline.number}</p>
                  <p className="text-xs text-[#6b5c53]">Tap to call</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="bg-[#868859] text-white rounded-2xl p-4 text-sm text-center">
          💡 I-save ang page na ito sa iyong phone para available kahit wala kang internet.
        </div>
      </div>
    </main>
  );
}
