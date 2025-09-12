import { z } from "zod";
import { indexMessageSchema } from "./bindings";

type IndexMessage = z.infer<typeof indexMessageSchema>;
type MsgType = IndexMessage["type"];
type PayloadFor<T extends MsgType> = Extract<IndexMessage, { type: T }>["payload"];


export function validateMessageAs<T extends MsgType>(
  expectedType: T,
  raw: unknown
): PayloadFor<T> {
  const parsed = indexMessageSchema.parse(raw);

  if (parsed.type !== expectedType) {
    throw new Error(`Message type mismatch: expected "${expectedType}", got "${parsed.type}"`);
  }

  return parsed.payload as PayloadFor<T>;
}

export function tryValidateMessageAs<T extends MsgType>(
  expectedType: T,
  raw: unknown
): { success: true; payload: PayloadFor<T> } | { success: false; error: unknown } {
  const res = indexMessageSchema.safeParse(raw);
  if (!res.success) return { success: false, error: res.error };

  const parsed = res.data;
  if (parsed.type !== expectedType) {
    return { success: false, error: new Error(`Message type mismatch: expected "${expectedType}", got "${parsed.type}"`) };
  }

  return { success: true, payload: parsed.payload as PayloadFor<T> };
}
