import { supabase } from "../../lib/supabase";

export default function Navbar({
  role,
  userName,
}: {
  role: string;
  userName: string;
}) {
  async function handleLogout() {
    await supabase.auth.signOut();

    window.location.href =
      "/login";
  }

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-5">

      <h1 className="font-bold text-lg">
        Farm and Agent Management
      </h1>

      <div className="flex items-center gap-4">

        <div className="text-right">

          <div className="font-medium">
            {userName}
          </div>

          <div className="text-xs text-gray-500">
            {role}
          </div>

        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>

      </div>

    </header>
  );
}