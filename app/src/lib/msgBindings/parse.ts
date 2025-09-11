import { z } from "zod"
import { indexMessageSchema } from "./bindings";

export type InferZod<T extends z.ZodTypeAny> = z.infer<T>;

export enum expectedType {
    operation = "operation",
    scan = "scan",
    option = "option"
}

export function validateMessageAs<T extends z.ZodTypeAny>(
    expectedSchema: T,
    message: unknown,
    expectedType: expectedType
): InferZod<T> {
    const parsedRoot = indexMessageSchema.parse(message);

    if (expectedType && (parsedRoot as any).type !== expectedType) {
        throw new Error(`Message type mismatch: expected "${expectedType}", got "${(parsedRoot as any).type}"`);
    }

    const payload = expectedSchema.parse((parsedRoot as any).payload);
    return payload as InferZod<T>;
}

export function tryValidateMessageAs<T extends z.ZodTypeAny>(
    expectedSchema: T,
    message: unknown,
    expectedType: expectedType
): { success: true, payload: InferZod<T> } | { success: false, error: unknown } {
    try {
        const payload = validateMessageAs(expectedSchema, message, expectedType);
        return { success: true, payload };
    } catch (err) {
        return { success: false, error: err };
    }
}
