import { Task } from "../models/task.model";
import { Employee } from "../../hr/models/employee.model";

/**
 * Calculates per-employee utilisation across all projects
 * for the authenticated tenant.
 *
 * Returns data shaped for the heatmap chart:
 * xLabels = project names, yLabels = employee names,
 * cells = planned hours per employee per project.
 */
export const getUtilisationHeatmap = async (
  tenantId: string
) => {

  const rows = await Task.aggregate([
    {
      $match: {
        tenantId,
        assigneeId: { $ne: null },
      },
    },
    {
      $group: {
        _id: {
          assigneeId: "$assigneeId",
          projectId: "$projectId",
        },
        totalPlannedHours: {
          $sum: "$plannedHours",
        },
        totalActualHours: {
          $sum: "$actualHours",
        },
      },
    },
  ]);

  if (rows.length === 0) {
    return {
      xLabels: [],
      yLabels: [],
      cells: [],
    };
  }

  const projectIdSet = new Set<string>();
  const employeeIdSet = new Set<string>();

  rows.forEach((r) => {
    projectIdSet.add(r._id.projectId.toString());
    employeeIdSet.add(r._id.assigneeId.toString());
  });

  const projectIds = Array.from(projectIdSet);
  const employeeIds = Array.from(employeeIdSet);

  const employees = await Employee.find({
    _id: { $in: employeeIds },
  }).lean();

  const employeeMap = new Map<string, string>();
  employees.forEach((e: any) => {
    employeeMap.set(
      e._id.toString(),
      e.fullName || e.employeeId
    );
  });

  const { Project } = await import(
    "../models/project.model"
  );

  const projects = await Project.find({
    _id: { $in: projectIds },
  }).lean();

  const projectMap = new Map<string, string>();
  projects.forEach((p: any) => {
    projectMap.set(p._id.toString(), p.name);
  });

  const xLabels = projectIds.map(
    (id) => projectMap.get(id) || id
  );
  const yLabels = employeeIds.map(
    (id) => employeeMap.get(id) || id
  );

  const cells = rows.map((r) => ({
    x: projectIds.indexOf(
      r._id.projectId.toString()
    ),
    y: employeeIds.indexOf(
      r._id.assigneeId.toString()
    ),
    plannedHours: r.totalPlannedHours,
    actualHours: r.totalActualHours,
  }));

  return {
    xLabels,
    yLabels,
    cells,
  };
};