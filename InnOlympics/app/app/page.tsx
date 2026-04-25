export default function LandingPage() {
  return (
    <main>
      {/* TODO: Landing page — Hero, Problem, How It Works, Demo Preview, CTA */}
      {/* Design tokens: bg-[#f2ecdc], accent #7e2625, text #3d1b11, success #868859 */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 px-6">
          <h1 className="text-4xl font-bold text-[#3d1b11] font-jakarta">
            Gabay
          </h1>
          <p className="text-lg text-[#6b5c53]">
            Hindi Ka Nag-iisa. May Kasama Ka Na.
          </p>
          <a
            href="/onboarding"
            className="inline-block bg-[#7e2625] text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-[#6a1f1e] transition-colors"
          >
            🎤 Simulan Na
          </a>
          <p className="text-sm text-[#6b5c53]">
            🔒 Anonymous · 🆓 Libre · 📱 Gumagana kahit mahina ang signal
          </p>
        </div>
      </div>
    </main>
  );
}
