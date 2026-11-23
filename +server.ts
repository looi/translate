import vike from "@vikejs/hono";
import { drizzle } from "drizzle-orm/node-sqlite";
import { migrate } from "drizzle-orm/node-sqlite/migrator";
import { Hono } from "hono";
import { Telefunc } from "telefunc/node";
import type { Server } from "vike/types";

const dbPath = process.env.DB_PATH;
if (!dbPath) {
  throw new Error("DB_PATH environment variable is not set");
}

const db = drizzle(dbPath);
await migrate(db, {
  migrationsFolder: "./drizzle/",
});

const app = new Hono();
export const telefunc = new Telefunc();

app.use(async (c, next) => {
  c.set("db", db);
  await next();
});

app.all("/_telefunc", async (c) => {
  const httpResponse = await telefunc.serve({
    request: c.req.raw,
    context: {
      c,
    },
  });
  return httpResponse ?? c.notFound();
});

vike(app);

const server: Server = {
  fetch: app.fetch,
  prod: {
    gracefulShutdown: true,
    onCreate(server) {
      telefunc.installWebSocket(server as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  },
};

export default server;
