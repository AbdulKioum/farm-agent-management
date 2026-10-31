import React from "react";
import { useLocation } from "react-router-dom";
import { FaBell, FaBars } from "react-icons/fa";

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
}: {
  role?: string;
  userName?: string;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const location = useLocation();

  const pageTitle =
    location.pathname === "/"
      ? "Dashboard"
      : location.pathname
          .replace("/", "")
          .replaceAll("-", " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <header className="sticky top-0 z-40 h-14 sm:h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 sm:px-6">
      {/* Left: Menu Toggle Icon + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 flex items-center justify-center transition active:scale-95 shrink-0"
          aria-label="Toggle Menu"
        >
          <FaBars size={18} />
        </button>

        <div className="flex items-center gap-3">

  <img
    src="/logo smart team.png"
    alt="FAMS Logo"
    className="w-12 h-12 object-contain"
  />

  </div>

        <h2 className="text-base sm:text-xl font-bold text-slate-800 truncate">
          {pageTitle}
        </h2>
      </div>

      {/* Right: Notification Icon Only */}
      <div className="flex items-center">
        <button
          className="relative w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-emerald-600 flex items-center justify-center transition"
          aria-label="Notifications"
        >
          <FaBell size={19} />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}