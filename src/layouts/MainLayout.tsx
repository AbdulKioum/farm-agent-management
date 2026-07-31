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
    <div className="p-10">
      Loading...
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
    <div className="flex">
      <Sidebar role={role} />

      <div className="flex-1">
        <Navbar
          role={role}
          userName={userName}
        />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
</AuthContext.Provider>
);
}