import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
        <Icon className="text-muted-foreground size-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <p className="text-muted-foreground mt-1 text-xs">{delta}</p>
      </CardContent>
    </Card>
  );
}
