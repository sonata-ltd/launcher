import { z } from "zod";
import { VersionSchema } from "./Version";

export const VersionManifestSchema = z.object({
    latest: z.object({
        release: z.string(),
        snapshot: z.string(),
    }),
    versions: VersionSchema.array()
})
