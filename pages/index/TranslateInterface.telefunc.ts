import { getContext } from "telefunc";
import {
  type Message,
  streamMessages,
  type TranslateRpcSchema,
} from "./TranslateInterface.server";

export type { Message, TranslateRpcSchema };

export async function* onStreamMessages(
  input: TranslateRpcSchema,
): AsyncGenerator<Message> {
  const { c } = getContext();
  yield* streamMessages(c, input);
}
