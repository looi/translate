import {
  blob,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export const chatCache = sqliteTable(
  "chat_cache",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    type: text().notNull(),
    text: text().notNull(),
    fromLang: text().notNull(),
    toLang: text().notNull(),
    rawBytes: blob({ mode: "buffer" }).notNull(),
  },
  (table) => [
    unique().on(table.type, table.text, table.fromLang, table.toLang),
  ],
);

export const translateHistory = sqliteTable(
  "translate_history",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    text: text().notNull(),
    nativeLang: text().notNull(),
    learnLang: text().notNull(),
    textIsNativeLang: integer({ mode: "boolean" }).notNull(),
    createdAt: integer({ mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    unique().on(
      table.text,
      table.nativeLang,
      table.learnLang,
      table.textIsNativeLang,
    ),
  ],
);
