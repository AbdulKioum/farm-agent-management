import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen">
      <div className="p-5 font-bold text-xl">
        FAMS
      </div>

      <nav className="flex flex-col p-3 gap-2">

        <Link to="/">
          Dashboard
        </Link>

        <Link to="/companies">
          Companies
        </Link>

        <Link to="/agents">
          Agents
        </Link>

        <Link to="/farmers">
          Farmers
        </Link>
        
        <Link
        to="/reports"
        className="block p-2"
        >
          Reports
        </Link>
        <Link to="/visits">
          Vet Visits
        </Link>

      </nav>
    </aside>
  );
}