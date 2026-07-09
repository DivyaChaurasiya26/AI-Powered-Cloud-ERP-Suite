import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AnomaliesPage } from "./pages/AnomaliesPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { HrPage } from "./pages/HrPage";
import { PayrollPage } from "./pages/PayrollPage";
import { FinancePage } from "./pages/FinancePage";
import { InventoryPage } from "./pages/InventoryPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AuditLogPage } from "./pages/AuditLogPage";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<DashboardPage />} />
      <Route path="/hr" element={<HrPage />} />
      <Route path="/payroll" element={<PayrollPage />} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/anomalies" element={<AnomaliesPage />} />
      <Route path="/approvals" element={<ApprovalsPage />} />
      <Route path="/audit" element={<AuditLogPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
