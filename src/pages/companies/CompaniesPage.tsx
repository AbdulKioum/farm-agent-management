import { useEffect, useState } from "react";

import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../../services/companyService";

import { useAuth }
from "../../context/AuthContext";

export default function CompaniesPage() {
  const { role } = useAuth();

if (
  role !== "super_admin" &&
  role !== "manager"
) {
  return (
    <div className="p-6">
      Access Denied
    </div>
  );
}
  const [companies, setCompanies] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

    const [logoFile, setLogoFile] =
  useState<File | null>(null);

  const [form, setForm] = useState({
    company_name: "",
    website: "",
    address: "",
    status: "Active",
  });

  const [showForm, setShowForm] =
  useState(false);

  async function loadCompanies() {
    const data =
      await getCompanies();

    setCompanies(data || []);
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  async function handleSave() {
    if (!form.company_name.trim()) {
      alert("Company Name Required");
      return;
    }

    if (editingId) {
      await updateCompany(
  editingId,
  {
    ...form,
    logo: logoFile,
  }
);
    } else {
      await createCompany({
  ...form,
  logo: logoFile,
});
    }

    setForm({
      company_name: "",
      website: "",
      address: "",
      status: "Active",
    });

    setEditingId(null);

    loadCompanies();
  }

  async function handleDelete(
    id: number
  ) {
    const ok =
      confirm("Delete Company?");

    if (!ok) return;

    await deleteCompany(id);

    loadCompanies();
  }

  function handleEdit(
    company: any
  ) {
    setEditingId(company.id);

    setForm({
      company_name:
        company.company_name || "",
      website:
        company.website || "",
      address:
        company.address || "",
      status:
        company.status || "Active",
    });
    setLogoFile(null);
  }

  const filteredCompanies =
    companies.filter((c) =>
      c.company_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div>

      <h1 className="text-2xl font-bold mb-4">
        Companies
      </h1>

      <div className="mb-4">
  <button
    onClick={() =>
      setShowForm(!showForm)
    }
    className="bg-blue-600 text-white px-4 py-2 rounded"
  >
    {showForm
      ? "Close Form"
      : "+ Add Company"}
  </button>
</div>

{showForm && (

      <div className="border p-4 rounded mb-4">

        <input
          placeholder="Company Name"
          value={form.company_name}
          onChange={(e) =>
            setForm({
              ...form,
              company_name:
                e.target.value,
            })
          }
          className="border p-2 w-full mb-2"
        />

        <input
          placeholder="Website"
          value={form.website}
          onChange={(e) =>
            setForm({
              ...form,
              website:
                e.target.value,
            })
          }
          className="border p-2 w-full mb-2"
        />

        <textarea
          placeholder="Address"
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address:
                e.target.value,
            })
          }
          className="border p-2 w-full mb-2"
        />

        <select
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status:
                e.target.value,
            })
          }
          className="border p-2 w-full mb-2"
        >
          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </select>

        <label className="block mb-2 font-medium">
       Company Logo
        </label>

        <input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setLogoFile(
      e.target.files?.[0] || null
    )
  }
  className="border p-2 w-full mb-2"
/>

        {role === "super_admin" && (
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {editingId
            ? "Update Company"
            : "Add Company"}
        </button>
        )}
      </div>
)}

      <input
        placeholder="Search Company..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        className="border p-2 w-full mb-4"
      />

      <table className="w-full border">

        <thead>

          <tr>

            <th className="border p-2">
              Company
            </th>

            <th className="border p-2">
              Website
            </th>

            <th className="border p-2">
              Status
            </th>

            <th className="border p-2">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {filteredCompanies.map(
            (company) => (
              <tr key={company.id}>

                <td className="border p-2">
                  {company.company_name}
                </td>

                <td className="border p-2">
                  {company.website}
                </td>

                <td className="border p-2">
                  {company.status}
                </td>

                <td className="border p-2 space-x-2">

                {role === "super_admin" && (
                  <button
                    onClick={() =>
                      handleEdit(
                        company
                      )
                    }
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                )}

                {role === "super_admin" && (
                  <button
                    onClick={() =>
                      handleDelete(
                        company.id
                      )
                    }
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                )}
                </td>

              </tr>
            )
          )}

        </tbody>

      </table>

    </div>
  );
}