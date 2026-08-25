"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const navLink =
  "text-[var(--color-thread-dim)] hover:text-[var(--color-stitch)] transition-colors";

export function CustomerNav() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <nav className="flex items-center gap-4 md:gap-5 font-mono text-xs uppercase tracking-[0.16em]">
      <Link href="/" className={navLink}>
        Home
      </Link>
      <Link href="/my-jobs" className={navLink}>
        My Jobs
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        className={`${navLink} cursor-pointer`}
      >
        Sign Out
      </button>
    </nav>
  );
}
