import { z } from "zod";

export const taskStatusSchema = z.union([
    z.literal("Pending"),
    z.literal("Running"),
    z.literal("Completed"),
    z.literal("Failed"),
    z.literal("CancelledAwaitin"),
    z.literal("Cancelled")
])
