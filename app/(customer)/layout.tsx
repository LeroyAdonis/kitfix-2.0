"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CustomerNav } from "@/components/layout/customer-nav";
import { Footer } from "@/components/layout/footer";
import { CustomerShell } from "@/components/motion/customer-shell";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<SessionUser | null | "loading">("loading");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth-session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          setSession(data.user);
        } else {
          setSession(null);
          const callbackUrl = encodeURIComponent(pathname);
          router.replace(`/sign-in?callbackUrl=${callbackUrl}`);
        }
      })
      .catch(() => {
        setSession(null);
        router.replace("/sign-in");
      });
  }, [router, pathname]);

  if (session === "loading" || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-deep">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gold to-brand-gold-light text-xs text-text-inverse">
              ✦
            </span>
            <span className="text-lg font-extrabold tracking-tight text-text-primary">
              Kit<span className="text-brand-gold">Fix</span>
            </span>
          </div>
          <div className="size-5 animate-spin rounded-full border-2 border-text-tertiary/20 border-t-brand-gold" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <CustomerNav />
        </aside>
        <main id="main-content" className="min-w-0 flex-1">
          <CustomerShell>{children}</CustomerShell>
        </main>
      </div>
      <Footer />
    </div>
  );
}
