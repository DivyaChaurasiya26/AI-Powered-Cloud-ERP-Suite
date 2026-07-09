import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1]; // Bearer token

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    // An mfa_pending token only authorizes the MFA-verify endpoint (which
    // reads/validates it directly, not through this middleware) — reject it
    // here so it can't be used against any real protected route.
    if (decoded.purpose === "mfa_pending") {
      return res.status(401).json({
        message: "MFA verification required",
      });
    }

    (req as any).user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};