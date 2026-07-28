import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 pt-32 pb-16">
      <div className="space-y-2">
        <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-content">
          Contact Us
        </h1>
        <p className="text-content-secondary">
          Get in touch with the KitFix team — we&apos;re here to help.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-white/[0.04] bg-surface p-6">
          <h2 className="text-sm font-semibold text-content mb-1">Email</h2>
          <p className="text-sm text-content-secondary">
            <a href="mailto:hello@kitfix.co.za" className="text-green-400 hover:underline">
              hello@kitfix.co.za
            </a>
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.04] bg-surface p-6">
          <h2 className="text-sm font-semibold text-content mb-1">WhatsApp</h2>
          <p className="text-sm text-content-secondary">
            Send us a message on WhatsApp for quick responses.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.04] bg-surface p-6">
          <h2 className="text-sm font-semibold text-content mb-1">Social</h2>
          <p className="text-sm text-content-secondary">
            Follow us for repair tips, before/afters, and new arrivals.
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Link
          href="/repairs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-green-400"
        >
          Submit a Repair
        </Link>
      </div>
    </div>
  );
}
