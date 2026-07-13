import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserRole } from "../../services/userService";

export default function LoginPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleLogin() {
  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    alert(error.message);
    return;
  }

  const userData =
    await getUserRole(email);

  if (
    userData?.status ===
    "inactive"
  ) {
    alert(
      "Your account is inactive. Contact administrator."
    );

    await supabase.auth.signOut();

    return;
  }

  window.location.href = "/";
}

  return (
    <div className="min-h-screen flex items-center justify-center">

      <div className="border rounded-lg p-6 w-[400px]">

        <h1 className="text-2xl font-bold mb-4">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="border p-2 w-full mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="border p-2 w-full mb-3"
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>

      </div>

    </div>
  );
}