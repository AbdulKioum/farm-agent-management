import { Outlet, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

export default function MainLayout() {
  const { role, userName, email, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100">
        <div className="w-full max-w-md text-center">
          <img
            src="/logo.png"
            alt="FAMS"
            className="w-28 h-28 mx-auto mb-4"
          />
          <p className="mt-3 text-gray-600 text-lg">
            Farm & Agent Management System
          </p>
          <p className="mt-8 text-sm text-gray-500">
            Preparing your workspace...
          </p>
          <div className="mt-5 h-2 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full w-1/2 bg-emerald-600 animate-pulse rounded-full" />
          </div>
          <p className="mt-8 text-xs text-gray-400">Version 1.0</p>
        </div>
      </div>
    );
  }

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      
      <Sidebar
        role={role}
        userName={userName}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar
          role={role}
          userName={userName}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}