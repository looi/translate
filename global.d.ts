/// <reference types="vike/types" />
import type { NodeSQLiteDatabase } from "drizzle-orm/node-sqlite";
import type { Context as HonoContext } from "hono";

declare module "hono" {
  interface ContextVariableMap {
    db: NodeSQLiteDatabase;
  }
}

declare global {
  namespace Vike {
    interface Server {
      server: "hono";
    }
  }
  namespace Telefunc {
    interface Context {
      c: HonoContext;
    }
  }
}
