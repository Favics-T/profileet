import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  seed: {
    // This is the seed script Prisma will run with `prisma db seed`
    run: "node prisma/seed.js",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
