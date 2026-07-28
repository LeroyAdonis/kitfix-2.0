import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Header */}
      <header className="border-b border-[#1a1a2e] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00E859] flex items-center justify-center">
              <span className="text-black font-bold text-sm">KF</span>
            </div>
            <span className="font-bold text-white text-lg">KitFix</span>
          </div>
          <a
            href="https://wa.me/27721234567"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#00E859] text-black font-semibold rounded-lg text-sm hover:bg-[#00c94d] transition-colors"
          >
            WhatsApp Us
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-24 pb-16">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Your Jersey,
            <br />
            <span className="text-[#00E859]">Good As New.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            South Africa&apos;s simplest jersey repair service. 
            Snap a photo on WhatsApp, get an instant quote, and we&apos;ll have your kit match-ready in days.
          </p>
          <a
            href="https://wa.me/27721234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#00E859] text-black font-bold rounded-xl text-lg hover:bg-[#00c94d] transition-all hover:scale-105"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Start on WhatsApp
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 border-t border-[#1a1a2e]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Snap & Send", desc: "Take a photo of the damage and send it to us on WhatsApp. No app to download, no forms to fill." },
              { step: "2", title: "Instant Quote", desc: "Our team reviews the damage and sends you a fixed-price quote. Simple, transparent, no surprises." },
              { step: "3", title: "We Fix It", desc: "Drop off or arrange collection. We repair your jersey and notify you when it's ready. Fast turnaround." },
            ].map((item) => (
              <div key={item.step} className="bg-[#1a1a2e] rounded-xl p-6 text-center border border-[#2b2b44]">
                <div className="w-12 h-12 rounded-full bg-[#00E859]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#00E859] font-bold text-xl">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 border-t border-[#1a1a2e]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Simple Pricing</h2>
          <p className="text-gray-400 text-center mb-12">Flat rates. No hidden fees. Pay when it's done.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { name: "Basic Repair", price: "R150", desc: "Torn seams, loose stitching, small holes" },
              { name: "Complex Repair", price: "R250", desc: "Large tears, number/name replacement, panel repair" },
              { name: "Full Refresh", price: "R400", desc: "Multiple repairs + deep clean. Like new." },
            ].map((tier) => (
              <div key={tier.name} className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2b2b44] hover:border-[#00E859]/30 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-1">{tier.name}</h3>
                <p className="text-3xl font-bold text-[#00E859] mb-3">{tier.price}</p>
                <p className="text-gray-400 text-sm">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 border-t border-[#1a1a2e] bg-[#0a0a0b]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Got a torn jersey?</h2>
          <p className="text-gray-400 mb-8">We&apos;ll have it ready for your next match.</p>
          <a
            href="https://wa.me/27721234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#00E859] text-black font-bold rounded-xl text-lg hover:bg-[#00c94d] transition-all hover:scale-105"
          >
            Message Us on WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-[#1a1a2e]">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>© 2026 KitFix. South Africa.</span>
          <span>Jersey repair specialists 🇿🇦</span>
        </div>
      </footer>
    </div>
  );
}
