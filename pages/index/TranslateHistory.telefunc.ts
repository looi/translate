import { desc, like } from "drizzle-orm";
import { getContext } from "telefunc";
import z from "zod";
import { translateHistory } from "../../src/schema";

const HistoryQuerySchema = z.object({ query: z.string() });

export type HistoryQuerySchema = z.infer<typeof HistoryQuerySchema>;

export async function onGetTranslateHistory(
  input: HistoryQuerySchema = { query: "" },
) {
  const { query } = HistoryQuerySchema.parse(input);

  const { c } = getContext();
  const db = c.get("db");

  const entries = db
    .select()
    .from(translateHistory)
    .where(query ? like(translateHistory.text, `%${query}%`) : undefined)
    .orderBy(desc(translateHistory.createdAt))
    .limit(50)
    .all();
  return entries.map((e) => ({
    text: e.text,
    nativeLang: e.nativeLang,
    learnLang: e.learnLang,
    textIsNativeLang: e.textIsNativeLang,
    createdAt: e.createdAt,
  }));
}
