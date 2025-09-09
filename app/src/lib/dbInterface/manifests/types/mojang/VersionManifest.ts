import { z } from "zod";
import { VersionSchema } from "./Version";

export const MojangVersionManifestSchema = z.object({
    latest: z.object({
        release: z.string(),
        snapshot: z.string(),
    }),
    versions: VersionSchema.array()
})
