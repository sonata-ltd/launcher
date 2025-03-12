import { z } from "zod";

export const VersionSchema = z.object({
    complianceLevel: z.number(),
    id: z.string(),
    releaseTime: z.string(),
    sha1: z.string(),
    time: z.string(),
    type: z.string(),
    url: z.string()
})
