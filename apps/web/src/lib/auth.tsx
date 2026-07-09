import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { apiPost, ApiError } from "./api";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "HR" | "EMPLOYEE";
  tenantId: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean; mfaToken?: string }>;
  verifyMfa: (mfaToken: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredUser = (): User | null => {
  const raw = localStorage.getItem("user");
  return raw ? (JSON.parse(raw) as User) : null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readStoredUser());

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await apiPost("/auth/login", { email, password });
      if (res.mfaRequired) {
        return { mfaRequired: true, mfaToken: res.mfaToken as string };
      }
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      setUser(res.user);
      return { mfaRequired: false };
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw err;
    }
  }, []);

  const verifyMfa = useCallback(async (mfaToken: string, code: string) => {
    try {
      const res = await apiPost("/auth/mfa/verify-login", { mfaToken, code });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      setUser(res.user);
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, verifyMfa, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
