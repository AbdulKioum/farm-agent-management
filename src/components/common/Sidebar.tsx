import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaUsers,
  FaSitemap,
  FaStore,
  FaUserFriends,
  FaClipboardList,
  FaChartBar,
  FaUserShield,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";

export default function Sidebar({
  role,
  sidebarOpen,
  setSidebarOpen,
}: {
  role: string;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const location = useLocation();

  const menuClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      location.pathname === path
        ? "bg-emerald-600 text-white shadow"
        : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:translate-x-1"
    }`;

  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-20"
      } shrink-0 bg-white border-r shadow-sm min-h-screen flex flex-col transition-all duration-300`}
    >
      {/* Header / Logo */}
      <div className="border-b px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {sidebarOpen && (
              <div>
                <img
                  src="/logo.png"
                  alt="FAMS"
                  className="w-24 h-24 mx-auto mb-2 object-contain"
                />
                <p className="text-xs text-gray-500 text-center">
                  Farm and Agent Management
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-10 w-10 rounded-full bg-emerald-600 text-white shadow-md flex items-center justify-center transition-all duration-300 hover:bg-emerald-700 hover:scale-110 active:scale-95"
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {sidebarOpen ? (
              <FaAngleLeft size={18} />
            ) : (
              <FaAngleRight size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto flex flex-col gap-2 px-3 py-4">
        {/* Dashboard */}
        <Link to="/" className={menuClass("/")} title="Dashboard">
          <FaHome className="text-lg shrink-0" />
          {sidebarOpen && "Dashboard"}
        </Link>

        {/* Management Section */}
        {(role === "super_admin" ||
          role === "admin" ||
          role === "manager") && (
          <>
            {sidebarOpen && (
              <div className="mt-4 mb-1 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                Management
              </div>
            )}

            <Link
              to="/companies"
              className={menuClass("/companies")}
              title="Companies"
            >
              <FaBuilding className="text-lg shrink-0" />
              {sidebarOpen && "Companies"}
            </Link>

            <Link
              to="/agents"
              className={menuClass("/agents")}
              title="Agents"
            >
              <FaUsers className="text-lg shrink-0" />
              {sidebarOpen && "Agents"}
            </Link>

            {/* Sub Agents Link */}
            <Link
              to="/sub-agents"
              className={menuClass("/sub-agents")}
              title="Sub Agents"
            >
              <FaSitemap className="text-lg shrink-0" />
              {sidebarOpen && "Sub Agents"}
            </Link>

            {/* Retailers Link */}
            <Link
              to="/retailers"
              className={menuClass("/retailers")}
              title="Retailers"
            >
              <FaStore className="text-lg shrink-0" />
              {sidebarOpen && "Retailers"}
            </Link>
          </>
        )}

        {/* Farmers & Visits */}
        {(role === "super_admin" ||
          role === "admin" ||
          role === "manager" ||
          role === "officer" ||
          role === "agent") && (
          <>
            <Link
              to="/farmers"
              className={menuClass("/farmers")}
              title="Farmers"
            >
              <FaUserFriends className="text-lg shrink-0" />
              {sidebarOpen && "Farmers"}
            </Link>

            <Link
              to="/visits"
              className={menuClass("/visits")}
              title="Vet Visits"
            >
              <FaClipboardList className="text-lg shrink-0" />
              {sidebarOpen && "Vet Visits"}
            </Link>
          </>
        )}

        {/* Analytics Section */}
        {sidebarOpen && (
          <div className="mt-4 mb-1 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            Analytics
          </div>
        )}

        <Link
          to="/reports"
          className={menuClass("/reports")}
          title="Reports"
        >
          <FaChartBar className="text-lg shrink-0" />
          {sidebarOpen && "Reports"}
        </Link>

        {/* Administration Section */}
        {(role === "super_admin" || role === "admin") && (
          <>
            {sidebarOpen && (
              <div className="mt-4 mb-1 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                Administration
              </div>
            )}

            <Link
              to="/users"
              className={menuClass("/users")}
              title="Users"
            >
              <FaUserShield className="text-lg shrink-0" />
              {sidebarOpen && "Users"}
            </Link>
          </>
        )}
      </nav>

      {/* Footer / User Role Info */}
      <div className="mt-auto border-t p-4">
        {sidebarOpen ? (
          <>
            <div className="text-xs text-gray-500">Logged in as</div>
            <div className="font-semibold capitalize text-emerald-700">
              {role ? role.replace("_", " ") : "Guest"}
            </div>
          </>
        ) : (
          <FaUserShield
            className="mx-auto text-xl text-gray-500"
            title={`Logged in as: ${role || "Guest"}`}
          />
        )}
      </div>
    </aside>
  );
}