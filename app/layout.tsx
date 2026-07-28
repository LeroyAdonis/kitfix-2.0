import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KitFix — Jersey Repair Specialists",
  description: "Get your sports jerseys repaired fast. Snap a photo, get a quote on WhatsApp, and we'll fix it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0A0B] text-white antialiased min-h-screen">{children}</body>
    </html>
  );
}
