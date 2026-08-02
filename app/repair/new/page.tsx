"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { RepairRequestForm } from "@/components/forms/RepairRequestForm";

export default function NewRepairPage() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !data?.user) {
      router.replace("/sign-in");
    }
  }, [isPending, data, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[var(--color-pitch-deep)] flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
          Loading...
        </div>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="min-h-screen bg-[var(--color-pitch-deep)] flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-thread-dim)]">
          Redirecting to sign in...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-pitch-deep)]">
      <header className="border-b border-[var(--color-pitch-line)]/40 px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-stitch)] flex items-center justify-center">
              <span className="text-[var(--color-ink)] font-display text-xs">KF</span>
            </div>
            <span className="font-display text-base text-[var(--color-thread)] uppercase tracking-wide">
              KitFix <span className="text-[var(--color-stitch)]">Repair</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-stitch)] mb-2">
            JOB REF — NEW REQUEST
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-[var(--color-thread)] uppercase tracking-wide mb-1">
            Drop your kit on the bench
          </h1>
          <p className="font-mono text-xs text-[var(--color-thread-dim)]">
            Describe the damage, snap some photos, and we&apos;ll read it for you.
          </p>
        </div>

        <RepairRequestForm />
      </main>
    </div>
  );
}