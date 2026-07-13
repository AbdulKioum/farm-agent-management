import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserRole } from "../services/userService";

import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import {
  AuthContext,
} from "../context/AuthContext";

export default function MainLayout() {
  const [role, setRole] =
    useState("");

  const [userName, setUserName] =
    useState("");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user?.email) return;

    const userData =
      await getUserRole(
        user.email
      );
      
      console.log("Auth User:", user);

console.log("Email:",
  user?.email);

console.log("User Data:",
  userData);

    if (userData) {
      setRole(userData.role);
      setUserName(
        userData.full_name
      );
    }
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