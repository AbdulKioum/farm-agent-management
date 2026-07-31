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
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import UsersPage
from "../pages/users/UsersPage";


export default function AppRoutes() {

  const [loading, setLoading] =
  useState(true);

const [session, setSession] =
  useState<any>(null);

useEffect(() => {
  supabase.auth
    .getSession()
    .then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

  const {
    data: listener,
  } =
    supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

  return () =>
    listener.subscription.unsubscribe();
}, []);

if (loading) {
  return <div>Loading...</div>;
}

  return (
    <BrowserRouter>
      <Routes>

        <Route
  path="/login"
  element={
    <LoginPage />
  }
/>

        <Route
  element={
    session ? (
      <MainLayout />
    ) : (
      <Navigate
        to="/login"
        replace
      />
    )
  }
>

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

          <Route
          path="/users"
          element={<UsersPage />}
        />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}