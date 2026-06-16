import { Task } from "../models/task.model";

/**
 * Detects whether adding `newDepId` as a dependency of `taskId`
 * would introduce a cycle in the task dependency graph.
 *
 * Performance fix: pre-loads ALL tasks for the project in one query,
 * then runs DFS entirely in-memory. Replaces the previous O(n) pattern
 * of one Task.findById() per graph node per DFS iteration.
 */
export const wouldCreateCycle = async (
  taskId: string,
  newDepId: string
): Promise<boolean> => {

  // A task cannot depend on itself
  if (taskId === newDepId) {
    return true;
  }

  // Fetch the target task to get its projectId, then bulk-load the project graph
  const targetTask = await Task.findById(newDepId)
    .select("projectId dependsOn")
    .lean() as any;

  if (!targetTask) {
    return false;
  }

  // Single query: load all tasks in this project (not just the traversal path)
  const allTasks = await Task.find({ projectId: targetTask.projectId })
    .select("_id dependsOn")
    .lean() as any[];

  // Build an in-memory adjacency map: taskId -> dependsOn[]
  const graph = new Map<string, string[]>();
  for (const t of allTasks) {
    graph.set(
      t._id.toString(),
      (t.dependsOn || []).map((id: any) => id.toString())
    );
  }

  // DFS in memory — zero additional DB calls
  const visited = new Set<string>();

  const dfs = (currentId: string): boolean => {
    if (currentId === taskId) {
      return true;
    }
    if (visited.has(currentId)) {
      return false;
    }
    visited.add(currentId);
    for (const depId of graph.get(currentId) || []) {
      if (dfs(depId)) {
        return true;
      }
    }
    return false;
  };

  return dfs(newDepId);
};