import { z } from "zod";

export const createEmployeeSchema = z.object({
  employeeId: z
    .string({ required_error: "Employee ID is required" })
    .min(1, "Employee ID is required"),

  fullName: z
    .string({ required_error: "Full name is required" })
    .min(2, "Full name must be at least 2 characters"),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),

  department: z.string().optional(),

  designation: z.string().optional(),

  salary: z.number().nonnegative("Salary must be zero or positive").optional(),

  managerId: z
    .string()
    .length(24, "managerId must be a valid ObjectId")
    .optional(),
});

export const applyLeaveSchema = z.object({
  leaveType: z.enum(
    ["SICK", "CASUAL", "ANNUAL", "MATERNITY", "PATERNITY", "UNPAID"],
    { required_error: "Leave type is required" }
  ),

  startDate: z
    .string({ required_error: "Start date is required" })
    .min(1, "Start date is required"),

  endDate: z
    .string({ required_error: "End date is required" })
    .min(1, "End date is required"),

  reason: z.string().optional(),
});