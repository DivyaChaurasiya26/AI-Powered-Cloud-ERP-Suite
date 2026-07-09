import jwt from "jsonwebtoken";
import { authMiddleware } from "../auth.middleware";
import { roleMiddleware } from "../role.middleware";

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authMiddleware", () => {
  it("rejects requests with no Authorization header", () => {
    const req: any = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an invalid token", () => {
    const req: any = { headers: { authorization: "Bearer not-a-real-token" } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the decoded user and calls next() for a valid token", () => {
    const token = jwt.sign(
      { id: "user1", role: "ADMIN", tenantId: "tenant1" },
      process.env.JWT_SECRET as string
    );
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: "user1", role: "ADMIN", tenantId: "tenant1" });
  });
});

describe("roleMiddleware", () => {
  it("returns 403 when the user's role is not allowed", () => {
    const req: any = { user: { role: "EMPLOYEE" } };
    const res = mockRes();
    const next = jest.fn();

    roleMiddleware(["ADMIN"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when the user's role is allowed", () => {
    const req: any = { user: { role: "ADMIN" } };
    const res = mockRes();
    const next = jest.fn();

    roleMiddleware(["ADMIN"])(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
