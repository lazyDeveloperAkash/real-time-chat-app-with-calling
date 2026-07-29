import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters").max(100),
  memberIds: z.array(z.string().uuid()).min(1, "Select at least one member"),
});
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
