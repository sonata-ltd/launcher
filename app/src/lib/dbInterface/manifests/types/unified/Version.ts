import { z } from "zod";

export const VersionSchema = z.object({
    id: z.string(),
    url: z.string(),
})
