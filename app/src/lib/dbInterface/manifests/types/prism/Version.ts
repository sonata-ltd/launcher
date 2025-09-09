import { z } from "zod";


const RequiresSchema = z.object({
    suggests: z.string(),
    uid: z.string()
})

export const VersionSchema = z.object({
    recommended: z.boolean(),
    releaseTime: z.string(),
    requires: RequiresSchema.array(),
    sha256: z.string(),
    type: z.string(),
    version: z.string()
})
