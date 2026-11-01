import { useState } from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getUserRole } from "../../services/userService";

export default function LoginPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

    const navigate =
  useNavigate();

const location =
  useLocation();

const from =
  (
    location.state as any
  )?.from?.pathname || "/";

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

  
  navigate(
  from,
  {
    replace: true,
  }
);
}

 return (
  <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-emerald-100 flex items-center justify-center p-6 relative overflow-hidden">

    {/* Background Blur */}
    <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl"></div>

    <div className="absolute -bottom-40 -right-40 w-[420px] h-[420px] bg-emerald-300/30 rounded-full blur-3xl"></div>

    {/* Login Card */}
    <div className="relative w-full max-w-md">

      <div className="rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60 p-8">

        {/* Logo */}
        <div className="text-center mb-8">

          <div className="text-6xl mb-3">
            <img
            src="/logo smart team.png"
            alt="Smart Team"
            className="w-28 mx-auto mb-4"
          />
          </div>

          <h3 className="text-3xl font-bold text-slate-800">
            Welcome
          </h3>

          

        </div>

        {/* Email */}
        <div className="mb-4">

          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

        </div>

        {/* Password */}
        <div className="mb-6">

          <label className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-[1.02] hover:shadow-xl"
        >
          Sign In
        </button>

        {/* Footer */}
        <div className="mt-8 text-center">

          <p className="text-xs text-slate-500">
            © 2026 Nourish Smart Team
          </p>

        </div>

      </div>

    </div>

  </div>
);
}