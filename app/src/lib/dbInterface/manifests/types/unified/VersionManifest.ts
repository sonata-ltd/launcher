import { z } from "zod";
import { VersionSchema } from "./Version";

export const UnifiedVersionManifestSchema = z.array(VersionSchema)
