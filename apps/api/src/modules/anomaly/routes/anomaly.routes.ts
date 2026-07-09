import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/auth.middleware";
import { roleMiddleware } from "../../auth/middleware/role.middleware";
import { validate } from "../../../middleware/validate.middleware";
import { updateAnomalyStatusSchema } from "../../../schemas/anomaly.schema";

import {
  listAnomalies,
  getAnomaly,
  updateAnomalyStatus,
  triggerScan,
} from "../controllers/anomaly.controller";

const router = Router();

router.get("/", authMiddleware, listAnomalies);
router.get("/:id", authMiddleware, getAnomaly);
router.patch(
  "/:id",
  authMiddleware,
  validate(updateAnomalyStatusSchema),
  updateAnomalyStatus
);
router.post("/scan", authMiddleware, roleMiddleware(["ADMIN"]), triggerScan);

export default router;
