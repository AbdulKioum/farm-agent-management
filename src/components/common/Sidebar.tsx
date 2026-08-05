import { Link, useLocation } from "react-router-dom";

import {
  FaHome,
  FaBuilding,
  FaUsers,
  FaUserFriends,
  FaClipboardList,
  FaChartBar,
  FaUserShield,
} from "react-icons/fa";

import {
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
  setSidebarOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
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
    sidebarOpen
      ? "w-64"
      : "w-20"
  } shrink-0 bg-white border-r shadow-sm min-h-screen flex flex-col transition-all duration-300`}
>

      <div className="border-b px-4 py-5">

  <div className="flex items-center justify-between">

    <div className="flex items-center gap-3">

      

      {sidebarOpen && (

        <div>

          <img
            src="/logo.png"
            alt="FAMS"
            className="w-28 h-28 mx-auto mb-4"
          />

          <p className="text-xs text-gray-500">
            Farm and Agent Management
          </p>

        </div>

      )}

    </div>

    <button
      onClick={() =>
        setSidebarOpen(
          !sidebarOpen
        )
      }
      className="
        h-10
        w-10
        rounded-full
        bg-emerald-600
        text-white
        shadow-md
        flex
        items-center
        justify-center
        transition-all
        duration-300
        hover:bg-emerald-700
        hover:scale-110
        active:scale-95
        "
    >
      {sidebarOpen ? (
        <FaAngleLeft size={18} />
      ) : (
        <FaAngleRight size={18} />
      )}
    </button>

  </div>

</div>


<nav className="flex-1 overflow-y-auto flex flex-col gap-2 px-3">

  <Link
  to="/"
  className={menuClass("/")}
>
  <FaHome className="text-lg shrink-0" />

  {sidebarOpen && "Dashboard"}

</Link>

  {(role === "super_admin" ||
    role === "manager") && (
    <>

    {sidebarOpen && (

      <div className="mt-4 mb-2 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
        Management
      </div>

      )}

      <Link
  to="/companies"
  className={menuClass("/companies")}
>
  <FaBuilding className="text-lg shrink-0" />

  {sidebarOpen && "Companies"}

</Link>

      <Link
  to="/agents"
  className={menuClass("/agents")}
>
  <FaUsers className="text-lg shrink-0" />

  {sidebarOpen && "Agents"}

</Link>
    </>
  )}

  {(role === "super_admin" ||
    role === "manager" ||
    role === "officer") && (
    <>
      <Link
  to="/farmers"
  className={menuClass("/farmers")}
>
  <FaUserFriends className="text-lg shrink-0" />

  {sidebarOpen && "Farmers"}

</Link>

      <Link
  to="/visits"
  className={menuClass("/visits")}
>
  <FaClipboardList className="text-lg shrink-0" />

  {sidebarOpen && "Vet Visits"}

</Link>
    </>
  )}

  {sidebarOpen && (

<div className="mt-4 mb-2 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
    Analytics
</div>

)}

  <Link
  to="/reports"
  className={menuClass("/reports")}
>
  <FaChartBar className="text-lg shrink-0" />

  {sidebarOpen && "Reports"}

</Link>

  {sidebarOpen && (

<div className="mt-4 mb-2 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
  Administration
</div>

)}

  {role === "super_admin" && (
    <Link
  to="/users"
  className={menuClass("/users")}
>
  <FaUserShield className="text-lg shrink-0" />

  {sidebarOpen && "Users"}

</Link>
  )}

</nav>


<div className="mt-auto border-t p-4">

  {sidebarOpen ? (

    <>

      <div className="text-xs text-gray-500">
        Logged in as
      </div>

      <div className="font-semibold capitalize">
        {role.replace("_", " ")}
      </div>

    </>

  ) : (

    <FaUserShield
      className="mx-auto text-xl text-gray-500"
    />

  )}

</div>


    </aside>
  );
}