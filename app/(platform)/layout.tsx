import { getCurrentUser } from "@/lib/auth/guards";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  // Middleware already redirects unauthenticated users; this enforces user profile existence too.
  await getCurrentUser();

  return <div className="min-h-screen">{children}</div>;
}
