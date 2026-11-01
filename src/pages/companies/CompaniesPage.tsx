import React, { useEffect, useState, useRef } from "react";
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../../services/companyService";
import { useAuth } from "../../context/AuthContext";
import {
  FaBuilding,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaGlobe,
  FaMapMarkerAlt,
  FaTimes,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

export default function CompaniesPage() {
  const { role } = useAuth();
  const formRef = useRef<HTMLDivElement | null>(null);

  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    company_name: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    status: "Active",
  });

  const canManage = role === "super_admin" || role === "manager";

  async function loadCompanies() {
    try {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data || []);
    } catch (err) {
      console.error("Failed to load companies", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;

    if (!form.company_name.trim()) {
      alert("Company Name Required");
      return;
    }

    try {
      setSaving(true);
      if (editingId !== null) {
        await updateCompany(editingId, {
          ...form,
          logo: logoFile,
        });
      } else {
        await createCompany({
          ...form,
          logo: logoFile,
        });
      }

      setForm({
        company_name: "",
        phone: "",
        email: "",
        website: "",
        address: "",
        status: "Active",
      });
      setLogoFile(null);
      setEditingId(null);
      setShowForm(false);
      await loadCompanies();
    } catch (err: any) {
      alert(err?.message || "Failed to save company");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!canManage) return;
    const ok = window.confirm("Are you sure you want to delete this company?");
    if (!ok) return;

    try {
      await deleteCompany(id);
      await loadCompanies();
    } catch (err: any) {
      alert(err?.message || "Failed to delete company");
    }
  }

  function handleEdit(company: any) {
    if (!canManage) return;
    setEditingId(company.id);
    setForm({
      company_name: company.company_name || "",
      phone: company.phone || "",
      email: company.email || "",
      website: company.website || "",
      address: company.address || "",
      status: company.status || "Active",
    });
    setLogoFile(null);
    setShowForm(true);

    // Edit-e click korle automatic scroll hoye uporer form-er kache chole jabe
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({
      company_name: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      status: "Active",
    });
    setLogoFile(null);
  }

  const sortedCompanies = [...companies].sort((a, b) => {
    const nameA = (a.company_name || "").toLowerCase();
    const nameB = (b.company_name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const filteredCompanies = sortedCompanies.filter(
    (c) =>
      c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
            <FaBuilding />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              Companies
            </h1>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => {
              if (showForm) {
                handleCloseForm();
              } else {
                setShowForm(true);
                setTimeout(() => {
                  formRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 100);
              }
            }}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium shadow-sm transition"
          >
            {showForm ? <FaTimes /> : <FaPlus />}
            {showForm ? "Cancel" : "Add Company"}
          </button>
        )}
      </div>

      {/* ================= ADD / EDIT FORM CARD ================= */}
      {showForm && canManage && (
        <div
          ref={formRef}
          className="scroll-mt-20 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">
              {editingId !== null ? "Edit Company Details" : "Add New Company"}
            </h2>
            <button
              type="button"
              onClick={handleCloseForm}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nourish Poultry"
                  value={form.company_name}
                  onChange={(e) =>
                    setForm({ ...form, company_name: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="info@company.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Company Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setLogoFile(e.target.files?.[0] || null)
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Address
              </label>
              <textarea
                rows={2}
                placeholder="Corporate office address..."
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs sm:text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-medium shadow-sm transition"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "Update Company"
                  : "Save Company"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= SEARCH & TABLE SECTION ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search company, phone or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm outline-none bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="text-xs text-slate-500 shrink-0 font-medium">
            Total: {filteredCompanies.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Status</th>
                {canManage && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={canManage ? 7 : 6}
                    className="py-12 text-center text-slate-500"
                  >
                    Loading companies...
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 7 : 6}
                    className="py-12 text-center text-slate-400"
                  >
                    No companies found.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {company.logo_url || company.logo ? (
                          <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center p-1 shrink-0 shadow-sm">
                            <img
                              src={company.logo_url || company.logo}
                              alt={company.company_name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                            {company.company_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="font-semibold text-slate-800">
                          {company.company_name}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {company.phone ? (
                        <a
                          href={`tel:${company.phone}`}
                          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 font-medium"
                        >
                          <FaPhoneAlt className="text-[11px] text-emerald-600" />
                          {company.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {company.email ? (
                        <a
                          href={`mailto:${company.email}`}
                          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-600"
                        >
                          <FaEnvelope className="text-[11px] text-slate-400" />
                          {company.email}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {company.website ? (
                        <a
                          href={
                            company.website.startsWith("http")
                              ? company.website
                              : `https://${company.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-600 hover:underline"
                        >
                          <FaGlobe className="text-[11px]" />
                          {company.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                      {company.address ? (
                        <span className="inline-flex items-center gap-1 truncate">
                          <FaMapMarkerAlt className="text-slate-400 shrink-0 text-[11px]" />
                          {company.address}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          company.status === "Active"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {company.status || "Active"}
                      </span>
                    </td>

                    {canManage && (
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(company)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition"
                          title="Edit Company"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(company.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition"
                          title="Delete Company"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}