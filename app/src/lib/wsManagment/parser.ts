import { z, ZodTypeAny } from "zod";
import { indexMessageSchema } from "../msgBindings";

export const validateMessageType = (rawMsg: any): z.infer<typeof indexMessageSchema> | false => {
    try {
        return indexMessageSchema.parse(rawMsg) as z.infer<typeof indexMessageSchema>;
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
