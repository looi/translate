import { defineConfig } from "drizzle-kit";

const dbPath = process.env.DB_PATH;
if (!dbPath) {
  throw new Error("DB_PATH environment variable is not set");
}

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: dbPath,
  },
});
