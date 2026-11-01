import { Outlet, Navigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

// একবার ওয়ার্কস্পেস লোড হয়ে গেলে মিনিমাইজ বা ট্যাব সুইচে আর লোডিং স্ক্রিন দেখাবে না
let workspaceInitialized = false;

export default function MainLayout() {
  const { role, userName, email, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lastKnownEmailRef = useRef<string | null>(email || null);

  if (email) {
    workspaceInitialized = true;
    lastKnownEmailRef.current = email;
  }

  // শুধুমাত্র প্রথমবার অ্যাপ ওপেন করার সময় লোডিং স্ক্রিন দেখাবে
  if (loading && !workspaceInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-100 p-4">
        <div className="w-full max-w-md text-center">
          <img
            src="/logo smart team.png"
            alt="Smart Team"
            className="w-24 sm:w-28 mx-auto mb-4 object-contain"
          />
          <p className="mt-3 text-gray-700 font-semibold text-base sm:text-lg">
            Nourish Smart Team
          </p>
          <p className="mt-6 text-xs sm:text-sm text-gray-500">
            Preparing your workspace...
          </p>
          <div className="mt-4 h-2 rounded-full bg-gray-200 overflow-hidden max-w-xs mx-auto">
            <div className="h-full w-1/2 bg-emerald-600 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // ব্যাকগ্রাউন্ড রিফ্রেশের সময় যদি সাময়িক loading থাকে কিন্তু আগে ইমেইল ছিল, তাহলে পেজ আনমাউন্ট করবে না
  const activeEmail = email || (loading ? lastKnownEmailRef.current : null);

  if (!activeEmail) {
    workspaceInitialized = false;
    lastKnownEmailRef.current = null;
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Slide-Over Sidebar Drawer */}
      <Sidebar
        role={role}
        userName={userName}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <Navbar
          role={role}
          userName={userName}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Mobile-friendly responsive padding (p-2 sm:p-4 md:p-6) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}