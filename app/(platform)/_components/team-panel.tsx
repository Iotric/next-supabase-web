import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const members = [
  { name: "Priya Kulkarni", role: "OWNER", email: "priya@example.com" },
  { name: "Dev Patel", role: "ADMIN", email: "dev@example.com" },
  { name: "Sam Turner", role: "MEMBER", email: "sam@example.com" },
  { name: "Ayo Adebayo", role: "MEMBER", email: "ayo@example.com" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TeamPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>Placeholder — pull from public.users later.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {members.map((m) => (
            <li key={m.email} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-[11px]">{initials(m.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{m.name}</div>
                <div className="text-muted-foreground truncate text-xs">{m.email}</div>
              </div>
              <Badge variant={m.role === "OWNER" ? "default" : "secondary"}>{m.role}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
