import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, ClipboardList, CheckCircle, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
  totalRequests: number;
  activeRepairs: number;
  completedRepairs: number;
  totalRevenue: number;
}

const CARDS = [
  {
    key: "totalRequests" as const,
    label: "Total Requests",
    icon: ClipboardList,
    format: (v: number) => v.toString(),
  },
  {
    key: "activeRepairs" as const,
    label: "Active Repairs",
    icon: Wrench,
    format: (v: number) => v.toString(),
  },
  {
    key: "completedRepairs" as const,
    label: "Completed",
    icon: CheckCircle,
    format: (v: number) => v.toString(),
  },
  {
    key: "totalRevenue" as const,
    label: "Revenue",
    icon: Banknote,
    format: (v: number) => formatCurrency(v),
  },
] as const;

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, format }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(stats[key])}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
