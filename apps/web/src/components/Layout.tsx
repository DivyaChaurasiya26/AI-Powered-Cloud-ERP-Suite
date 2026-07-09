import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import {
  IconDashboard,
  IconHr,
  IconPayroll,
  IconFinance,
  IconInventory,
  IconProjects,
  IconNotifications,
  IconAnomalies,
  IconApprovals,
  IconAudit,
  IconLogout,
} from "./icons";

const NAV = [
  { to: "/", end: true, label: "Dashboard", icon: <IconDashboard /> },
  { to: "/hr", label: "HR", icon: <IconHr /> },
  { to: "/payroll", label: "Payroll", icon: <IconPayroll /> },
  { to: "/finance", label: "Finance", icon: <IconFinance /> },
  { to: "/inventory", label: "Inventory", icon: <IconInventory /> },
  { to: "/projects", label: "Projects", icon: <IconProjects /> },
  { to: "/notifications", label: "Notifications", icon: <IconNotifications /> },
  { to: "/anomalies", label: "Anomalies", icon: <IconAnomalies /> },
  { to: "/approvals", label: "Approvals", icon: <IconApprovals /> },
  { to: "/audit", label: "Audit", icon: <IconAudit /> },
];

export const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="mark">E</span>
          <h1>ERP Suite</h1>
        </div>
        <nav>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="who" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span className="name" style={{ display: "block" }}>{user?.name}</span>
              <span className="muted">{user?.role}</span>
            </div>
            <ThemeToggle />
          </div>
          <button onClick={logout} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <IconLogout />
            Log out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
};
