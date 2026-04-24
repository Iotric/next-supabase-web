import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

const clientValues = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

const isServer = typeof window === "undefined";

function parse<T extends z.ZodTypeAny>(schema: T, values: unknown, label: string): z.infer<T> {
  const result = schema.safeParse(values);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid ${label} environment variables:\n${issues}`);
  }
  return result.data;
}

const clientEnv = parse(clientSchema, clientValues, "client");

const serverEnv = isServer
  ? parse(
      serverSchema,
      {
        DATABASE_URL: process.env.DATABASE_URL,
        DIRECT_URL: process.env.DIRECT_URL,
        NODE_ENV: process.env.NODE_ENV,
      },
      "server",
    )
  : ({} as z.infer<typeof serverSchema>);

export const env = { ...clientEnv, ...serverEnv };
