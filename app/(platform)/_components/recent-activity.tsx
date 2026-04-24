"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const feed = [
  { id: 1, who: "Priya", what: "merged", target: "api/webhooks", kind: "commit" as const },
  { id: 2, who: "Dev", what: "opened", target: "Issue: auth token expiry", kind: "issue" as const },
  { id: 3, who: "Sam", what: "shipped", target: "v0.4.1 to production", kind: "release" as const },
  { id: 4, who: "Ayo", what: "commented on", target: "PR #124", kind: "comment" as const },
];

const issues = [
  { id: "OPS-42", title: "Rotate Supabase publishable key", status: "in progress" },
  { id: "OPS-41", title: "Paginate users list > 500", status: "todo" },
  { id: "OPS-40", title: "Add Playwright golden path", status: "todo" },
];

const badgeVariant: Record<(typeof feed)[number]["kind"], "default" | "secondary" | "outline"> = {
  commit: "default",
  issue: "secondary",
  release: "default",
  comment: "outline",
};

export function RecentActivity() {
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Give it a title first.");
      return;
    }
    toast.success(`"${title}" queued (mock)`);
    setTitle("");
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Mock data — wire this to your real domain later.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">New issue</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new issue</DialogTitle>
              <DialogDescription>This is a dummy form to exercise the dialog.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short, descriptive…"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="feed">
          <TabsList>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>
          <TabsContent value="feed" className="pt-4">
            <ul className="space-y-3">
              {feed.map((item, i) => (
                <li key={item.id}>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant={badgeVariant[item.kind]}>{item.kind}</Badge>
                    <span className="font-medium">{item.who}</span>
                    <span className="text-muted-foreground">{item.what}</span>
                    <span className="truncate">{item.target}</span>
                  </div>
                  {i < feed.length - 1 && <Separator className="mt-3" />}
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="issues" className="pt-4">
            <ul className="space-y-3">
              {issues.map((issue, i) => (
                <li key={issue.id}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-mono text-xs">{issue.id}</span>
                      <span>{issue.title}</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {issue.status}
                    </Badge>
                  </div>
                  {i < issues.length - 1 && <Separator className="mt-3" />}
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
