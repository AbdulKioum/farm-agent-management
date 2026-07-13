import { Link } from "react-router-dom";

export default function Sidebar({
  role,
}: {
  role: string;
}) {
  return (
    <aside className="w-64 bg-white border-r min-h-screen">
      <div className="p-5 font-bold text-xl">
        FAMS
      </div>
<nav className="flex flex-col p-3 gap-2">

  <Link to="/">
    Dashboard
  </Link>

  {(role === "super_admin" ||
    role === "manager") && (
    <>
      <Link to="/companies">
        Companies
      </Link>

      <Link to="/agents">
        Agents
      </Link>
    </>
  )}

  {(role === "super_admin" ||
    role === "manager" ||
    role === "officer") && (
    <>
      <Link to="/farmers">
        Farmers
      </Link>

      <Link
        to="/visits"
        className="block p-2"
      >
        Vet Visits
      </Link>
    </>
  )}

  <Link
    to="/reports"
    className="block p-2"
  >
    Reports
  </Link>

  {role === "super_admin" && (
  <Link
    to="/users"
    className="block p-2"
  >
    Users
  </Link>
)}

</nav>
    </aside>
  );
}