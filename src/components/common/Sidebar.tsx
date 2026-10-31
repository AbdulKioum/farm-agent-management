import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaUsers,
  FaSitemap,
  FaStore,
  FaUserFriends,
  FaClipboardList,
  FaChartBar,
  FaUserShield,
  FaUserCheck,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import { supabase } from "../../lib/supabase";

export default function Sidebar({
  role,
  userName,
  sidebarOpen,
  setSidebarOpen,
}: {
  role: string;
  userName?: string;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const location = useLocation();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  // Menu link-e click korle sidebar auto close hobe
  function handleMenuClick() {
    setSidebarOpen(false);
  }

  const menuClass = (path: string) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      location.pathname === path
        ? "bg-emerald-600 text-white shadow-sm"
        : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
    }`;

  return (
    <>
      {/* Backdrop Overlay (Baire click korle menu close hobe) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity"
        />
      )}

      {/* Slide-out Left Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 max-w-[80vw] bg-white border-r border-slate-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header: Logo & Close Button */}
        <div className="flex items-center justify-between px-4 h-14 sm:h-16 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo smart team.png"
              alt="Logo"
              className="w-9 h-9 object-contain"
            />
            <span className="font-bold text-slate-800 text-base tracking-tight">
              Menu
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
            aria-label="Close Sidebar"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto flex flex-col gap-1 px-3 py-3">
          {/* Dashboard */}
          <Link
            to="/"
            onClick={handleMenuClick}
            className={menuClass("/")}
          >
            <FaHome className="text-base shrink-0" />
            <span>Dashboard</span>
          </Link>

          {/* Management Section */}
          {(role === "super_admin" ||
            role === "admin" ||
            role === "manager") && (
            <>
              <div className="mt-3 mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Management
              </div>

              <Link
                to="/companies"
                onClick={handleMenuClick}
                className={menuClass("/companies")}
              >
                <FaBuilding className="text-base shrink-0" />
                <span>Companies</span>
              </Link>

              <Link
                to="/agents"
                onClick={handleMenuClick}
                className={menuClass("/agents")}
              >
                <FaUsers className="text-base shrink-0" />
                <span>Agents</span>
              </Link>

              <Link
                to="/sub-agents"
                onClick={handleMenuClick}
                className={menuClass("/sub-agents")}
              >
                <FaSitemap className="text-base shrink-0" />
                <span>Sub Agents</span>
              </Link>

              <Link
                to="/retailers"
                onClick={handleMenuClick}
                className={menuClass("/retailers")}
              >
                <FaStore className="text-base shrink-0" />
                <span>Retailers</span>
              </Link>
            </>
          )}

          {/* Farmers & Visits */}
          {(role === "super_admin" ||
            role === "admin" ||
            role === "manager" ||
            role === "officer" ||
            role === "agent") && (
            <>
              <div className="mt-3 mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Field Operations
              </div>

              <Link
                to="/farmers"
                onClick={handleMenuClick}
                className={menuClass("/farmers")}
              >
                <FaUserFriends className="text-base shrink-0" />
                <span>Farmers</span>
              </Link>

              <Link
                to="/farmer-status"
                onClick={handleMenuClick}
                className={menuClass("/farmer-status")}
              >
                <FaUserCheck className="text-base shrink-0" />
                <span>Farmer Status</span>
              </Link>

              <Link
                to="/visits"
                onClick={handleMenuClick}
                className={menuClass("/visits")}
              >
                <FaClipboardList className="text-base shrink-0" />
                <span>Vet Visits</span>
              </Link>
            </>
          )}

          {/* Analytics Section */}
          <div className="mt-3 mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Analytics
          </div>

          <Link
            to="/reports"
            onClick={handleMenuClick}
            className={menuClass("/reports")}
          >
            <FaChartBar className="text-base shrink-0" />
            <span>Reports</span>
          </Link>

          {/* Administration Section */}
          {(role === "super_admin" || role === "admin") && (
            <>
              <div className="mt-3 mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Administration
              </div>

              <Link
                to="/users"
                onClick={handleMenuClick}
                className={menuClass("/users")}
              >
                <FaUserShield className="text-base shrink-0" />
                <span>Users</span>
              </Link>
            </>
          )}
        </nav>

        {/* Bottom Footer: User Name, Role & Logout */}
        <div className="mt-auto border-t border-slate-200 p-3.5 bg-slate-50/70 space-y-3 shrink-0">
          <div className="flex items-center gap-2.5 px-1">
            <FaUserCircle className="text-emerald-600 text-3xl shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-sm text-slate-800 truncate">
                {userName || "User"}
              </div>
              <div className="text-xs text-emerald-700 font-medium capitalize truncate">
                {role ? role.replaceAll("_", " ") : "Officer"}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 active:scale-[0.99] text-white py-2 px-3 rounded-xl text-xs sm:text-sm font-medium shadow-sm transition"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}