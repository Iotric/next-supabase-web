import { describe, expect, it, vi } from "vitest";
import { AuthorizationError, getCurrentUser, requireRole } from "./guards";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null } })),
    },
  })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async () => null),
    },
  },
}));

describe("auth guards", () => {
  it("getCurrentUser throws AuthenticationError when no session", async () => {
    await expect(getCurrentUser()).rejects.toMatchObject({ name: "AuthenticationError" });
  });

  it("requireRole throws AuthorizationError when role not in allowed set", () => {
    const user = { id: "u1", email: "a@b.com", name: "A", role: "MEMBER" as const };
    expect(() => requireRole(user, "OWNER", "ADMIN")).toThrow(AuthorizationError);
  });

  it("requireRole passes when role matches", () => {
    const user = { id: "u1", email: "a@b.com", name: "A", role: "OWNER" as const };
    expect(() => requireRole(user, "OWNER", "ADMIN")).not.toThrow();
  });
});
