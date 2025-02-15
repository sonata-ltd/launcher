import { z } from "zod";
import { operationEventSchema } from "./bindings/OperationEvent";
import { operationUpdateSchema } from "./bindings/OperationUpdate";
import { wsMessageSchema } from "./bindings/WsMessage";

export const validateMessageType = (rawMsg: any): z.infer<typeof wsMessageSchema> | false => {
    try {
        return wsMessageSchema.parse(rawMsg) as z.infer<typeof wsMessageSchema>;
    } catch(e) {
        return false;
    }
}
