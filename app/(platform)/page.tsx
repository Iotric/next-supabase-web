import { Activity, FolderKanban, Sparkles, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/guards";
import { DashboardHeader } from "./_components/dashboard-header";
import { MetricCard } from "./_components/metric-card";
import { RecentActivity } from "./_components/recent-activity";
import { TeamPanel } from "./_components/team-panel";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="bg-muted/30 min-h-screen">
      <DashboardHeader user={user} />
      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight">Good to see you, {user.name}.</h1>
          <p className="text-muted-foreground text-sm">
            A snapshot of what's happening — all mocked for now.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={FolderKanban} label="Active projects" value="12" delta="+2 this week" />
          <MetricCard icon={Users} label="Team members" value="7" delta="+1 new" />
          <MetricCard icon={Activity} label="Open issues" value="34" delta="−6 since yesterday" />
          <MetricCard icon={Sparkles} label="Shipped" value="128" delta="all-time" />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <TeamPanel />
        </section>
      </main>
    </div>
  );
}
