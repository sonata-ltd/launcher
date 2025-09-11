import { z } from "zod";
import { progressUnitSchema } from "./ProgressUnit";
import { scanInfoSchema } from "./ScanInfo";
import { scanIntegritySchema } from "./ScanIntegrity";
import { targetStatusSchema } from "./TargetStatus";


export const processTargetSchema = z.union([
  z.object({
    type: z.literal("File"),
    status: targetStatusSchema,
    name: z.string(),
    unit: progressUnitSchema.nullish(),
    current: z.number().nullish(),
    size: z.number().nullish(),
  }),
  z.object({
    type: z.literal("Dir"),
  }),
  z.object({
    type: z.literal("Instance"),
    integrity: scanIntegritySchema,
    info: scanInfoSchema.nullish(),
  }),
]);
