import { useLocation } from "react-router-dom";

import {
  FaBell,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

import { supabase } from "../../lib/supabase";


export default function Navbar({
  role,
  userName,
  sidebarOpen,
  setSidebarOpen,
}: {
  role: string;
  userName: string;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  async function handleLogout() {
    await supabase.auth.signOut();

    window.location.href =
      "/login";
  }


  const location =
  useLocation();

const pageTitle =
  location.pathname === "/"
    ? "Dashboard"
    : location.pathname
        .replace("/", "")
        .replace(
          "-",
          " "
        )
        .replace(
          /\b\w/g,
          (c) =>
            c.toUpperCase()
        );



  return (
  <header className="sticky top-0 z-40 h-16 bg-white border-b shadow-sm flex items-center justify-between px-6">

    {/* Left */}

    <div className="flex items-center gap-4">



  <div>

    <h2 className="text-xl font-bold text-gray-800">
      {pageTitle}
    </h2>

    <p className="text-xs text-gray-500">
      Farm & Agent Management System
    </p>

  </div>

</div>

    {/* Right */}

    <div className="flex items-center gap-5">

      {/* Notification */}

      <button
        className="
        relative
        text-gray-500
        hover:text-emerald-600
        transition
      "
      >
        <FaBell
          size={20}
        />

        <span
          className="
          absolute
          -top-1
          -right-1
          h-2
          w-2
          rounded-full
          bg-red-500
        "
        />
      </button>

      {/* User */}

      <div className="flex items-center gap-3">

        <FaUserCircle
          size={36}
          className="text-emerald-600"
        />

        <div>

          <div className="font-semibold leading-none">
            {userName}
          </div>

          <div className="text-xs text-gray-500 capitalize">
            {role.replace("_", " ")}
          </div>

        </div>

      </div>

      {/* Logout */}

      <button
        onClick={
          handleLogout
        }
        className="
        flex
        items-center
        gap-2
        bg-red-500
        hover:bg-red-600
        text-white
        px-4
        py-2
        rounded-lg
        transition
      "
      >
        <FaSignOutAlt />

        Logout

      </button>

    </div>

  </header>
);
}