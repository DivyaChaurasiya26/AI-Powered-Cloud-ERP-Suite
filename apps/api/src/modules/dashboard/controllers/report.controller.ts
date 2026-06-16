import { Request, Response } from "express";

import {
  generateReportPDF,
  generateReportCSV,
} from "../services/report.service";

import { reportQueue } from "../queues/report.queue";

import { ReportSchedule } from "../models/reportSchedule.model";

export const downloadReport = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const {
      reportType,
      format = "pdf",
      ...filters
    } = req.query as any;

    if (!reportType) {
      return res.status(400).json({
        message: "reportType is required",
      });
    }

    if (format === "excel") {
      const csv = await generateReportCSV(
        user.tenantId,
        reportType,
        filters
      );

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${reportType}-${Date.now()}.csv"`
      );
      return res.send(csv);
    }

    const pdfBuffer = await generateReportPDF(
      user.tenantId,
      reportType,
      filters
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${reportType}-${Date.now()}.pdf"`
    );
    res.send(pdfBuffer);

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const scheduleReport = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const schedule = await ReportSchedule.create({
      ...req.body,
      tenantId: user.tenantId,
    });

    res.status(201).json({
      message: "Report schedule created",
      schedule,
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSchedules = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const schedules = await ReportSchedule.find({
      tenantId: user.tenantId,
      isActive: true,
    });

    res.json({ schedules });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const runScheduleNow = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const schedule = await ReportSchedule.findOne({
      _id: req.params.scheduleId,
      tenantId: user.tenantId,
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    await reportQueue.add(
      "generateReport",
      {
        tenantId: user.tenantId,
        reportType: schedule.reportType,
        format: schedule.format,
        recipientEmail: schedule.recipientEmail,
        filters: schedule.filters,
        scheduleId: schedule._id,
      },
      { attempts: 3 }
    );

    res.status(202).json({
      message: "Report job queued",
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};