import { z } from "zod";
import { VersionSchema } from "./Version";

export const PrismVersionManifestSchema = z.object({
    formatVersion: z.number(),
    name: z.string(),
    uid: z.string(),
    versions: VersionSchema.array()
})
