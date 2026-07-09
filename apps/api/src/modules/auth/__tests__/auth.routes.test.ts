import "../../../test/setupTestDb";
import request from "supertest";
import app from "../../../app";
import { createTenant } from "../../../test/helpers";

describe("POST /api/auth/register and /api/auth/login", () => {
  it("registers a new user under a tenant and then logs in", async () => {
    const tenant = await createTenant("Auth Test Co");

    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: `jane-${Date.now()}@example.com`,
      password: "password123",
      tenantId: String(tenant._id),
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.user.password).toBeUndefined();

    const loginRes = await request(app).post("/api/auth/login").send({
      email: registerRes.body.user.email,
      password: "password123",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.user.email).toBe(registerRes.body.user.email);
  });

  it("returns 400 for login with wrong password", async () => {
    const tenant = await createTenant("Auth Test Co 2");
    const email = `wrongpass-${Date.now()}@example.com`;

    await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email,
      password: "password123",
      tenantId: String(tenant._id),
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "wrong-password" });

    expect(loginRes.status).toBe(400);
  });
});
