// Generated by ts-to-zod
import { z } from "zod";

export const operationStatusSchema = z.union([
  z.literal("completed"),
  z.literal("failed"),
  z.literal("cancelled"),
]);
