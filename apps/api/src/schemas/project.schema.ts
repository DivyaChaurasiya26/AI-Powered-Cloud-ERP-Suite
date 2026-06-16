import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: "Project name is required" })
    .min(2, "Project name must be at least 2 characters")
    .max(200, "Project name must be under 200 characters"),

  description: z.string().optional(),

  status: z
    .enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED"])
    .optional(),

  managerId: z
    .string()
    .length(24, "managerId must be a valid ObjectId")
    .optional(),

  startDate: z.string().optional(),

  endDate: z.string().optional(),

  plannedBudget: z
    .number()
    .nonnegative("Planned budget must be zero or positive")
    .optional(),

  actualBudget: z
    .number()
    .nonnegative("Actual budget must be zero or positive")
    .optional(),
});