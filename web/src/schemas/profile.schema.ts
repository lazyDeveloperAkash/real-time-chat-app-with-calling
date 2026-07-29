import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Enter a valid email"),
  contact: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
