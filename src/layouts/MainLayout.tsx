import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserRole } from "../services/userService";

import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import {
  AuthContext,
} from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function MainLayout() {
  const [role, setRole] =
    useState("");

  const [userName, setUserName] =
    useState("");

    const [loading, setLoading] =
  useState(true);

const [loggedIn, setLoggedIn] =
  useState(false);

const [sidebarOpen, setSidebarOpen] =
  useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {

  const {
    data: { session },
  } =
    await supabase.auth.getSession();

  if (!session) {

    setLoggedIn(false);
    setLoading(false);

    return;

  }

  setLoggedIn(true);

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user?.email) {

    setLoading(false);

    return;

  }

  const userData =
    await getUserRole(
      user.email
    );

  if (userData) {

    setRole(
      userData.role
    );

    setUserName(
      userData.full_name
    );

  }

  setLoading(false);

}

if (loading) {

  return (

    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gradient-to-br
      from-green-50
      via-white
      to-green-100
      "
    >

      <div className="w-full max-w-md text-center">

        <div
          className="
          text-7xl
          animate-pulse
          mb-5
          "
        >
          🌿
        </div>

        <h1
          className="
          text-5xl
          font-extrabold
          tracking-wide
          text-emerald-700
          "
        >
          FAMS
        </h1>

        <p
          className="
          mt-3
          text-gray-600
          text-lg
          "
        >
          Farm & Agent Management System
        </p>

        <p
          className="
          mt-8
          text-sm
          text-gray-500
          "
        >
          Preparing your workspace...
        </p>

        <div
          className="
          mt-5
          h-2
          rounded-full
          bg-gray-200
          overflow-hidden
          "
        >

          <div
            className="
            h-full
            w-1/2
            bg-emerald-600
            animate-pulse
            rounded-full
            "
          />

        </div>

        <p
          className="
          mt-8
          text-xs
          text-gray-400
          "
        >
          Version 1.0
        </p>

      </div>

    </div>

  );

}

if (!loggedIn) {

  return (
    <Navigate
      to="/login"
      replace
    />
  );

}


  return (
  <AuthContext.Provider
    value={{
      role,
      userName,
    }}
  >
    <div className="flex h-screen overflow-hidden">
      <Sidebar
  role={role}
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
</AuthContext.Provider>
);
}