import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function VetVisitsPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  const [visitsData, setVisitsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    hatch_date: "",
    hatchery: "",
    breed: "",
    box_no: "",
    t_birds: "",
    category: "Broiler",
  });

  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryVisit, setSelectedHistoryVisit] = useState<any>(null);
  const [farmerHistory, setFarmerHistory] = useState<{ before: any[]; after: any[]; layer: any[] }>({ before: [], after: [], layer: [] });

  // Report Modal States
  const [showBeforeSaleModal, setShowBeforeSaleModal] = useState(false);
  const [showAfterSaleModal, setShowAfterSaleModal] = useState(false);
  const [showLayerModal, setShowLayerModal] = useState(false);
  const [activeReportVisit, setActiveReportVisit] = useState<any>(null);

  // Shared Visit Date state for Reports
  const [reportVisitDate, setReportVisitDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Before Sale Form
  const [beforeForm, setBeforeForm] = useState({
    mortality_pcs: "",
    weight_gm_b: "",
    feed_t_kg: "",
    feed_gm_b: "",
    fcr_w_out_m: "",
    fcr_with_m: "",
    uneven: "",
    indigestion: "",
    orange_feces: "",
    watery_feces: "",
    feeder: "",
    drinker: "",
    floor_space: "",
    c_val: "",
    e_val: "",
    litter_condition: "",
    ventilation: "",
    feed_scattering: "",
    feed_hardness: "",
    feed_company: "",
    feed_type: "",
    pro_date: "",
    batch_no: "",
    remarks: "",
  });

  // After Sale Form
  const [afterForm, setAfterForm] = useState({
    mortality: "",
    weight: "",
    feed_consumption_kg: "",
    feed: "",
    feed_mill: "",
    fcr_w_out_m: "",
    fcr_with_m: "",
    remarks: "",
  });

  // Layer Form
  const [layerForm, setLayerForm] = useState({
    b_weight_g: "",
    feed_intake_g: "",
    egg_production: "",
    egg_weight: "",
    feed_company: "",
    feed_type: "",
    pro_date: "",
    batch_no: "",
    hatchery: "",
    breed: "",
    disease: "",
    vaccine: "",
    remarks: "",
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
      loadVetVisits();
    }
  }, [selectedCompany]);

  async function loadVetVisits() {
    setLoading(true);
    try {
      const { data: visits, error: visitErr } = await supabase
        .from("vet_visits")
        .select("*")
        .eq("company_id", String(selectedCompany))
        .eq("status", "Activated");

      if (visitErr) throw visitErr;

      if (!visits || visits.length === 0) {
        setVisitsData([]);
        setLoading(false);
        return;
      }

      const { data: agentsData } = await supabase.from("agents").select("*");
      const { data: farmersData } = await supabase.from("farmers").select("*");

      const enrichedVisits = visits.map((v) => {
        const agent = agentsData?.find((a) => String(a.id) === String(v.agent_id));
        const farmer = farmersData?.find((f) => String(f.id) === String(v.farmer_id));

        return {
          ...v,
          agents: agent || { agent_name: "Unknown Agent" },
          farmers: farmer || { farmer_name: "Unknown Farmer", mobile: "-", village: "-", upazila: "-" },
        };
      });

      setVisitsData(enrichedVisits);
    } catch (err) {
      console.error("Error loading vet visits:", err);
    }
    setLoading(false);
  }

  function calculateAge(hatchDateStr: string, category: string, refDateStr?: string) {
    if (!hatchDateStr) return "N/A";
    const hatchDate = new Date(hatchDateStr);
    const refDate = refDateStr ? new Date(refDateStr) : new Date();
    const diffTime = refDate.getTime() - hatchDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return category?.toLowerCase().includes("layer") ? "0 Weeks" : "0 Days";

    const catLower = (category || "").toLowerCase();
    if (catLower.includes("layer")) {
      const totalWeeks = (diffDays / 7).toFixed(1);
      return `${totalWeeks} Weeks (${diffDays} Days)`;
    } else {
      return `${diffDays} Days`;
    }
  }

  function getBroilerDaysNumber(hatchDateStr: string) {
    if (!hatchDateStr) return 0;
    const hatchDate = new Date(hatchDateStr);
    const today = new Date();
    const diffTime = today.getTime() - hatchDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // --- Auto Calculations for Before Sale ---
  function updateBeforeCalculations(updatedFields: any) {
    const tBirds = Number(activeReportVisit?.t_birds) || 0;
    const feedTKg = Number(updatedFields.feed_t_kg !== undefined ? updatedFields.feed_t_kg : beforeForm.feed_t_kg) || 0;
    const mortality = Number(updatedFields.mortality_pcs !== undefined ? updatedFields.mortality_pcs : beforeForm.mortality_pcs) || 0;
    const weightGmB = Number(updatedFields.weight_gm_b !== undefined ? updatedFields.weight_gm_b : beforeForm.weight_gm_b) || 0;

    let feedGmB = beforeForm.feed_gm_b;
    let fcrWOutM = beforeForm.fcr_w_out_m;
    let fcrWithM = beforeForm.fcr_with_m;

    if (tBirds > 0) {
      feedGmB = ((feedTKg * 1000) / tBirds).toFixed(2);
    }

    if (weightGmB > 0 && feedTKg > 0) {
      const liveBirds = tBirds - mortality;
      const totalWeightKgWithoutM = (liveBirds * weightGmB) / 1000;
      const totalWeightKgWithM = (tBirds * weightGmB) / 1000;

      if (totalWeightKgWithoutM > 0) {
        fcrWOutM = (feedTKg / totalWeightKgWithoutM).toFixed(3);
      }
      if (totalWeightKgWithM > 0) {
        fcrWithM = (feedTKg / totalWeightKgWithM).toFixed(3);
      }
    }

    setBeforeForm((prev) => ({
      ...prev,
      ...updatedFields,
      feed_gm_b: feedGmB,
      fcr_w_out_m: fcrWOutM,
      fcr_with_m: fcrWithM,
    }));
  }

  // --- Auto Calculations for After Sale ---
  function updateAfterCalculations(updatedFields: any) {
    const tBirds = Number(activeReportVisit?.t_birds) || 0;
    const feedKg = Number(updatedFields.feed_consumption_kg !== undefined ? updatedFields.feed_consumption_kg : afterForm.feed_consumption_kg) || 0;
    const mortality = Number(updatedFields.mortality !== undefined ? updatedFields.mortality : afterForm.mortality) || 0;
    const weightGm = Number(updatedFields.weight !== undefined ? updatedFields.weight : afterForm.weight) || 0;

    let fcrWOutM = afterForm.fcr_w_out_m;
    let fcrWithM = afterForm.fcr_with_m;

    if (weightGm > 0 && feedKg > 0) {
      const liveBirds = tBirds - mortality;
      const totalWeightKgWithoutM = (liveBirds * weightGm) / 1000;
      const totalWeightKgWithM = (tBirds * weightGm) / 1000;

      if (totalWeightKgWithoutM > 0) {
        fcrWOutM = (feedKg / totalWeightKgWithoutM).toFixed(3);
      }
      if (totalWeightKgWithM > 0) {
        fcrWithM = (feedKg / totalWeightKgWithM).toFixed(3);
      }
    }

    setAfterForm((prev) => ({
      ...prev,
      ...updatedFields,
      fcr_w_out_m: fcrWOutM,
      fcr_with_m: fcrWithM,
    }));
  }

  function handleEditClick(visit: any) {
    setEditingVisit(visit);
    setEditForm({
      hatch_date: visit.hatch_date || "",
      hatchery: visit.hatchery || "",
      breed: visit.breed || "",
      box_no: visit.box_no || "",
      t_birds: visit.t_birds || "",
      category: visit.category || "Broiler",
    });
    setShowEditModal(true);
  }

  async function handleHistoryClick(visit: any) {
    setSelectedHistoryVisit(visit);
    setShowHistoryModal(true);

    const isLayer = visit.category?.toLowerCase() === "layer";

    let beforeData: any[] = [];
    let afterData: any[] = [];
    let layerData: any[] = [];

    if (isLayer) {
      const { data } = await supabase
        .from("layer_reports")
        .select("*")
        .eq("vet_visit_id", String(visit.id));
      layerData = data || [];
    } else {
      const { data: bData } = await supabase
        .from("before_sale_reports")
        .select("*")
        .eq("vet_visit_id", String(visit.id));
      beforeData = bData || [];

      const { data: aData } = await supabase
        .from("after_sale_reports")
        .select("*")
        .eq("vet_visit_id", String(visit.id));
      afterData = aData || [];
    }

    setFarmerHistory({
      before: beforeData,
      after: afterData,
      layer: layerData,
    });
  }

  function handleReportSelectChange(e: any, visit: any) {
    const val = e.target.value;
    if (!val) return;

    setActiveReportVisit(visit);
    setReportVisitDate(new Date().toISOString().split("T")[0]);

    if (val === "before_sale") {
      setBeforeForm({
        mortality_pcs: "",
        weight_gm_b: "",
        feed_t_kg: "",
        feed_gm_b: "",
        fcr_w_out_m: "",
        fcr_with_m: "",
        uneven: "",
        indigestion: "",
        orange_feces: "",
        watery_feces: "",
        feeder: "",
        drinker: "",
        floor_space: "",
        c_val: "",
        e_val: "",
        litter_condition: "",
        ventilation: "",
        feed_scattering: "",
        feed_hardness: "",
        feed_company: "",
        feed_type: "",
        pro_date: "",
        batch_no: "",
        remarks: "",
      });
      setShowBeforeSaleModal(true);
    } else if (val === "after_sale") {
      setAfterForm({
        mortality: "",
        weight: "",
        feed_consumption_kg: "",
        feed: "",
        feed_mill: "",
        fcr_w_out_m: "",
        fcr_with_m: "",
        remarks: "",
      });
      setShowAfterSaleModal(true);
    } else if (val === "layer_report") {
      setLayerForm({
        b_weight_g: "",
        feed_intake_g: "",
        egg_production: "",
        egg_weight: "",
        feed_company: "",
        feed_type: "",
        pro_date: "",
        batch_no: "",
        hatchery: visit.hatchery || "",
        breed: visit.breed || "",
        disease: "",
        vaccine: "",
        remarks: "",
      });
      setShowLayerModal(true);
    }

    e.target.value = "";
  }

  async function handleBeforeSaleSubmit() {
    if (!activeReportVisit) return;
    try {
      const { error } = await supabase.from("before_sale_reports").insert([
        {
          vet_visit_id: activeReportVisit.id,
          farmer_id: String(activeReportVisit.farmer_id),
          agent_id: String(activeReportVisit.agent_id),
          company_id: String(selectedCompany),
          visit_date: reportVisitDate,
          mortality_pcs: Number(beforeForm.mortality_pcs) || 0,
          weight_gm_b: Number(beforeForm.weight_gm_b) || 0,
          feed_t_kg: Number(beforeForm.feed_t_kg) || 0,
          feed_gm_b: Number(beforeForm.feed_gm_b) || 0,
          fcr_w_out_m: Number(beforeForm.fcr_w_out_m) || 0,
          fcr_with_m: Number(beforeForm.fcr_with_m) || 0,
          uneven: beforeForm.uneven,
          indigestion: beforeForm.indigestion,
          orange_feces: beforeForm.orange_feces,
          watery_feces: beforeForm.watery_feces,
          feeder: beforeForm.feeder,
          drinker: beforeForm.drinker,
          floor_space: beforeForm.floor_space,
          c_val: beforeForm.c_val,
          e_val: beforeForm.e_val,
          litter_condition: beforeForm.litter_condition,
          ventilation: beforeForm.ventilation,
          feed_scattering: beforeForm.feed_scattering,
          feed_hardness: beforeForm.feed_hardness,
          feed_company: beforeForm.feed_company,
          feed_type: beforeForm.feed_type,
          pro_date: beforeForm.pro_date || null,
          batch_no: beforeForm.batch_no,
          remarks: beforeForm.remarks,
        },
      ]);

      if (error) throw error;
      alert("Before Sale Report saved successfully!");
      setShowBeforeSaleModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to save report");
    }
  }

  async function handleAfterSaleSubmit() {
    if (!activeReportVisit) return;
    try {
      const { error } = await supabase.from("after_sale_reports").insert([
        {
          vet_visit_id: activeReportVisit.id,
          farmer_id: String(activeReportVisit.farmer_id),
          agent_id: String(activeReportVisit.agent_id),
          company_id: String(selectedCompany),
          visit_date: reportVisitDate,
          mortality: Number(afterForm.mortality) || 0,
          weight: Number(afterForm.weight) || 0,
          feed_consumption_kg: Number(afterForm.feed_consumption_kg) || 0,
          feed: afterForm.feed,
          feed_mill: afterForm.feed_mill,
          fcr_w_out_m: Number(afterForm.fcr_w_out_m) || 0,
          fcr_with_m: Number(afterForm.fcr_with_m) || 0,
          remarks: afterForm.remarks,
        },
      ]);

      if (error) throw error;
      alert("After Sale Report saved successfully!");
      setShowAfterSaleModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to save report");
    }
  }

  async function handleLayerReportSubmit() {
    if (!activeReportVisit) return;
    try {
      const { error } = await supabase.from("layer_reports").insert([
        {
          vet_visit_id: activeReportVisit.id,
          farmer_id: String(activeReportVisit.farmer_id),
          agent_id: String(activeReportVisit.agent_id),
          company_id: String(selectedCompany),
          visit_date: reportVisitDate,
          b_weight_g: Number(layerForm.b_weight_g) || 0,
          feed_intake_g: Number(layerForm.feed_intake_g) || 0,
          egg_production: Number(layerForm.egg_production) || 0,
          egg_weight: Number(layerForm.egg_weight) || 0,
          feed_company: layerForm.feed_company,
          feed_type: layerForm.feed_type,
          pro_date: layerForm.pro_date || null,
          batch_no: layerForm.batch_no,
          hatchery: layerForm.hatchery,
          breed: layerForm.breed,
          disease: layerForm.disease,
          vaccine: layerForm.vaccine,
          remarks: layerForm.remarks,
        },
      ]);

      if (error) throw error;
      alert("Layer Performance Report saved successfully!");
      setShowLayerModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to save report");
    }
  }

  async function handleUpdateSubmit() {
    if (!editingVisit) return;

    try {
      const { error } = await supabase
        .from("vet_visits")
        .update({
          hatch_date: editForm.hatch_date,
          hatchery: editForm.hatchery,
          breed: editForm.breed,
          box_no: editForm.box_no,
          t_birds: Number(editForm.t_birds),
          category: editForm.category,
        })
        .eq("id", editingVisit.id);

      if (error) throw error;

      alert("Vet Visit details updated successfully!");
      setShowEditModal(false);
      loadVetVisits();
    } catch (err: any) {
      alert(err.message || "Failed to update");
    }
  }

  const totalActiveCount = visitsData.length;
  const categoryCounts: { [key: string]: number } = {};
  visitsData.forEach((v) => {
    const cat = v.category || "Broiler";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const agentMap: { [key: string]: { agentName: string; visits: any[]; counts: { [key: string]: number } } } = {};

  visitsData.forEach((v) => {
    const agentId = v.agents?.id || "unknown";
    const agentName = v.agents?.agent_name || "Unknown Agent";

    if (!agentMap[agentId]) {
      agentMap[agentId] = {
        agentName,
        visits: [],
        counts: {},
      };
    }

    if (selectedCategoryFilter === "all" || v.category?.toLowerCase() === selectedCategoryFilter.toLowerCase()) {
      agentMap[agentId].visits.push(v);
      const cat = v.category || "Broiler";
      agentMap[agentId].counts[cat] = (agentMap[agentId].counts[cat] || 0) + 1;
    }
  });

  const filteredAgentsList = Object.values(agentMap).filter((ag) => ag.visits.length > 0);

  if (loading && companies.length === 0) return <div className="p-6">Loading Vet Visits...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Vet Visits - Activated Farmers</h1>

      {/* Top Filters & Summary Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Company Filter</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white min-w-[220px]"
            >
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.company_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category Filter</label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white min-w-[220px]"
            >
              <option value="all">All Categories</option>
              <option value="Broiler">Broiler</option>
              <option value="Layer">Layer</option>
              <option value="Sonali">Sonali</option>
              <option value="Cattle">Cattle</option>
              <option value="Fish">Fish</option>
            </select>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 text-emerald-900">
          <div>
            <span className="font-bold text-lg">Total Active Farmers: </span>
            <span className="bg-emerald-600 text-white px-3 py-1 rounded-full font-bold text-sm ml-2">
              {totalActiveCount}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <span key={cat} className="bg-white border border-emerald-300 px-2.5 py-1 rounded-md text-emerald-800">
                {cat}: <strong>{count}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {filteredAgentsList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
          No activated farmers found for the selected filter.
        </div>
      ) : (
        filteredAgentsList.map((agentGroup, idx) => {
          const agentTotal = agentGroup.visits.length;
          const agentCountsText = Object.entries(agentGroup.counts)
            .map(([c, cnt]) => `${c}: ${cnt}`)
            .join(", ");

          return (
            <div key={idx} className="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
                <h2 className="font-bold text-lg text-slate-700">
                  Agent: <span className="text-emerald-600">{agentGroup.agentName}</span>
                </h2>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                  Active Farmers: {agentTotal} ({agentCountsText})
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="px-4 py-3">Farmer Details</th>
                      <th className="px-4 py-3">Batch Info</th>
                      <th className="px-4 py-3">Total Birds</th>
                      <th className="px-4 py-3 font-bold text-emerald-600">Age (Today)</th>
                      <th className="px-4 py-3">Action / Vaccine Info</th>
                      <th className="px-4 py-3">Report</th>
                      <th className="px-4 py-3">History</th>
                      <th className="px-4 py-3 text-center">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentGroup.visits.map((visit) => {
                      const farmer = visit.farmers || {};
                      const category = visit.category || "Broiler";
                      const isBroiler = category.toLowerCase() === "broiler";
                      const isLayer = category.toLowerCase() === "layer";
                      const ageText = calculateAge(visit.hatch_date, category);
                      const broilerDays = getBroilerDaysNumber(visit.hatch_date);
                      const isSellTime = isBroiler && broilerDays >= 28;

                      return (
                        <tr key={visit.id} className="border-b border-slate-100 hover:bg-slate-50/50 align-top">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800">{farmer.farmer_name || farmer.name || "N/A"}</div>
                            <div className="text-xs text-slate-500">Mobile: {farmer.mobile || "-"}</div>
                            <div className="text-xs text-slate-500">
                              Village: {farmer.village || "-"}, Upazila: {farmer.upazila || "-"}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-slate-600 space-y-0.5">
                            <div><strong className="text-slate-700">Type:</strong> {category}</div>
                            <div><strong className="text-slate-700">Hatch Date:</strong> {visit.hatch_date || "-"}</div>
                            <div><strong className="text-slate-700">Hatchery:</strong> {visit.hatchery || "-"}</div>
                            <div><strong className="text-slate-700">Breed:</strong> {visit.breed || "-"}</div>
                            <div><strong className="text-slate-700">Box No:</strong> {visit.box_no || "-"}</div>
                          </td>

                          <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                            {visit.t_birds || "0"}
                          </td>

                          <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                            {ageText}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            <div className="text-xs text-slate-400 italic mb-1">[Vaccine schedule loading...]</div>
                            {isSellTime && (
                              <div className="mt-1 inline-block bg-red-50 border border-red-200 text-red-600 text-xs px-2 py-1 rounded font-semibold">
                                Time to sell. Take After Sale Report.
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {isBroiler ? (
                              <select
                                defaultValue=""
                                onChange={(e) => handleReportSelectChange(e, visit)}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-sm focus:border-emerald-500 outline-none"
                              >
                                <option value="" disabled>Select Report</option>
                                <option value="before_sale">Before Sale Report</option>
                                <option value="after_sale">After Sale Report</option>
                              </select>
                            ) : isLayer ? (
                              <select
                                defaultValue=""
                                onChange={(e) => handleReportSelectChange(e, visit)}
                                className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs shadow-sm focus:border-indigo-500 outline-none text-indigo-800 font-semibold"
                              >
                                <option value="" disabled>Select Report</option>
                                <option value="layer_report">Layer Report</option>
                              </select>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No report available</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleHistoryClick(visit)}
                              className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                            >
                              History
                            </button>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleEditClick(visit)}
                              className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                              title="Edit Visit Details"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

      {/* Before Sale Modal */}
      {showBeforeSaleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-xl w-[700px] max-h-[90vh] overflow-auto shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Before Sale Report Form</h3>
              <button onClick={() => setShowBeforeSaleModal(false)} className="text-slate-500 font-bold text-lg">✖</button>
            </div>

            <div className="mb-4 bg-slate-50 p-3 rounded-lg border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase block">Visit Date (Affects Age Calculation)</span>
                <input type="date" value={reportVisitDate} onChange={(e)=>setReportVisitDate(e.target.value)} className="mt-1 border rounded p-1.5 text-sm" />
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-500">Calculated Age on Visit Date:</span>
                <div className="font-bold text-emerald-600 text-sm">
                  {calculateAge(activeReportVisit?.hatch_date, activeReportVisit?.category, reportVisitDate)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mortality (Pcs)</label>
                <input type="number" value={beforeForm.mortality_pcs} onChange={(e)=>updateBeforeCalculations({ mortality_pcs: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Weight (g/b)</label>
                <input type="number" value={beforeForm.weight_gm_b} onChange={(e)=>updateBeforeCalculations({ weight_gm_b: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feed (T. Kg)</label>
                <input type="number" value={beforeForm.feed_t_kg} onChange={(e)=>updateBeforeCalculations({ feed_t_kg: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feed (g/b) [Auto]</label>
                <input type="number" disabled value={beforeForm.feed_gm_b} className="w-full border rounded p-2 bg-slate-100 text-slate-600 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">FCR (W.out M) [Auto]</label>
                <input type="number" disabled value={beforeForm.fcr_w_out_m} className="w-full border rounded p-2 bg-slate-100 text-slate-600 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">FCR (With M) [Auto]</label>
                <input type="number" disabled value={beforeForm.fcr_with_m} className="w-full border rounded p-2 bg-slate-100 text-slate-600 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Uneven</label>
                <input type="text" value={beforeForm.uneven} onChange={(e)=>setBeforeForm({...beforeForm, uneven: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Indigestion</label>
                <input type="text" value={beforeForm.indigestion} onChange={(e)=>setBeforeForm({...beforeForm, indigestion: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Orange Feces</label>
                <input type="text" value={beforeForm.orange_feces} onChange={(e)=>setBeforeForm({...beforeForm, orange_feces: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Watery Feces</label>
                <input type="text" value={beforeForm.watery_feces} onChange={(e)=>setBeforeForm({...beforeForm, watery_feces: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feeder</label>
                <input type="text" value={beforeForm.feeder} onChange={(e)=>setBeforeForm({...beforeForm, feeder: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Drinker</label>
                <input type="text" value={beforeForm.drinker} onChange={(e)=>setBeforeForm({...beforeForm, drinker: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Floor Space</label>
                <input type="text" value={beforeForm.floor_space} onChange={(e)=>setBeforeForm({...beforeForm, floor_space: e.target.value})} className="w-full border rounded p-2" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Litter Condition</label>
                <input type="text" value={beforeForm.litter_condition} onChange={(e)=>setBeforeForm({...beforeForm, litter_condition: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ventilation</label>
                <input type="text" value={beforeForm.ventilation} onChange={(e)=>setBeforeForm({...beforeForm, ventilation: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feed Scattering</label>
                <input type="text" value={beforeForm.feed_scattering} onChange={(e)=>setBeforeForm({...beforeForm, feed_scattering: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feed Hardness</label>
                <input type="text" value={beforeForm.feed_hardness} onChange={(e)=>setBeforeForm({...beforeForm, feed_hardness: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feed Company</label>
                <input type="text" value={beforeForm.feed_company} onChange={(e)=>setBeforeForm({...beforeForm, feed_company: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feed Type</label>
                <input type="text" value={beforeForm.feed_type} onChange={(e)=>setBeforeForm({...beforeForm, feed_type: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Pro. Date</label>
                <input type="date" value={beforeForm.pro_date} onChange={(e)=>setBeforeForm({...beforeForm, pro_date: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Batch No.</label>
                <input type="text" value={beforeForm.batch_no} onChange={(e)=>setBeforeForm({...beforeForm, batch_no: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Remarks</label>
                <input type="text" value={beforeForm.remarks} onChange={(e)=>setBeforeForm({...beforeForm, remarks: e.target.value})} className="w-full border rounded p-2" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <button onClick={() => setShowBeforeSaleModal(false)} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm">Cancel</button>
              <button onClick={handleBeforeSaleSubmit} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium">Save Report</button>
            </div>
          </div>
        </div>
      )}

      {/* After Sale Modal */}
      {showAfterSaleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-xl w-[500px] max-h-[90vh] overflow-auto shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">After Sale Report Form</h3>
              <button onClick={() => setShowAfterSaleModal(false)} className="text-slate-500 font-bold text-lg">✖</button>
            </div>

            <div className="mb-4 bg-slate-50 p-3 rounded-lg border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase block">Visit Date</span>
                <input type="date" value={reportVisitDate} onChange={(e)=>setReportVisitDate(e.target.value)} className="mt-1 border rounded p-1.5 text-sm" />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mortality</label>
                <input type="number" value={afterForm.mortality} onChange={(e)=>updateAfterCalculations({ mortality: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Weight (g)</label>
                <input type="number" value={afterForm.weight} onChange={(e)=>updateAfterCalculations({ weight: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feed Consumption (Kg)</label>
                <input type="number" value={afterForm.feed_consumption_kg} onChange={(e)=>updateAfterCalculations({ feed_consumption_kg: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feed</label>
                <input type="text" value={afterForm.feed} onChange={(e)=>setAfterForm({...afterForm, feed: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feed Mill</label>
                <input type="text" value={afterForm.feed_mill} onChange={(e)=>setAfterForm({...afterForm, feed_mill: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">FCR (W.out M) [Auto]</label>
                <input type="number" disabled value={afterForm.fcr_w_out_m} className="w-full border rounded p-2 bg-slate-100 text-slate-600 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">FCR (With M) [Auto]</label>
                <input type="number" disabled value={afterForm.fcr_with_m} className="w-full border rounded p-2 bg-slate-100 text-slate-600 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Remarks</label>
                <input type="text" value={afterForm.remarks} onChange={(e)=>setAfterForm({...afterForm, remarks: e.target.value})} className="w-full border rounded p-2" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <button onClick={() => setShowAfterSaleModal(false)} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm">Cancel</button>
              <button onClick={handleAfterSaleSubmit} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium">Save Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Layer Report Modal */}
      {showLayerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-xl w-[700px] max-h-[90vh] overflow-auto shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-indigo-800">Layer Performance Report Form</h3>
              <button onClick={() => setShowLayerModal(false)} className="text-slate-500 font-bold text-lg">✖</button>
            </div>

            <div className="mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-900 uppercase block">Visit Date (Affects Age in Weeks)</span>
                <input type="date" value={reportVisitDate} onChange={(e)=>setReportVisitDate(e.target.value)} className="mt-1 border rounded p-1.5 text-sm" />
              </div>
              <div className="text-right text-xs">
                <span className="text-indigo-700">Calculated Age on Visit Date:</span>
                <div className="font-bold text-indigo-900 text-sm">
                  {calculateAge(activeReportVisit?.hatch_date, activeReportVisit?.category, reportVisitDate)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">B. Weight (g)</label>
                <input type="number" value={layerForm.b_weight_g} onChange={(e)=>setLayerForm({...layerForm, b_weight_g: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feed Intake (g)</label>
                <input type="number" value={layerForm.feed_intake_g} onChange={(e)=>setLayerForm({...layerForm, feed_intake_g: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Egg Production (%)</label>
                <input type="number" value={layerForm.egg_production} onChange={(e)=>setLayerForm({...layerForm, egg_production: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Egg Weight (g)</label>
                <input type="number" value={layerForm.egg_weight} onChange={(e)=>setLayerForm({...layerForm, egg_weight: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feed Company</label>
                <input type="text" value={layerForm.feed_company} onChange={(e)=>setLayerForm({...layerForm, feed_company: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Feed Type</label>
                <input type="text" value={layerForm.feed_type} onChange={(e)=>setLayerForm({...layerForm, feed_type: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Pro. Date</label>
                <input type="date" value={layerForm.pro_date} onChange={(e)=>setLayerForm({...layerForm, pro_date: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Batch No.</label>
                <input type="text" value={layerForm.batch_no} onChange={(e)=>setLayerForm({...layerForm, batch_no: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Hatchery</label>
                <input type="text" value={layerForm.hatchery} onChange={(e)=>setLayerForm({...layerForm, hatchery: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Breed</label>
                <input type="text" value={layerForm.breed} onChange={(e)=>setLayerForm({...layerForm, breed: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Disease</label>
                <input type="text" value={layerForm.disease} onChange={(e)=>setLayerForm({...layerForm, disease: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Vaccine</label>
                <input type="text" value={layerForm.vaccine} onChange={(e)=>setLayerForm({...layerForm, vaccine: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Remarks</label>
                <input type="text" value={layerForm.remarks} onChange={(e)=>setLayerForm({...layerForm, remarks: e.target.value})} className="w-full border rounded p-2" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <button onClick={() => setShowLayerModal(false)} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm">Cancel</button>
              <button onClick={handleLayerReportSubmit} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium">Save Layer Report</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-xl w-[850px] max-h-[90vh] overflow-auto shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Farmer History: {selectedHistoryVisit?.farmers?.farmer_name || selectedHistoryVisit?.farmers?.name || "N/A"} ({selectedHistoryVisit?.category || "Broiler"})
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-500 font-bold text-lg">✖</button>
            </div>

            <div className="space-y-6">
              {/* If Category is Layer, show only Layer reports */}
              {selectedHistoryVisit?.category?.toLowerCase() === "layer" ? (
                <div>
                  <h4 className="font-bold text-indigo-700 mb-2">Layer Reports ({farmerHistory.layer.length})</h4>
                  {farmerHistory.layer.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No layer reports found.</p>
                  ) : (
                    <div className="space-y-2">
                      {farmerHistory.layer.map((rep: any, i: number) => (
                        <div key={i} className="bg-indigo-50/50 p-3 rounded border border-indigo-100 text-xs grid grid-cols-3 gap-2">
                          <div><strong>Visit Date:</strong> {rep.visit_date || new Date(rep.created_at).toLocaleDateString()}</div>
                          <div><strong>Age on Visit:</strong> {calculateAge(selectedHistoryVisit?.hatch_date, "Layer", rep.visit_date)}</div>
                          <div><strong>B. Weight:</strong> {rep.b_weight_g}g</div>
                          <div><strong>Feed Intake:</strong> {rep.feed_intake_g}g</div>
                          <div><strong>Egg Production:</strong> {rep.egg_production}%</div>
                          <div><strong>Egg Weight:</strong> {rep.egg_weight}g</div>
                          <div><strong>Disease:</strong> {rep.disease || "-"}</div>
                          <div><strong>Vaccine:</strong> {rep.vaccine || "-"}</div>
                          <div><strong>Remarks:</strong> {rep.remarks || "-"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Otherwise show Broiler reports (Before & After Sale) */
                <>
                  <div>
                    <h4 className="font-bold text-emerald-700 mb-2">Before Sale Reports ({farmerHistory.before.length})</h4>
                    {farmerHistory.before.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No before sale reports found.</p>
                    ) : (
                      <div className="space-y-2">
                        {farmerHistory.before.map((rep: any, i: number) => (
                          <div key={i} className="bg-slate-50 p-3 rounded border text-xs grid grid-cols-3 gap-2">
                            <div><strong>Visit Date:</strong> {rep.visit_date || new Date(rep.created_at).toLocaleDateString()}</div>
                            <div><strong>Age on Visit:</strong> {calculateAge(selectedHistoryVisit?.hatch_date, "Broiler", rep.visit_date)}</div>
                            <div><strong>Mortality:</strong> {rep.mortality_pcs}</div>
                            <div><strong>Weight:</strong> {rep.weight_gm_b}g</div>
                            <div><strong>FCR (w/o M):</strong> {rep.fcr_w_out_m}</div>
                            <div><strong>Remarks:</strong> {rep.remarks || "-"}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-emerald-700 mb-2">After Sale Reports ({farmerHistory.after.length})</h4>
                    {farmerHistory.after.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No after sale reports found.</p>
                    ) : (
                      <div className="space-y-2">
                        {farmerHistory.after.map((rep: any, i: number) => (
                          <div key={i} className="bg-slate-50 p-3 rounded border text-xs grid grid-cols-3 gap-2">
                            <div><strong>Visit Date:</strong> {rep.visit_date || new Date(rep.created_at).toLocaleDateString()}</div>
                            <div><strong>Mortality:</strong> {rep.mortality}</div>
                            <div><strong>Weight:</strong> {rep.weight}g</div>
                            <div><strong>Feed Consump:</strong> {rep.feed_consumption_kg} Kg</div>
                            <div><strong>FCR (w/o M):</strong> {rep.fcr_w_out_m}</div>
                            <div><strong>Remarks:</strong> {rep.remarks || "-"}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t mt-4">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-xl w-[500px] max-h-[90vh] overflow-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Edit Vet Visit Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-500 font-bold text-lg">✖</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Category / Farm Type</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
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
                  value={editForm.hatch_date}
                  onChange={(e) => setEditForm({ ...editForm, hatch_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Hatchery</label>
                <input
                  type="text"
                  placeholder="Hatchery Name"
                  value={editForm.hatchery}
                  onChange={(e) => setEditForm({ ...editForm, hatchery: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Breed</label>
                <input
                  type="text"
                  placeholder="Breed Name"
                  value={editForm.breed}
                  onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Box No.</label>
                <input
                  type="text"
                  placeholder="Box No"
                  value={editForm.box_no}
                  onChange={(e) => setEditForm({ ...editForm, box_no: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">T. Birds (Total Birds)</label>
                <input
                  type="number"
                  placeholder="Total Birds"
                  value={editForm.t_birds}
                  onChange={(e) => setEditForm({ ...editForm, t_birds: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm"
                >
                  Update Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}