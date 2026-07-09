import "../../../../test/setupTestDb";
import request from "supertest";
import app from "../../../../app";
import { createTenant, createUser, signToken } from "../../../../test/helpers";
import { AnomalyFlag } from "../../models/anomalyFlag.model";

describe("GET /api/anomaly — tenant isolation", () => {
  it("never returns another tenant's anomaly flags", async () => {
    const tenantA = await createTenant("Tenant A");
    const tenantB = await createTenant("Tenant B");

    const adminA = await createUser(tenantA._id, "ADMIN");
    const adminB = await createUser(tenantB._id, "ADMIN");

    await AnomalyFlag.create({
      tenantId: tenantA._id,
      sourceType: "VENDOR_PAYMENT",
      sourceId: tenantA._id,
      metricValue: 999999,
      baseline: { mean: 100, stdDev: 10 },
      score: 12,
      severity: "HIGH",
    });

    const tokenA = signToken(adminA);
    const tokenB = signToken(adminB);

    const resA = await request(app)
      .get("/api/anomaly")
      .set("Authorization", `Bearer ${tokenA}`);
    const resB = await request(app)
      .get("/api/anomaly")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(resA.status).toBe(200);
    expect(resA.body.anomalies).toHaveLength(1);

    expect(resB.status).toBe(200);
    expect(resB.body.anomalies).toHaveLength(0);
  });

  it("rejects requests with no auth token", async () => {
    const res = await request(app).get("/api/anomaly");
    expect(res.status).toBe(401);
  });

  it("blocks non-admins from triggering a manual scan", async () => {
    const tenant = await createTenant("Scan Tenant");
    const employee = await createUser(tenant._id, "EMPLOYEE");
    const token = signToken(employee);

    const res = await request(app)
      .post("/api/anomaly/scan")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
