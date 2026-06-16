import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

// Reusable middleware factory.
// Usage: router.post("/register", validate(registerSchema), register)
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      res.status(400).json({
        message: "Validation failed",
        errors,
      });
      return;
    }

    // Replace req.body with parsed+coerced data
    req.body = result.data;
    next();
  };