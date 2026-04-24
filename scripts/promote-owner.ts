import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL missing");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  if (users.length === 0) {
    console.error("No users in public.users. Create one via Supabase Dashboard first.");
    process.exit(1);
  }

  const targetEmail = process.argv[2];
  const target = targetEmail
    ? users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase())
    : users[0];

  if (!target) {
    console.error(`No user found with email ${targetEmail}. Existing users:`);
    for (const u of users) console.error(`  • ${u.email} (${u.role})`);
    process.exit(1);
  }

  if (target.role === "OWNER") {
    console.log(`${target.email} is already OWNER — nothing to do.`);
    return;
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { role: "OWNER" },
    select: { email: true, role: true },
  });
  console.log(`Promoted ${updated.email} → ${updated.role}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
