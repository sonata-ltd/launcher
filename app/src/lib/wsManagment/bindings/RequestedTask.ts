// Generated by ts-to-zod
import { z } from "zod";

export const requestedTaskSchema = z.union([
  z.object({
    init_instance: z.object({
      instance_id: z.string(),
      config: z.string(),
    }),
  }),
  z.object({
    run_instance: z.object({
      instance_id: z.string(),
      parameters: z.array(z.string()),
    }),
  }),
  z.object({
    scan_for_instances: z.object({
      scan_range: z.tuple([z.number(), z.number()]),
    }),
  }),
]);
