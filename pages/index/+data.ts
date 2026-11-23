import type { PageContextServer } from "vike/types";
import { TranslateRequestSchema } from "../../src/common";
import { streamMessages } from "./TranslateInterface.server";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(pageContext: PageContextServer) {
  const raw = pageContext.urlParsed.search;
  const parsed = TranslateRequestSchema.safeParse({
    ...raw,
    textIsNativeLang: raw.textIsNativeLang === "true",
  });
  const initialReq = parsed.success ? parsed.data : null;
  const initialResps: Record<string, string> = {};
  const initialErrors: string[] = [];

  if (initialReq) {
    const stream = streamMessages(pageContext.runtime.hono, {
      req: initialReq,
      performReq: false,
      updateHistory: false,
    });
    for await (const msg of stream) {
      if (msg.type === "error") {
        initialErrors.push(msg.text);
      } else {
        initialResps[msg.type] = (initialResps[msg.type] || "") + msg.text;
      }
    }
  }

  return {
    initialReq,
    initialResps,
    initialErrors,
  };
}
