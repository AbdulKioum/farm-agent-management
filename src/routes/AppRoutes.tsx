import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import MainLayout from "../layouts/MainLayout";
import LoginPage from "../pages/auth/LoginPage";

import DashboardPage from "../pages/dashboard/DashboardPage";
import CompaniesPage from "../pages/companies/CompaniesPage";
import AgentsPage from "../pages/agents/AgentsPage";
import SubAgentPage from "../pages/sub-agents/SubAgentPage";
import RetailersPage from "../pages/retailers/RetailerPage"; 
import FarmersPage from "../pages/farmers/FarmersPage";
import VisitsPage from "../pages/visits/VisitsPage";
import ReportsPage from "../pages/reports/ReportsPage";
import UsersPage from "../pages/users/UsersPage";

export default function AppRoutes() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Layout Routes */}
        <Route
          element={
            session ? (
              <MainLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          
          {/* New Routes Added */}
          <Route path="/sub-agents" element={<SubAgentPage />} />
          <Route path="/retailers" element={<RetailersPage />} /> {/* ২. এই রুটটি যোগ করা হলো */}

          <Route path="/farmers" element={<FarmersPage />} />
          <Route path="/visits" element={<VisitsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}