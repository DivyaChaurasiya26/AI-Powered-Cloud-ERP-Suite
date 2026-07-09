import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Tenant } from "../modules/auth/models/tenant.model";
import { User } from "../modules/auth/models/user.model";
import { Vendor } from "../modules/procurement/vendor.model";

export const createTenant = async (companyName = "Test Co") => {
  const tenant = await Tenant.create({
    companyName,
    email: `${companyName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}@example.com`,
  });
  return tenant;
};

export const createUser = async (
  tenantId: any,
  role: "ADMIN" | "HR" | "EMPLOYEE" = "ADMIN",
  overrides: Record<string, any> = {}
) => {
  const password = await bcrypt.hash("password123", 10);
  const user = await User.create({
    tenantId,
    name: overrides.name || `${role} User`,
    email:
      overrides.email ||
      `${role.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    password,
    role,
  });
  return user;
};

export const signToken = (user: { _id: any; role: string; tenantId: any }) =>
  jwt.sign(
    { id: user._id, role: user.role, tenantId: user.tenantId },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

export const createVendor = async (tenantId: any, name = "Acme Supplies") => {
  return Vendor.create({
    tenantId,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, "-")}@example.com`,
  });
};
