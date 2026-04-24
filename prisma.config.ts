import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL is used by the CLI (migrate, push, seed).
    // Left empty here so `prisma generate` works without env; migrations will fail loudly if unset.
    url: process.env.DIRECT_URL ?? "",
  },
});
