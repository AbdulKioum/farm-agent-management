import { useState } from "react";
import { signIn } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleLogin() {
    const { error } = await signIn(
      email,
      password
    );

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">

      <div className="w-full max-w-md border p-6 rounded-lg">

        <h2 className="text-2xl font-bold mb-5">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-3 mb-3 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="w-full border p-3 mb-3 rounded"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-green-600 text-white p-3 rounded"
        >
          Login
        </button>

      </div>

    </div>
  );
}