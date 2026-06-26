import Link from "next/link";
import { Package, ShoppingCart } from "lucide-react";

const SUB_NAV_ITEMS = [
  { href: "/admin/store", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export default async function AdminStoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Store</h1>

      <nav className="flex gap-1 rounded-lg border bg-muted p-1">
        {SUB_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground aria-[current=page]:bg-background aria-[current=page]:text-foreground aria-[current=page]:shadow-sm"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
