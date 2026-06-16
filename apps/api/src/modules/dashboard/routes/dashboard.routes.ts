import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

import {
  getKPIs,
  getSnapshot,
  getAnalytics,
  drillDown,
} from "../controllers/dashboard.controller";

import {
  addWidget,
  listWidgets,
  editWidget,
  removeWidget,
  getWidgetData,
} from "../controllers/widget.controller";

import {
  downloadReport,
  scheduleReport,
  getSchedules,
  runScheduleNow,
} from "../controllers/report.controller";

import { streamDashboard } from "../controllers/sse.controller";

const router = Router();

router.get("/kpis", authMiddleware, getKPIs);
router.get("/snapshot", authMiddleware, getSnapshot);
router.get("/analytics/:dataSource", authMiddleware, getAnalytics);
router.post("/drilldown", authMiddleware, drillDown);

router.post("/widgets", authMiddleware, addWidget);
router.get("/widgets", authMiddleware, listWidgets);
router.patch("/widgets/:id", authMiddleware, editWidget);
router.delete("/widgets/:id", authMiddleware, removeWidget);
router.get("/widgets/:id/data", authMiddleware, getWidgetData);

router.get("/reports/download", authMiddleware, downloadReport);
router.post("/reports/schedule", authMiddleware, scheduleReport);
router.get("/reports/schedules", authMiddleware, getSchedules);
router.post("/reports/run/:scheduleId", authMiddleware, runScheduleNow);

router.get("/live", authMiddleware, streamDashboard);

export default router;