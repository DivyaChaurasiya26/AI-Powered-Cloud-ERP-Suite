import { Request, Response } from "express";

import { Employee } from "../models/employee.model";

export const createEmployee = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const employee =
      await Employee.create({
        ...req.body,
        tenantId: user.tenantId,
      });

    res.status(201).json({
      message:
        "Employee created",
      employee,
    });

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

    const employees =
      await Employee.find({
        tenantId: user.tenantId,
      });

    res.json(employees);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getOrgChart = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const employees =
      await Employee.find({
        tenantId: user.tenantId,
      }).lean();

    const buildTree = (
      managerId: string | null = null
    ): any[] => {
      return employees
        .filter((emp: any) => {
          if (!managerId) {
            return !emp.managerId;
          }

          return (
            emp.managerId?.toString() ===
            managerId
          );
        })

        .map((emp: any) => ({
          _id: emp._id,
          fullName: emp.fullName,
          designation:
            emp.designation,
          department:
            emp.department,

          subordinates:
            buildTree(
              emp._id.toString()
            ),
        }));
    };

    const orgChart =
      buildTree();

    res.json(orgChart);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};