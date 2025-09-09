import { z, ZodTypeAny } from "zod";
import { wsMessageSchema } from "./bindings/WsMessage";

export const validateMessageType = (rawMsg: any): z.infer<typeof wsMessageSchema> | false => {
    try {
        return wsMessageSchema.parse(rawMsg) as z.infer<typeof wsMessageSchema>;
    } catch (e) {
        console.log("Not valid: ", e);
        console.log(rawMsg);
        return false;
    }
}

export function validateMessageTypeCustom<T extends ZodTypeAny>(
    schema: T,
    raw: unknown
): z.infer<T> | false {
    const result = schema.safeParse(raw);
    return result.success ? result.data : false;
}
