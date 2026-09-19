import { z } from "zod";

export const sensorUnitSchema = z.object({
  name: z.string().trim().min(1).max(100),
  unit: z.string().trim().min(1).max(50),
  value_type: z.enum(["number", "string"]),
});

export const sensorSchema = z.object({
  label: z.string().trim().min(1).max(150),
  unit_id: z.string().trim().min(1),
  owner_user_id: z.string().trim().min(1).optional(),
  shared_user_ids: z.array(z.string().trim().min(1)).optional(),
});

export const readingSchema = z.object({
  recorded_at_ms: z.coerce.number().int().positive().optional(),
  value: z.union([z.string(), z.number(), z.boolean()]),
});
