import { useEffect, useState } from "react";
import type { User } from "../../types/user";

import {
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "../../services/usersService";

import { supabase } from "../../lib/supabase";

export default function UsersPage() {
  const [users, setUsers] =
    useState<User[]>([]);

  const [currentEmail, setCurrentEmail] =
    useState("");

    const [search, setSearch] =
  useState("");

const [roleFilter, setRoleFilter] =
  useState("");

const [statusFilter, setStatusFilter] =
  useState("");

  useEffect(() => {
    loadCurrentUser();
    loadUsers();
  }, []);

  async function loadCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentEmail(
      user?.email || ""
    );
  }

  async function loadUsers() {
    const data =
      await getUsers();

    setUsers(data);
  }

  async function handleRoleChange(
    id: number,
    role: string
  ) {
    await updateUserRole(
      id,
      role
    );

    loadUsers();
  }

  async function handleStatusChange(
    id: number,
    status: string
  ) {
    await updateUserStatus(
      id,
      status
    );

    loadUsers();
  }

  const filteredUsers =
  users.filter((u) => {

    const matchSearch =
      u.full_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      u.email
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const matchRole =
      roleFilter === "" ||
      u.role === roleFilter;

    const matchStatus =
      statusFilter === "" ||
      u.status === statusFilter;

    return (
      matchSearch &&
      matchRole &&
      matchStatus
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
      Users Management
    </h1>

    <p className="mb-4 text-black-500">
      Total Users: 
      {filteredUsers.length}
    </p>

      <div className="flex gap-3 mb-4">

  <input
    type="text"
    placeholder="Search user..."
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
    className="border p-2 rounded"
  />

  <select
    value={roleFilter}
    onChange={(e) =>
      setRoleFilter(
        e.target.value
      )
    }
    className="border p-2 rounded"
  >
    <option value="">
      All Roles
    </option>

    <option value="super_admin">
      Super Admin
    </option>

    <option value="manager">
      Manager
    </option>

    <option value="officer">
      Officer
    </option>

    <option value="viewer">
      Viewer
    </option>

  </select>

  <select
    value={statusFilter}
    onChange={(e) =>
      setStatusFilter(
        e.target.value
      )
    }
    className="border p-2 rounded"
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

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">
              Name
            </th>

            <th className="border p-2">
              Email
            </th>

            <th className="border p-2">
              Role
            </th>

            <th className="border p-2">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">
                {u.full_name}
              </td>

              <td className="border p-2">
                {u.email}
              </td>

              <td className="border p-2">
                <select
                  value={u.role}
                  disabled={
                    u.email === currentEmail
                  }
                  onChange={(e) =>
                    handleRoleChange(
                      u.id,
                      e.target.value
                    )
                  }
                >
                  <option value="viewer">
                    Viewer
                  </option>

                  <option value="officer">
                    Officer
                  </option>

                  <option value="manager">
                    Manager
                  </option>

                  <option value="super_admin">
                    Super Admin
                  </option>
                </select>
              </td>

              <td className="border p-2">
                <select
                  value={u.status}
                  disabled={
                    u.email === currentEmail
                  }
                  onChange={(e) =>
                    handleStatusChange(
                      u.id,
                      e.target.value
                    )
                  }
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}