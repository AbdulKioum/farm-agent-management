import React, { useEffect, useState } from "react";

import { getUsers, createUser, updateUser, deleteUser, updateUserRole } from "../../services/usersService";

import { supabase } from "../../lib/supabase";

import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaSearch,
  FaTimes,
  FaUsers,
} from "react-icons/fa";


// ==================================================
// USER TYPE
// ==================================================

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at?: string;
}


// ==================================================
// COMPONENT
// ==================================================

export default function UsersPage() {

  const [users, setUsers] =
    useState<UserRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [successMsg, setSuccessMsg] =
    useState("");

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [currentEmail, setCurrentEmail] =
    useState("");


  // ==================================================
  // SEARCH / FILTER
  // ==================================================

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");


  // ==================================================
  // MODAL
  // ==================================================

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<UserRecord | null>(null);


  // ==================================================
  // FORM
  // ==================================================

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
      full_name: "",
      role: "viewer",
      status: "active",
    });


  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {

    loadCurrentUser();

    loadUsers();

  }, []);


  // ==================================================
  // CURRENT USER
  // ==================================================

  async function loadCurrentUser() {

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    setCurrentUserId(
      user?.id || null
    );

    setCurrentEmail(
      user?.email || ""
    );
  }


  // ==================================================
  // LOAD USERS
  // ==================================================

  async function loadUsers() {

    try {

      setLoading(true);

      setErrorMsg("");

      const data =
        await getUsers();

      setUsers(
        data || []
      );

    } catch (error: any) {

      setErrorMsg(
        error?.message ||
        "Failed to load users."
      );

    } finally {

      setLoading(false);

    }
  }


  // ==================================================
  // OPEN ADD MODAL
  // ==================================================

  function handleOpenCreateModal() {

    setEditingUser(null);

    setErrorMsg("");

    setSuccessMsg("");

    setFormData({

      email: "",

      password: "",

      full_name: "",

      role: "viewer",

      status: "active",

    });

    setIsModalOpen(true);
  }


  // ==================================================
  // OPEN EDIT MODAL
  // ==================================================

  function handleOpenEditModal(
    user: UserRecord
  ) {

    setEditingUser(user);

    setErrorMsg("");

    setSuccessMsg("");

    setFormData({

      email:
        user.email || "",

      password: "",

      full_name:
        user.full_name || "",

      role:
        user.role || "viewer",

      status:
        user.status || "active",

    });

    setIsModalOpen(true);
  }


  // ==================================================
  // CLOSE MODAL
  // ==================================================

  function closeModal() {

    if (submitting) return;

    setIsModalOpen(false);

    setEditingUser(null);

    setErrorMsg("");

  }


  // ==================================================
  // SAVE USER
  // ==================================================

  async function handleSave(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setSubmitting(true);

    setErrorMsg("");

    setSuccessMsg("");


    try {

      // ==============================================
      // EDIT USER
      // ==============================================

      if (editingUser) {

        await updateUser(
          editingUser.id,
          {
            name:
              formData.full_name,

            role:
              formData.role,

            status:
              formData.status,
          }
        );


        setSuccessMsg(
          "User updated successfully."
        );

      }

      // ==============================================
      // CREATE USER
      // ==============================================

      else {

        if (
          !formData.full_name.trim()
        ) {

          throw new Error(
            "Full name is required."
          );
        }


        if (
          !formData.email.trim()
        ) {

          throw new Error(
            "Email is required."
          );
        }


        if (
          !formData.password
        ) {

          throw new Error(
            "Password is required."
          );
        }


        if (
          formData.password.length < 6
        ) {

          throw new Error(
            "Password must be at least 6 characters long."
          );
        }


        await createUser({

          name:
            formData.full_name.trim(),

          email:
            formData.email.trim(),

          password:
            formData.password,

          role:
            formData.role,

          status:
            formData.status,

        });


        setSuccessMsg(
          "User created successfully."
        );

      }


      await loadUsers();


      setTimeout(() => {

        setIsModalOpen(false);

        setSuccessMsg("");

      }, 500);


    } catch (error: any) {

      console.error(
        "User Save Error:",
        error
      );

      setErrorMsg(
        error?.message ||
        "Something went wrong."
      );

    } finally {

      setSubmitting(false);

    }

  }


  // ==================================================
  // DELETE USER
  // ==================================================

  async function handleDelete(
    user: UserRecord
  ) {

    // Prevent deleting own account

    if (
      user.id === currentUserId ||
      user.email === currentEmail
    ) {

      alert(
        "You cannot delete your own account."
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${user.full_name || user.email}"?`
      );


    if (!confirmed) return;


    try {

      setDeletingId(
        user.id
      );

      setErrorMsg("");

      setSuccessMsg("");


      await deleteUser(
        user.id
      );


      setSuccessMsg(
        "User deleted successfully."
      );


      await loadUsers();


    } catch (error: any) {

      console.error(
        "Delete User Error:",
        error
      );

      setErrorMsg(
        error?.message ||
        "Failed to delete user."
      );

    } finally {

      setDeletingId(null);

    }

  }

// ==================================================
  // QUICK ROLE CHANGE
  // ==================================================
  async function handleRoleChange(id: string, role: string) {
    try {
      await updateUserRole(id, { role });
      await loadUsers();
    } catch (error: any) {
      setErrorMsg(error?.message || "Failed to update role.");
    }
  }

  // ==================================================
  // QUICK STATUS CHANGE
  // ==================================================
  async function handleStatusChange(id: string, status: string) {
    try {
      await updateUser(id, { status });
      await loadUsers();
    } catch (error: any) {
      setErrorMsg(error?.message || "Failed to update status.");
    }
  }

  // ==================================================
  // FILTER USERS
  // ==================================================

  const filteredUsers =
    users.filter(
      (user) => {

        const searchText =
          search
            .trim()
            .toLowerCase();


        const matchSearch =
          !searchText ||

          user.full_name
            ?.toLowerCase()
            .includes(searchText) ||

          user.email
            ?.toLowerCase()
            .includes(searchText);


        const matchRole =
          !roleFilter ||
          user.role === roleFilter;


        const matchStatus =
          !statusFilter ||
          user.status === statusFilter;


        return (
          matchSearch &&
          matchRole &&
          matchStatus
        );

      }
    );


  // ==================================================
  // ROLE LABEL
  // ==================================================

  function getRoleLabel(
    role: string
  ) {

    return (
      role
        ?.replaceAll("_", " ")
        .replace(
          /\b\w/g,
          (char) =>
            char.toUpperCase()
        ) ||
      "Viewer"
    );

  }


  // ==================================================
  // ROLE BADGE
  // ==================================================

  function getRoleBadge(
    role: string
  ) {

    switch (role) {

      case "super_admin":

        return "bg-purple-100 text-purple-700";

      case "admin":

        return "bg-indigo-100 text-indigo-700";

      case "manager":

        return "bg-blue-100 text-blue-700";

      case "officer":

        return "bg-cyan-100 text-cyan-700";

      case "agent":

        return "bg-amber-100 text-amber-700";

      case "farmer":

        return "bg-emerald-100 text-emerald-700";

      default:

        return "bg-slate-100 text-slate-700";

    }

  }


  // ==================================================
  // RETURN
  // ==================================================

  return (

    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">

              <FaUsers />

            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-800">

                User Management

              </h1>

              <p className="text-sm text-slate-500">

                Manage users, roles and system access.

              </p>

            </div>

          </div>

        </div>


        <button
          onClick={
            handleOpenCreateModal
          }
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition"
        >

          <FaUserPlus />

          Add New User

        </button>

      </div>


      {/* ==================================================
          ALERTS
      ================================================== */}

      {errorMsg && (

        <div className="mb-4 flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">

          <span>
            {errorMsg}
          </span>

          <button
            onClick={() =>
              setErrorMsg("")
            }
            className="text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>

        </div>

      )}


      {successMsg && (

        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">

          {successMsg}

        </div>

      )}


      {/* ==================================================
          SUMMARY CARD
      ================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 shadow-sm">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div>

            <p className="text-xs text-slate-500">
              Total Users
            </p>

            <p className="text-2xl font-bold text-slate-800">
              {users.length}
            </p>

          </div>


          <div>

            <p className="text-xs text-slate-500">
              Active Users
            </p>

            <p className="text-2xl font-bold text-emerald-600">

              {
                users.filter(
                  (u) =>
                    u.status ===
                    "active"
                ).length
              }

            </p>

          </div>


          <div>

            <p className="text-xs text-slate-500">
              Showing
            </p>

            <p className="text-2xl font-bold text-blue-600">
              {filteredUsers.length}
            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          SEARCH / FILTER
      ================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 shadow-sm">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* Search */}

          <div className="relative">

            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            />

          </div>


          {/* Role */}

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(
                e.target.value
              )
            }
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >

            <option value="">
              All Roles
            </option>

            <option value="super_admin">
              Super Admin
            </option>

            <option value="admin">
              Admin
            </option>

            <option value="manager">
              Manager
            </option>

            <option value="officer">
              Officer
            </option>

            <option value="agent">
              Agent
            </option>

            <option value="farmer">
              Farmer
            </option>

            <option value="viewer">
              Viewer
            </option>

          </select>


          {/* Status */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >

            <option value="">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

          </select>

        </div>

      </div>


      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-50 border-b border-slate-200">

              <tr>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  User
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Role
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {loading ? (

                <tr>

                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-500"
                  >

                    <FaSpinner className="animate-spin inline mr-2" />

                    Loading users...

                  </td>

                </tr>

              ) : filteredUsers.length === 0 ? (

                <tr>

                  <td
                    colSpan={4}
                    className="py-12 text-center"
                  >

                    <div className="text-slate-400 text-sm">
                      No users found.
                    </div>

                  </td>

                </tr>

              ) : (

                filteredUsers.map(
                  (user) => {

                    const isCurrentUser =
                      user.id ===
                        currentUserId ||
                      user.email ===
                        currentEmail;


                    return (

                      <tr
                        key={user.id}
                        className="hover:bg-slate-50 transition"
                      >

                        {/* USER */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">

                              {
                                (
                                  user.full_name ||
                                  user.email ||
                                  "U"
                                )
                                  .charAt(0)
                                  .toUpperCase()
                              }

                            </div>

                            <div>

                              <div className="font-semibold text-slate-800">

                                {
                                  user.full_name ||
                                  "Unnamed User"
                                }

                                {isCurrentUser && (

                                  <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">

                                    You

                                  </span>

                                )}

                              </div>

                              <div className="text-sm text-slate-500">

                                {user.email}

                              </div>

                            </div>

                          </div>

                        </td>


                        {/* ROLE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadge(
                                user.role
                              )}`}
                            >

                              {getRoleLabel(
                                user.role
                              )}

                            </span>

                            {!isCurrentUser && (

                              <select
                                value={
                                  user.role
                                }
                                onChange={(e) =>
                                  handleRoleChange(
                                    user.id,
                                    e.target.value
                                  )
                                }
                                className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white"
                              >

                                <option value="super_admin">
                                  Super Admin
                                </option>

                                <option value="admin">
                                  Admin
                                </option>

                                <option value="manager">
                                  Manager
                                </option>

                                <option value="officer">
                                  Officer
                                </option>

                                <option value="agent">
                                  Agent
                                </option>

                                <option value="farmer">
                                  Farmer
                                </option>

                                <option value="viewer">
                                  Viewer
                                </option>

                              </select>

                            )}

                          </div>

                        </td>


                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                user.status ===
                                "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >

                              {user.status ===
                              "active"
                                ? "Active"
                                : "Inactive"}

                            </span>


                            {!isCurrentUser && (

                              <select
                                value={
                                  user.status
                                }
                                onChange={(e) =>
                                  handleStatusChange(
                                    user.id,
                                    e.target.value
                                  )
                                }
                                className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white"
                              >

                                <option value="active">
                                  Active
                                </option>

                                <option value="inactive">
                                  Inactive
                                </option>

                              </select>

                            )}

                          </div>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-5 py-4 text-right">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                handleOpenEditModal(
                                  user
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium transition"
                            >

                              <FaEdit />

                              Edit

                            </button>


                            <button
                              onClick={() =>
                                handleDelete(
                                  user
                                )
                              }
                              disabled={
                                isCurrentUser ||
                                deletingId ===
                                  user.id
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition"
                            >

                              {deletingId ===
                              user.id ? (

                                <FaSpinner className="animate-spin" />

                              ) : (

                                <FaTrash />

                              )}

                              Delete

                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ==================================================
          CREATE / EDIT MODAL
      ================================================== */}

      {isModalOpen && (

        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">

              <div>

                <h2 className="text-lg font-bold text-slate-800">

                  {editingUser
                    ? "Edit User"
                    : "Add New User"}

                </h2>

                <p className="text-xs text-slate-500 mt-1">

                  {editingUser
                    ? "Update user information and access."
                    : "Create a new system user."}

                </p>

              </div>


              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  submitting
                }
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >

                <FaTimes />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleSave
              }
              className="p-6 space-y-4"
            >

              {/* FULL NAME */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">

                  Full Name

                </label>

                <input
                  type="text"
                  required
                  value={
                    formData.full_name
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      full_name:
                        e.target.value,
                    })
                  }
                  placeholder="Enter full name"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>


              {/* EMAIL */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">

                  Email

                </label>

                <input
                  type="email"
                  required
                  disabled={
                    !!editingUser
                  }
                  value={
                    formData.email
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email:
                        e.target.value,
                    })
                  }
                  placeholder="user@example.com"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                {editingUser && (

                  <p className="text-xs text-slate-400 mt-1">

                    Email cannot be changed from here.

                  </p>

                )}

              </div>


              {/* PASSWORD */}

              {!editingUser && (

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1">

                    Password

                  </label>

                  <input
                    type="password"
                    required
                    minLength={6}
                    value={
                      formData.password
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password:
                          e.target.value,
                      })
                    }
                    placeholder="Minimum 6 characters"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                  <p className="text-xs text-slate-400 mt-1">

                    Password must contain at least 6 characters.

                  </p>

                </div>

              )}


              {/* ROLE */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">

                  Role

                </label>

                <select
                  value={
                    formData.role
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role:
                        e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="super_admin">
                    Super Admin
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                  <option value="manager">
                    Manager
                  </option>

                  <option value="officer">
                    Officer
                  </option>

                  <option value="agent">
                    Agent
                  </option>

                  <option value="farmer">
                    Farmer
                  </option>

                  <option value="viewer">
                    Viewer
                  </option>

                </select>

              </div>


              {/* STATUS */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">

                  Status

                </label>

                <select
                  value={
                    formData.status
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status:
                        e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                </select>

              </div>


              {/* MODAL ERROR */}

              {errorMsg && (

                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-sm">

                  {errorMsg}

                </div>

              )}


              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    submitting
                  }
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium"
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium flex items-center gap-2"
                >

                  {submitting && (

                    <FaSpinner className="animate-spin" />

                  )}

                  {editingUser
                    ? "Save Changes"
                    : "Create User"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}