import { requireAuth } from "@/lib/auth-utils";
import { Header } from "@/components/layout/header";
import { CustomerNav } from "@/components/layout/customer-nav";
import { Footer } from "@/components/layout/footer";
import { CustomerShell } from "@/components/motion/customer-shell";

/** Customer pages require auth + live DB data — never statically prerender. */
export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <CustomerNav />
        </aside>
        <main className="min-w-0 flex-1">
          <CustomerShell>{children}</CustomerShell>
        </main>
      </div>
      <Footer />
    </div>
  );
}
