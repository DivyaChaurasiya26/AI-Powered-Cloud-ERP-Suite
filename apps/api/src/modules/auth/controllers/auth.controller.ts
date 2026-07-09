import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import { generateSecret, otpauthUrl, verifyToken } from "../services/totp.service";

const issueSessionToken = (user: { _id: unknown; role: string; tenantId: unknown }) =>
  jwt.sign(
    { id: user._id, role: user.role, tenantId: user.tenantId },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, tenantId } = req.body;

    // 1. check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // sanitize tenantId
    const cleanTenantId =
      tenantId && typeof tenantId === "string" && tenantId.length === 24
        ? tenantId
        : undefined;

    // 2. hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      tenantId: cleanTenantId,
    });

    // Strip password hash from response
    const { password: _, ...safeUser } = user.toObject();

    res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // 2. compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // 3. second factor — if enabled, don't issue a session token yet
    if (user.mfaEnabled) {
      const mfaToken = jwt.sign(
        { id: user._id, purpose: "mfa_pending" },
        process.env.JWT_SECRET as string,
        { expiresIn: "5m" }
      );

      return res.status(200).json({
        message: "MFA verification required",
        mfaRequired: true,
        mfaToken,
      });
    }

    // 4. create session token
    const token = issueSessionToken(user);

    // Strip password hash from response
    const { password: _, ...safeUser } = user.toObject();

    res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyMfaLogin = async (req: Request, res: Response) => {
  try {
    const { mfaToken, code } = req.body;

    let decoded: any;
    try {
      decoded = jwt.verify(mfaToken, process.env.JWT_SECRET as string);
    } catch {
      return res.status(401).json({ message: "MFA session expired — log in again" });
    }

    if (decoded.purpose !== "mfa_pending") {
      return res.status(400).json({ message: "Invalid MFA token" });
    }

    const user = await User.findById(decoded.id).select("+mfaSecret");
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({ message: "MFA is not enabled for this account" });
    }

    if (!verifyToken(user.mfaSecret, code)) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const token = issueSessionToken(user);
    const { password: _, mfaSecret: __, ...safeUser } = user.toObject();

    res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/mfa/setup — generates a secret and returns the otpauth://
// URL for the user to add to an authenticator app. MFA is NOT enabled yet;
// it only turns on once verifySetup below confirms the app produces a
// matching code, so a user can't lock themselves out mid-setup.
export const setupMfa = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const user = await User.findById(authUser.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const secret = generateSecret();
    user.mfaSecret = secret;
    user.mfaEnabled = false;
    await user.save();

    res.json({
      secret,
      otpauthUrl: otpauthUrl(secret, user.email),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const confirmMfaSetup = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const { code } = req.body;

    const user = await User.findById(authUser.id).select("+mfaSecret");
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ message: "Run MFA setup first" });
    }

    if (!verifyToken(user.mfaSecret, code)) {
      return res.status(400).json({ message: "Invalid code — check your authenticator app and try again" });
    }

    user.mfaEnabled = true;
    await user.save();

    res.json({ message: "MFA enabled" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const disableMfa = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const { code } = req.body;

    const user = await User.findById(authUser.id).select("+mfaSecret");
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({ message: "MFA is not enabled" });
    }

    if (!verifyToken(user.mfaSecret, code)) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();

    res.json({ message: "MFA disabled" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMfaStatus = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const user = await User.findById(authUser.id);
    res.json({ mfaEnabled: !!user?.mfaEnabled });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};