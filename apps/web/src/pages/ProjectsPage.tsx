import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch } from "../lib/api";
import { Tabs } from "../components/Tabs";
import { SeverityBadge } from "../components/SeverityBadge";
import { formatCurrency } from "../components/StatTile";

interface Project {
  _id: string;
  name: string;
  description?: string;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
  startDate?: string;
  endDate?: string;
  plannedBudget: number;
  actualBudget: number;
}

const ProjectsTab = ({ projects, onChanged }: { projects: Project[]; onChanged: () => void }) => {
  const [form, setForm] = useState({ name: "", description: "", startDate: "", endDate: "", plannedBudget: "" });
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await apiPost("/projects", {
        name: form.name,
        description: form.description,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        plannedBudget: Number(form.plannedBudget) || 0,
      });
      setForm({ name: "", description: "", startDate: "", endDate: "", plannedBudget: "" });
      onChanged();
    } catch (err: any) {
      setMsg(err.message || "Failed to create project");
    }
  };

  const setStatus = async (id: string, status: Project["status"]) => {
    await apiPatch(`/projects/${id}`, { status });
    onChanged();
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>New project</h3>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          <input placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input type="number" placeholder="Planned budget" value={form.plannedBudget} onChange={(e) => setForm({ ...form, plannedBudget: e.target.value })} />
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          <button className="primary" type="submit">Create project</button>
        </form>
        {msg && <p className="error-text">{msg}</p>}
      </div>
      <div className="card">
        {projects.length === 0 && <p className="muted">No projects yet.</p>}
        {projects.length > 0 && (
          <table>
            <thead><tr><th>Name</th><th>Planned</th><th>Actual</th><th>Status</th><th /></tr></thead>
            <tbody>
              {projects.map((p) => {
                const overrun = p.plannedBudget > 0 && p.actualBudget > p.plannedBudget * 1.1;
                return (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{formatCurrency(p.plannedBudget)}</td>
                    <td>
                      {formatCurrency(p.actualBudget)}
                      {overrun && <span style={{ marginLeft: 6 }}><SeverityBadge label="CRITICAL" /></span>}
                    </td>
                    <td><SeverityBadge label={p.status} /></td>
                    <td>
                      <select value={p.status} onChange={(e) => setStatus(p._id, e.target.value as Project["status"])}>
                        <option value="PLANNING">Planning</option>
                        <option value="ACTIVE">Active</option>
                        <option value="ON_HOLD">On hold</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

interface Task {
  _id: string;
  projectId: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  plannedHours: number;
  actualHours: number;
  dueDate?: string;
}

const TasksTab = ({ projects }: { projects: Project[] }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ projectId: "", title: "", plannedHours: "", dueDate: "" });
  const [msg, setMsg] = useState("");

  const load = () => apiGet("/tasks").then(setTasks).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await apiPost("/tasks", {
        projectId: form.projectId,
        title: form.title,
        plannedHours: Number(form.plannedHours) || 0,
        dueDate: form.dueDate || undefined,
      });
      setForm({ projectId: "", title: "", plannedHours: "", dueDate: "" });
      load();
    } catch (err: any) {
      setMsg(err.message || "Failed to create task");
    }
  };

  const setStatus = async (id: string, status: Task["status"]) => {
    await apiPatch(`/tasks/${id}`, { status });
    load();
  };

  const projectName = (id: string) => projects.find((p) => p._id === id)?.name || "—";

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>New task</h3>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
            <option value="">Project…</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <input placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input type="number" placeholder="Planned hours" value={form.plannedHours} onChange={(e) => setForm({ ...form, plannedHours: e.target.value })} />
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <button className="primary" type="submit">Create task</button>
        </form>
        {msg && <p className="error-text">{msg}</p>}
      </div>
      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && tasks.length === 0 && <p className="muted">No tasks yet.</p>}
        {tasks.length > 0 && (
          <table>
            <thead><tr><th>Task</th><th>Project</th><th>Hours (planned/actual)</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id}>
                  <td>{t.title}</td>
                  <td className="muted">{projectName(t.projectId)}</td>
                  <td className="muted">{t.plannedHours} / {t.actualHours}</td>
                  <td className="muted">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                  <td>
                    <select value={t.status} onChange={(e) => setStatus(t._id, e.target.value as Task["status"])}>
                      <option value="TODO">To do</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="DONE">Done</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

interface Milestone {
  _id: string;
  projectId: string;
  title: string;
  dueDate: string;
  status: "PENDING" | "ACHIEVED" | "MISSED";
}

const MilestonesTab = ({ projects }: { projects: Project[] }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ projectId: "", title: "", dueDate: "" });
  const [msg, setMsg] = useState("");

  const load = () => apiGet("/milestones").then(setMilestones).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await apiPost("/milestones", form);
      setForm({ projectId: "", title: "", dueDate: "" });
      load();
    } catch (err: any) {
      setMsg(err.message || "Failed to create milestone");
    }
  };

  const setStatus = async (id: string, status: Milestone["status"]) => {
    await apiPatch(`/milestones/${id}`, { status });
    load();
  };

  const projectName = (id: string) => projects.find((p) => p._id === id)?.name || "—";

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>New milestone</h3>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
            <option value="">Project…</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <input placeholder="Milestone title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          <button className="primary" type="submit">Create milestone</button>
        </form>
        {msg && <p className="error-text">{msg}</p>}
      </div>
      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && milestones.length === 0 && <p className="muted">No milestones yet.</p>}
        {milestones.length > 0 && (
          <table>
            <thead><tr><th>Milestone</th><th>Project</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              {milestones.map((m) => (
                <tr key={m._id}>
                  <td>{m.title}</td>
                  <td className="muted">{projectName(m.projectId)}</td>
                  <td className="muted">{new Date(m.dueDate).toLocaleDateString()}</td>
                  <td>
                    <select value={m.status} onChange={(e) => setStatus(m._id, e.target.value as Milestone["status"])}>
                      <option value="PENDING">Pending</option>
                      <option value="ACHIEVED">Achieved</option>
                      <option value="MISSED">Missed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const load = () => apiGet("/projects").then(setProjects);
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2>Projects</h2>
      <Tabs
        tabs={[
          { key: "projects", label: "Projects", content: <ProjectsTab projects={projects} onChanged={load} /> },
          { key: "tasks", label: "Tasks", content: <TasksTab projects={projects} /> },
          { key: "milestones", label: "Milestones", content: <MilestonesTab projects={projects} /> },
        ]}
      />
    </div>
  );
};
