import { Request, Response } from "express";
import { Employee } from "../models/employee.model";

export const createEmployee = async (
  req: Request,
  res: Response
) => {
    console.log(req.body);
  try {
    const user = (req as any).user;

    const employee = await Employee.create({
      ...req.body,
        employeeId:
    "EMP-" + Math.floor(1000 + Math.random() * 9000),
      tenantId: user.tenantId,
    });

    res.status(201).json(employee);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getEmployees = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const employees = await Employee.find({
      tenantId: user.tenantId,
    });

    res.json(employees);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};