import { z } from "zod";

export const taskProgressSchema = z.union([
    z.object({
        type: z.literal("Determinable"),
        details: z.object({
            current: z.number().nullish(),
            total: z.number().nullish()
        })
    }),
    z.object({
        type: z.literal("Indeterminable")
    })
]);
