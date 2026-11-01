import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
import FarmerStatusPage from "../pages/farmers/FarmerStatusPage";
import DocAgentsPage from "../pages/doc/DocAgentsPage";
import DocTrackingPage from "../pages/doc/DocTrackingPage";

export default function AppRoutes() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      currentUserIdRef.current = data.session?.user?.id || null;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        const newUserId = newSession?.user?.id || null;

        // Browser minimize ba tab switch korle TOKEN_REFRESHED / SIGNED_IN fire hoy.
        // Jodi aki user thake, tahole state update kore reload/re-render korbo na.
        if (event === "SIGNED_OUT") {
          currentUserIdRef.current = null;
          setSession(null);
        } else if (newUserId !== currentUserIdRef.current) {
          currentUserIdRef.current = newUserId;
          setSession(newSession);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Loading...
      </div>
    );
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
          <Route path="/sub-agents" element={<SubAgentPage />} />
          <Route path="/retailers" element={<RetailersPage />} />
          <Route path="/farmers" element={<FarmersPage />} />
          <Route path="/visits" element={<VisitsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/farmer-status" element={<FarmerStatusPage />} />
          <Route path="/doc-agents" element={<DocAgentsPage />} />
          <Route path="/doc-tracking" element={<DocTrackingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}