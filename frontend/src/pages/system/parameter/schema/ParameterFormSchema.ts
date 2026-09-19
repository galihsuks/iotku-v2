import { z } from "zod";

export const parameterFormSchema = z.object({
  key: z.string().trim().min(2, "Key must be at least 2 characters.").max(100, "Key is too long."),
  value: z.string().trim().min(1, "Value is required."),
  datatype: z.enum(["string", "number", "json", "boolean"], {
    message: "Datatype is required.",
  }),
});

export type ParameterFormSchemaType = z.infer<typeof parameterFormSchema>;
