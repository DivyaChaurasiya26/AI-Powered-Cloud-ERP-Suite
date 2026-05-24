import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, tenantId } = req.body;
     console.log("REQ BODY (REGISTER):", req.body);

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

    res.status(201).json({
      message: "User registered successfully",
      user,
    });

  }catch (error: any) {
  console.log("REGISTER ERROR 👉", error);

  return res.status(500).json({
    message: error.message,
  });
}
};



export const login = async (req: Request, res: Response) => {
     console.log("REQ BODY (REGISTER):", req.body);
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

    // 3. create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });

  } catch (error: any) {
  console.log("LOGIN ERROR 👉", error);

  return res.status(500).json({
    message: error.message,
  });
}
};