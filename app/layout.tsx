import type { Metadata, Viewport } from "next";
import { Archivo_Black, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import { BUSINESS } from "@/lib/business";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Space_Grotesk({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KitFix — Kit Repair & Refresh",
  description:
    "Jersey repairs, renumbers and badge restitches for SA clubs and schools. Snap a photo, get a fixed quote on WhatsApp, and we'll fix it.",
  // The manifest and the icon set were both present in public/ but neither was declared, so browsers had
  // no manifest to read and installed the app with no icons of ours. Declaring them is what makes the
  // mark the app's face, not just the header's.
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0F1C10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} bg-[var(--color-pitch-deep)] text-[var(--color-thread)] antialiased min-h-screen font-body`}
      >
        {/* Structured NAP. Google reads this for local results and payment/verification reviews use
            it to confirm the published number matches the site. Every value comes from BUSINESS so
            it cannot drift from the footer, the contact page or an email signature. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: BUSINESS.name,
              legalName: BUSINESS.legalName,
              url: "https://mykitfix.co.za",
              telephone: BUSINESS.phoneE164,
              email: BUSINESS.email,
              description:
                "Jersey and sports kit repair for South African clubs and individuals. Send a photo on WhatsApp, get a quote, get it fixed.",
              address: {
                "@type": "PostalAddress",
                streetAddress: BUSINESS.address.street,
                addressLocality: BUSINESS.address.suburb,
                addressRegion: BUSINESS.address.city,
                postalCode: BUSINESS.address.postalCode,
                addressCountry: "ZA",
              },
              areaServed: "South Africa",
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
