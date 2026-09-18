import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function FarmerStatusPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  
  const [agentsWithFarmers, setAgentsWithFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  
  const [form, setForm] = useState({
    hatch_date: "",
    hatchery: "",
    breed: "",
    box_no: "",
    t_birds: "",
    category: "Broiler",
  });

  async function loadInitialData() {
    setLoading(true);
    const { data: compData } = await supabase.from("companies").select("*");
    if (compData) {
      setCompanies(compData);
      const nourish = compData.find((c) => c.company_name?.toLowerCase().includes("nourish"));
      if (nourish) {
        setSelectedCompany(nourish.id);
      } else if (compData.length > 0) {
        setSelectedCompany(compData[0].id);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadAgentsAndFarmers();
    }
  }, [selectedCompany]);

  async function loadAgentsAndFarmers() {
    setLoading(true);

    const { data: agentsData } = await supabase
      .from("agents")
      .select("*")
      .eq("company_id", selectedCompany);

    const currentAgents = agentsData || [];
    setAgents(currentAgents);

    const { data: farmersData } = await supabase.from("farmers").select("*");
    const allFarmers = farmersData || [];

    const combined = currentAgents.map((agent) => {
      const farmers = allFarmers.filter(
        (f) => String(f.agent_id) === String(agent.id)
      );
      return {
        ...agent,
        farmers: farmers.map((f) => ({
          ...f,
          status: f.status || "Inactive",
          category: f.farm_type || f.category || "Broiler", 
        })),
      };
    });

    setAgentsWithFarmers(combined);
    setLoading(false);
  }

  function handleStatusClick(farmer: any) {
    setSelectedFarmer(farmer);
    setForm({
      hatch_date: farmer.hatch_date || "",
      hatchery: farmer.hatchery || "",
      breed: farmer.breed || "",
      box_no: farmer.box_no || "",
      t_birds: farmer.t_birds || "",
      category: farmer.category || "Broiler",
    });
    setShowModal(true);
  }

  async function handleActivateSubmit() {
    if (!selectedFarmer) return;

    try {
      // 1. Update farmers table status and farm_type
      const { error: updateErr } = await supabase
        .from("farmers")
        .update({
          status: "Activated",
          farm_type: form.category,
        })
        .eq("id", selectedFarmer.id);

      if (updateErr) throw updateErr;

      // 2. Insert into vet_visits table
      const { error: visitErr } = await supabase.from("vet_visits").insert([
        {
          farmer_id: String(selectedFarmer.id),
          agent_id: String(selectedFarmer.agent_id),
          company_id: String(selectedCompany),
          category: form.category,
          hatch_date: form.hatch_date,
          hatchery: form.hatchery,
          breed: form.breed,
          box_no: form.box_no,
          t_birds: Number(form.t_birds),
          status: "Activated",
        },
      ]);

      if (visitErr) throw visitErr;

      alert("Farmer Activated & Added to Vet Visits Successfully!");
      setShowModal(false);
      loadAgentsAndFarmers();
    } catch (err: any) {
      alert(err.message || "Failed to activate");
    }
  }

  const filteredAgents =
    selectedAgent === "all"
      ? agentsWithFarmers
      : agentsWithFarmers.filter((a) => String(a.id) === String(selectedAgent));

  if (loading && companies.length === 0) return <div className="p-6">Loading Farmer Status...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Farmer Status Management</h1>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Company Filter</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white min-w-[200px]"
          >
            {companies.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.company_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Agent Filter</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white min-w-[200px]"
          >
            <option value="all">All Agents</option>
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.agent_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agent & Farmer Lists */}
      {filteredAgents.map((agent) => (
        <div key={agent.id} className="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-700">
              Agent: <span className="text-emerald-600">{agent.agent_name}</span>
            </h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-medium">
              Total Farmers: {agent.farmers.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="px-4 py-3">Farmer Name</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Village</th>
                  <th className="px-4 py-3">Upazila</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {agent.farmers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-slate-400">
                      No farmers found under this agent.
                    </td>
                  </tr>
                ) : (
                  agent.farmers.map((farmer: any) => (
                    <tr key={farmer.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">{farmer.farmer_name || farmer.name}</td>
                      <td className="px-4 py-3 text-slate-600">{farmer.mobile}</td>
                      <td className="px-4 py-3 text-slate-600">{farmer.village}</td>
                      <td className="px-4 py-3 text-slate-600">{farmer.upazila}</td>
                      <td className="px-4 py-3 font-medium text-emerald-700 uppercase text-xs">
                        {farmer.category}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleStatusClick(farmer)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition shadow-sm ${
                            farmer.status === "Activated"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          }`}
                        >
                          {farmer.status} (Click to update)
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Activation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-xl w-[500px] max-h-[90vh] overflow-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Activate Farmer: {selectedFarmer?.farmer_name || selectedFarmer?.name}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 font-bold text-lg">✖</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Category / Farm Type</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="Broiler">Broiler</option>
                  <option value="Layer">Layer</option>
                  <option value="Sonali">Sonali</option>
                  <option value="Cattle">Cattle</option>
                  <option value="Fish">Fish</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Hatch Date</label>
                <input
                  type="date"
                  value={form.hatch_date}
                  onChange={(e) => setForm({ ...form, hatch_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Hatchery</label>
                <input
                  type="text"
                  placeholder="Hatchery Name"
                  value={form.hatchery}
                  onChange={(e) => setForm({ ...form, hatchery: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Breed</label>
                <input
                  type="text"
                  placeholder="Breed Name"
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Box No.</label>
                <input
                  type="text"
                  placeholder="Box No"
                  value={form.box_no}
                  onChange={(e) => setForm({ ...form, box_no: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">T. Birds (Total Birds)</label>
                <input
                  type="number"
                  placeholder="Total Birds"
                  value={form.t_birds}
                  onChange={(e) => setForm({ ...form, t_birds: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivateSubmit}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm"
                >
                  Submit & Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}