import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  FaUserTie,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

interface DocAgent {
  id: string;
  doc_id: string;
  agent_name: string;
  proprietor: string;
  mobile: string;
  district: string;
  upazila: string;
}

interface DistrictItem {
  id: string | number;
  name: string;
}

interface UpazilaItem {
  id: string | number;
  name: string;
  district_id?: string | number;
  district_name?: string;
  district?: string;
}

export default function DocAgentsPage() {
  const [agents, setAgents] = useState<DocAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Current User Info & Assigned Areas
  const [userRole, setUserRole] = useState("officer");
  const [assignedDistricts, setAssignedDistricts] = useState<string[]>([]);
  const [assignedUpazilas, setAssignedUpazilas] = useState<string[]>([]);

  // Master Locations
  const [districtsList, setDistrictsList] = useState<DistrictItem[]>([]);
  const [upazilasList, setUpazilasList] = useState<UpazilaItem[]>([]);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [upazilaFilter, setUpazilaFilter] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<DocAgent | null>(null);

  const [formData, setFormData] = useState({
    doc_id: "",
    agent_name: "",
    proprietor: "",
    mobile: "",
    district: "",
    upazila: "",
  });

  useEffect(() => {
    initPage();
  }, []);

  function parseArray(field: any): string[] {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return field
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    return [];
  }

  async function initPage() {
    setLoading(true);
    try {
      // 1. Get logged in user & assigned upazilas
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let role = "officer";
      let uDistricts: string[] = [];
      let uUpazilas: string[] = [];

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role, districts, upazilas")
          .eq("id", user.id)
          .single();

        if (profile) {
          role = profile.role || "officer";
          uDistricts = parseArray(profile.districts);
          uUpazilas = parseArray(profile.upazilas);
        }
      }

      setUserRole(role);
      setAssignedDistricts(uDistricts);
      setAssignedUpazilas(uUpazilas);

      // 2. Load Districts & Upazilas from DB
      const [{ data: dData }, { data: uData }] = await Promise.all([
        supabase.from("districts").select("*").order("name"),
        supabase.from("upazilas").select("*").order("name"),
      ]);

      setDistrictsList(dData || []);
      setUpazilasList(uData || []);

      // 3. Load DOC Agents
      await fetchAgents(role, uUpazilas);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAgents(role = userRole, uUpazilas = assignedUpazilas) {
    let query = supabase
      .from("doc_agents")
      .select("*")
      .order("doc_id", { ascending: true });

    // Super Admin ছাড়া বাকিদের শুধুমাত্র তাদের Assigned Upazila-এর এজেন্ট দেখাবে
    if (role !== "super_admin") {
      if (uUpazilas.length > 0) {
        query = query.in("upazila", uUpazilas);
      } else {
        setAgents([]);
        return;
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    setAgents(data || []);
  }

  // Filter Districts & Upazilas in Form based on User Assignment
  const allowedDistricts = districtsList.filter((d) => {
    if (userRole === "super_admin" || assignedDistricts.length === 0)
      return true;
    return assignedDistricts.includes(d.name);
  });

  const allowedUpazilasForSelectedDistrict = upazilasList.filter((u) => {
    if (!formData.district) return false;

    const matchedDist = districtsList.find(
      (d) => String(d.id) === String(u.district_id)
    );
    const dName = matchedDist?.name || u.district_name || u.district;

    const belongsToDistrict = dName === formData.district;
    if (!belongsToDistrict) return false;

    if (userRole === "super_admin") return true;
    return assignedUpazilas.includes(u.name);
  });

  function handleOpenCreate() {
    setEditingAgent(null);
    setErrorMsg("");
    setSuccessMsg("");

    const defaultDistrict =
      allowedDistricts.length === 1 ? allowedDistricts[0].name : "";
    const defaultUpazila =
      assignedUpazilas.length === 1 ? assignedUpazilas[0] : "";

    setFormData({
      doc_id: "",
      agent_name: "",
      proprietor: "",
      mobile: "",
      district: defaultDistrict,
      upazila: defaultUpazila,
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(agent: DocAgent) {
    setEditingAgent(agent);
    setErrorMsg("");
    setSuccessMsg("");
    setFormData({
      doc_id: agent.doc_id,
      agent_name: agent.agent_name,
      proprietor: agent.proprietor || "",
      mobile: agent.mobile || "",
      district: agent.district || "",
      upazila: agent.upazila || "",
    });
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const cleanDocId = formData.doc_id.trim();
      if (!cleanDocId || !formData.agent_name.trim()) {
        throw new Error("DOC.ID and Agent Name are required.");
      }
      if (!formData.district || !formData.upazila) {
        throw new Error("District and Upazila are required.");
      }

      if (editingAgent) {
        const { error } = await supabase
          .from("doc_agents")
          .update({
            doc_id: cleanDocId,
            agent_name: formData.agent_name.trim(),
            proprietor: formData.proprietor.trim(),
            mobile: formData.mobile.trim(),
            district: formData.district,
            upazila: formData.upazila,
          })
          .eq("id", editingAgent.id);

        if (error) throw error;
        setSuccessMsg("DOC Agent updated successfully.");
      } else {
        const { error } = await supabase.from("doc_agents").insert([
          {
            doc_id: cleanDocId,
            agent_name: formData.agent_name.trim(),
            proprietor: formData.proprietor.trim(),
            mobile: formData.mobile.trim(),
            district: formData.district,
            upazila: formData.upazila,
          },
        ]);

        if (error) {
          if (error.code === "23505") {
            throw new Error(`DOC.ID "${cleanDocId}" already exists!`);
          }
          throw error;
        }
        setSuccessMsg("DOC Agent added successfully.");
      }

      await fetchAgents();
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save DOC Agent.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(agent: DocAgent) {
    if (
      !window.confirm(
        `Delete DOC Agent "${agent.agent_name}" (ID: ${agent.doc_id})?`
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("doc_agents")
        .delete()
        .eq("id", agent.id);
      if (error) throw error;
      await fetchAgents();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to delete agent.");
    }
  }

  const filteredAgents = agents.filter((a) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      a.doc_id.toLowerCase().includes(q) ||
      a.agent_name.toLowerCase().includes(q) ||
      a.proprietor?.toLowerCase().includes(q) ||
      a.mobile?.toLowerCase().includes(q);

    const matchUpazila = !upazilaFilter || a.upazila === upazilaFilter;
    return matchSearch && matchUpazila;
  });

  const uniqueUpazilas = Array.from(new Set(agents.map((a) => a.upazila)));

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <FaUserTie className="text-base sm:text-lg" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">
            DOC Agents
          </h1>
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            Total: {filteredAgents.length}
          </span>
        </div>

        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-sm transition"
        >
          <FaPlus />
          Add DOC Agent
        </button>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="mb-3 flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-3 flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 mb-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="relative sm:col-span-2">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search by DOC.ID, Agent Name, Proprietor or Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={upazilaFilter}
          onChange={(e) => setUpazilaFilter(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none bg-white"
        >
          <option value="">All Upazilas</option>
          {uniqueUpazilas.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-2.5">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 text-sm">
            <FaSpinner className="animate-spin inline mr-2" /> Loading...
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-sm">
            No DOC Agents found for your assigned upazila.
          </div>
        ) : (
          filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs mb-1">
                    ID: {agent.doc_id}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {agent.agent_name}
                  </h3>
                  {agent.proprietor && (
                    <p className="text-xs text-slate-500">
                      Prop: {agent.proprietor}
                    </p>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(agent)}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600"
                  >
                    <FaEdit size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(agent)}
                    className="p-2 rounded-lg bg-red-50 text-red-600"
                  >
                    <FaTrash size={13} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-emerald-600" />
                  {agent.upazila}, {agent.district}
                </span>
                {agent.mobile && (
                  <a
                    href={`tel:${agent.mobile}`}
                    className="flex items-center gap-1 text-blue-600 font-medium"
                  >
                    <FaPhoneAlt size={11} /> {agent.mobile}
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                DOC.ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Agent Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Proprietor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Mobile
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                District & Upazila
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  <FaSpinner className="animate-spin inline mr-2" /> Loading...
                </td>
              </tr>
            ) : filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  No DOC Agents found.
                </td>
              </tr>
            ) : (
              filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-emerald-700">
                    {agent.doc_id}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {agent.agent_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {agent.proprietor || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {agent.mobile || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium mr-1">
                      {agent.upazila}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({agent.district})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(agent)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium inline-flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(agent)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium inline-flex items-center gap-1"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-800">
                {editingAgent ? "Edit DOC Agent" : "Add New DOC Agent"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="p-5 space-y-3.5 overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    DOC.ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1059"
                    value={formData.doc_id}
                    onChange={(e) =>
                      setFormData({ ...formData, doc_id: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter agent / enterprise name"
                    value={formData.agent_name}
                    onChange={(e) =>
                      setFormData({ ...formData, agent_name: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Proprietor
                  </label>
                  <input
                    type="text"
                    placeholder="Proprietor name"
                    value={formData.proprietor}
                    onChange={(e) =>
                      setFormData({ ...formData, proprietor: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mobile
                  </label>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    District *
                  </label>
                  <select
                    required
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        district: e.target.value,
                        upazila: "",
                      })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none bg-white"
                  >
                    <option value="">Select District</option>
                    {allowedDistricts.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Upazila *
                  </label>
                  <select
                    required
                    disabled={!formData.district}
                    value={formData.upazila}
                    onChange={(e) =>
                      setFormData({ ...formData, upazila: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none bg-white disabled:bg-slate-100"
                  >
                    <option value="">Select Upazila</option>
                    {allowedUpazilasForSelectedDistrict.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center justify-center gap-2"
                >
                  {submitting && <FaSpinner className="animate-spin" />}
                  {editingAgent ? "Save Changes" : "Add Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}