import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "OWNER" | "ADMIN" | "MEMBER";

export class AuthenticationError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Not authorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export const getCurrentUser = cache(async (): Promise<AuthUser> => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new AuthenticationError();

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) throw new AuthenticationError("User profile not found");
  return user as AuthUser;
});

export const getOptionalUser = cache(async (): Promise<AuthUser | null> => {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (error instanceof AuthenticationError) return null;
    throw error;
  }
});

export function requireRole(user: AuthUser, ...roles: UserRole[]): void {
  if (!roles.includes(user.role)) {
    throw new AuthorizationError(`Requires one of: ${roles.join(", ")}. You have: ${user.role}`);
  }
}
