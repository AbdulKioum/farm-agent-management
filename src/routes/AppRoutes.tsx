import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import ReportsPage from "../pages/reports/ReportsPage";
import MainLayout from "../layouts/MainLayout";

import LoginPage from "../pages/auth/LoginPage";

import DashboardPage from "../pages/dashboard/DashboardPage";
import CompaniesPage from "../pages/companies/CompaniesPage";
import AgentsPage from "../pages/agents/AgentsPage";
import FarmersPage from "../pages/farmers/FarmersPage";
import VisitsPage from "../pages/visits/VisitsPage";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={<DashboardPage />}
          />

          <Route
            path="/companies"
            element={<CompaniesPage />}
          />

          <Route
            path="/agents"
            element={<AgentsPage />}
          />

          <Route
            path="/farmers"
            element={<FarmersPage />}
          />
          <Route
          path="reports"
          element={<ReportsPage />}
          />
          <Route
            path="/visits"
            element={<VisitsPage />}
          />
          <Route
            path="/reports"
            element={<ReportsPage />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}