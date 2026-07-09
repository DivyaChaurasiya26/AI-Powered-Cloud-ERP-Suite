import { z } from "zod";

export const updateAnomalyStatusSchema = z.object({
  status: z.enum(["OPEN", "REVIEWED", "DISMISSED"], {
    required_error: "Status is required",
  }),
});
