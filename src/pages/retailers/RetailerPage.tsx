import LocationPicker from "../../components/maps/LocationPicker";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getAgents } from "../../services/agentService";
import {
  getRetailers,
  createRetailer,
  updateRetailer,
  deleteRetailer,
} from "../../services/retailerService";
import {
  MapContainer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  FaMapMarkerAlt,
  FaMap,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import { getBazars } from "../../services/bazarService";
import { createRetailerMarker } from "../../utils/mapMarkers";
import MapLayers from "../../components/maps/MapLayers";
import ExcelJS from "exceljs";

function RecenterMap({
  position,
}: {
  position: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 17, {
      animate: true,
      duration: 1.5,
    });
  }, [position, map]);

  return null;
}

function FitBounds({
  positions,
}: {
  positions: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (
      positions.length > 0
    ) {
      map.fitBounds(
        positions,
        {
          padding: [50, 50],
        }
      );
    }
  }, [positions, map]);

  return null;
}

export default function RetailerPage() {
  const [showForm, setShowForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [retailers, setRetailers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRetailer, setSelectedRetailer] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    agent_id: "",
    company_id: "",
    retailer_name: "",
    proprietor: "",
    mobile: "",
    bazar: "",
    union_name: "",
    upazila: "",
    district: "Mymensingh",
    broiler_sale: "0",
    layer_sale: "0",
    sonali_sale: "0",
    cattle_sale: "0",
    fish_sale: "0",
    monthly_sale: "0",
    focus_item: "",
    latitude: "",
    longitude: "",
    status: "Active",
  });

  const [companyFilter, setCompanyFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("Mymensingh");
  const [upazilaFilter, setUpazilaFilter] = useState("");
  const [unionFilter, setUnionFilter] = useState("");
  const [bazarFilter, setBazarFilter] = useState("");
  
  const [showRetailerMap, setShowRetailerMap] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearestRetailers, setNearestRetailers] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([24.75, 90.40]);

  const [districts, setDistricts] = useState<any[]>([]);
  const [upazilas, setUpazilas] = useState<any[]>([]);
  const [unions, setUnions] = useState<any[]>([]);
  const [bazars, setBazars] = useState<any[]>([]);

  const [filterUpazilas, setFilterUpazilas] = useState<any[]>([]);
  const [filterUnions, setFilterUnions] = useState<any[]>([]);
  const [filterBazars, setFilterBazars] = useState<any[]>([]);

  const [showSummary, setShowSummary] = useState(false);
  const [myLocationMode, setMyLocationMode] = useState(false);

  useEffect(() => {
    if (
      filteredRetailers.length > 0 &&
      filteredRetailers[0].latitude &&
      filteredRetailers[0].longitude
    ) {
      const newPosition: [number, number] = [
        Number(filteredRetailers[0].latitude),
        Number(filteredRetailers[0].longitude),
      ];
      setMapCenter(newPosition);
    }
  }, [
    districtFilter,
    upazilaFilter,
    unionFilter,
    companyFilter,
    agentFilter,
  ]);

  function clearFilters() {
    setCompanyFilter("");
    setAgentFilter("");
    setDistrictFilter("");
    setUpazilaFilter("");
    setUnionFilter("");
    setBazarFilter("");
    setSearch("");
  }

  function getMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setUserLocation([lat, lon]);
        setSelectedLocation([lat, lon]);

        setTimeout(() => {
          setSelectedLocation(null);
        }, 1000);

        setMyLocationMode(true);
        setSelectedLocation([lat, lon]);

        const nearest = filteredRetailers
          .filter((a) => a.latitude && a.longitude)
          .map((a) => ({
            ...a,
            distance: getDistanceKm(
              lat,
              lon,
              Number(a.latitude),
              Number(a.longitude)
            ),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10);

        setNearestRetailers(nearest);
      },
      () => {
        alert("Location access denied");
      }
    );
  }

  function getDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  async function loadData() {
    const retailerData = await getRetailers();
    setRetailers(retailerData || []);

    const agentData = await getAgents();
    setAgents(agentData || []);

    const bazarData = await getBazars();
    setBazars(bazarData || []);

    const { data: companyData } = await supabase
      .from("companies")
      .select("*")
      .order("company_name");
    setCompanies(companyData || []);

    const { data: districtData } = await supabase
      .from("districts")
      .select("*")
      .order("name");
    setDistricts(districtData || []);

    const { data: unionData } = await supabase
      .from("unions")
      .select("*")
      .order("name");
    setUnions(unionData || []);
  }

  useEffect(() => {
    const total =
      Number(form.broiler_sale || 0) +
      Number(form.layer_sale || 0) +
      Number(form.sonali_sale || 0) +
      Number(form.cattle_sale || 0) +
      Number(form.fish_sale || 0);

    setForm((prev) => ({
      ...prev,
      monthly_sale: total.toString(),
    }));
  }, [
    form.broiler_sale,
    form.layer_sale,
    form.sonali_sale,
    form.cattle_sale,
    form.fish_sale,
  ]);

  useEffect(() => {
    if (districts.length > 0 && form.district === "") {
      const mymensingh = districts.find((d) => d.name === "Mymensingh");
      if (mymensingh) {
        setForm((prev) => ({
          ...prev,
          district: mymensingh.name,
        }));
      }
    }
  }, [districts]);

  useEffect(() => {
    if (!form.district) {
      setUpazilas([]);
      return;
    }

    async function loadUpazilas() {
      const district = districts.find((d) => d.name === form.district);
      if (!district) return;

      const { data } = await supabase
        .from("upazilas")
        .select("*")
        .eq("district_id", district.id)
        .order("name");

      setUpazilas(data || []);
    }

    loadUpazilas();
  }, [form.district, districts]);

  useEffect(() => {
    if (!form.upazila) {
      setUnions([]);
      return;
    }

    async function loadUnions() {
      const upazila = upazilas.find((u) => u.name === form.upazila);
      if (!upazila) return;

      const { data } = await supabase
        .from("unions")
        .select("*")
        .eq("upazila_id", upazila.id)
        .order("name");

      setUnions(data || []);
    }

    loadUnions();
  }, [form.upazila, upazilas]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!districtFilter) {
      setFilterUpazilas([]);
      setFilterUnions([]);
      setFilterBazars([]);
      return;
    }

    async function loadFilterUpazilas() {
      const district = districts.find((d) => d.name === districtFilter);
      if (!district) return;

      const { data } = await supabase
        .from("upazilas")
        .select("*")
        .eq("district_id", district.id)
        .order("name");

      setFilterUpazilas(data || []);
    }

    loadFilterUpazilas();
  }, [districtFilter, districts]);

  useEffect(() => {
    if (!upazilaFilter) {
      setFilterUnions([]);
      setFilterBazars([]);
      return;
    }

    async function loadFilterUnions() {
      const upazila = filterUpazilas.find((u) => u.name === upazilaFilter);
      if (!upazila) return;

      const { data } = await supabase
        .from("unions")
        .select("*")
        .eq("upazila_id", upazila.id)
        .order("name");

      setFilterUnions(data || []);
    }

    loadFilterUnions();
  }, [upazilaFilter, filterUpazilas]);

  useEffect(() => {
    if (!unionFilter) {
      setFilterBazars([]);
      return;
    }

    async function loadFilterBazars() {
      const union = filterUnions.find((u) => u.name === unionFilter);
      if (!union) return;

      const { data } = await supabase
        .from("bazars")
        .select("*")
        .eq("union_id", union.id)
        .order("name");

      setFilterBazars(data || []);
    }

    loadFilterBazars();
  }, [unionFilter, filterUnions]);

  async function handleSave() {
    try {
      if (!form.company_id || !form.retailer_name) {
        alert("Company and Retailer Name Required");
        return;
      }

      const payload = {
        ...form,
        agent_id: form.agent_id ? Number(form.agent_id) : null,
        company_id: Number(form.company_id),
        broiler_sale: Number(form.broiler_sale || 0),
        layer_sale: Number(form.layer_sale || 0),
        sonali_sale: Number(form.sonali_sale || 0),
        cattle_sale: Number(form.cattle_sale || 0),
        fish_sale: Number(form.fish_sale || 0),
        monthly_sale: form.monthly_sale === "" ? 0 : Number(form.monthly_sale),
        latitude: form.latitude === "" ? null : Number(form.latitude),
        longitude: form.longitude === "" ? null : Number(form.longitude),
      };

      if (editingId) {
        await updateRetailer(editingId, payload);
        alert("Retailer Updated");
      } else {
        await createRetailer(payload);
        alert("Retailer Saved");
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error?.message || "Save Failed");
    }
  }

  function resetForm() {
    setForm({
      agent_id: "",
      company_id: "",
      retailer_name: "",
      proprietor: "",
      mobile: "",
      bazar: "",
      union_name: "",
      upazila: "",
      district: "Mymensingh",
      broiler_sale: "0",
      layer_sale: "0",
      sonali_sale: "0",
      cattle_sale: "0",
      fish_sale: "0",
      monthly_sale: "0",
      focus_item: "",
      latitude: "",
      longitude: "",
      status: "Active",
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete Retailer?")) return;
    await deleteRetailer(id);
    loadData();
  }

  const filteredRetailers = retailers.filter((r) => {
    const matchSearch = r.retailer_name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchCompany =
      companyFilter === "" ? true : String(r.company_id) === companyFilter;

    const matchAgent =
      agentFilter === "" ? true : String(r.agent_id) === agentFilter;

    const matchDistrict =
      districtFilter === "" ? true : r.district === districtFilter;

    const matchUpazila =
      upazilaFilter === "" ? true : r.upazila === upazilaFilter;

    const matchUnion =
      unionFilter === "" ? true : r.union_name === unionFilter;

    const matchBazar =
      bazarFilter === "" ? true : r.bazar === bazarFilter;

    return (
      matchSearch &&
      matchCompany &&
      matchAgent &&
      matchDistrict &&
      matchUpazila &&
      matchUnion &&
      matchBazar
    );
  });

  const selectedDistrict = districts.find((d) => d.name === form.district);
  const selectedUpazila = upazilas.find((u: any) => u.name === form.upazila);
  const selectedUnion = unions.find((u: any) => u.name === form.union_name);

  const filteredBazars = bazars.filter(
    (b: any) => b.union_id === selectedUnion?.id
  );

  const selectedCompanyName =
    companies.find((c) => String(c.id) === companyFilter)?.company_name ||
    "All Companies";

  const totalMonthlySale = filteredRetailers.reduce(
    (sum, r) => sum + Number(r.monthly_sale || 0),
    0
  );

  const companySummary = Object.values(
    filteredRetailers.reduce((acc: any, r) => {
      const company = r.companies?.company_name || "Unknown";
      if (!acc[company]) {
        acc[company] = {
          name: company,
          agents: 0,
          sale: 0,
        };
      }
      acc[company].agents += 1;
      acc[company].sale += Number(r.monthly_sale || 0);
      return acc;
    }, {})
  );

  const sortedRetailers = [...filteredRetailers].sort((a: any, b: any) => {
    const companyCompare = (
      a.companies?.company_name || ""
    ).localeCompare(b.companies?.company_name || "");

    if (companyCompare !== 0) {
      return companyCompare;
    }

    return (a.retailer_name || "").localeCompare(b.retailer_name || "");
  });

  // Export Excel
  async function exportRetailersExcel() {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Retailers");

      worksheet.getRow(1).values = [
        "Company",
        "Parent Agent",
        "Retailer Name",
        "Proprietor",
        "Mobile",
        "Bazar",
        "District",
        "Upazila",
        "Union",
        "Broiler Sale",
        "Layer Sale",
        "Sonali Sale",
        "Cattle Sale",
        "Fish Sale",
        "Total Monthly Sale",
        "Focus Item",
        "Status",
      ];

      sortedRetailers.forEach((r: any) => {
        worksheet.addRow([
          r.companies?.company_name || "",
          r.agents?.agent_name || "",
          r.retailer_name || "",
          r.proprietor || "",
          r.mobile || "",
          r.bazar || "",
          r.district || "",
          r.upazila || "",
          r.union_name || "",
          Number(r.broiler_sale || 0),
          Number(r.layer_sale || 0),
          Number(r.sonali_sale || 0),
          Number(r.cattle_sale || 0),
          Number(r.fish_sale || 0),
          Number(r.monthly_sale || 0),
          r.focus_item || "",
          r.status || "",
        ]);
      });

      for (let col = 1; col <= 17; col++) {
        const cell = worksheet.getCell(1, col);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "1E3A8A" },
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const today = new Date().toISOString().split("T")[0];
      const selectedCompany = companies.find(
        (c) => String(c.id) === companyFilter
      )?.company_name;

      const fileName = `Retailers_${selectedCompany || "All"}_${districtFilter || "AllDistricts"}_${today}.xlsx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Retailer Excel Export Error:", error);
      alert("Retailer Excel export failed.");
    }
  }

  useEffect(() => {
    setMyLocationMode(false);
  }, [companyFilter, agentFilter, districtFilter, upazilaFilter, unionFilter]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          onClick={() => {
            setEditingId(null);
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? "Close Form" : "+ Add Retailer"}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg w-[700px] max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Retailer" : "Add Retailer"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="text-xl font-bold"
              >
                ✖
              </button>
            </div>

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Company
            </label>
            <select
              value={form.company_id}
              onChange={(e) =>
                setForm({ ...form, company_id: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Parent Agent
            </label>
            <select
              value={form.agent_id}
              onChange={(e) =>
                setForm({ ...form, agent_id: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            >
              <option value="">Select Parent Agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.agent_name}
                </option>
              ))}
            </select>

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Retailer Name
            </label>
            <input
              placeholder="Retailer Name"
              value={form.retailer_name}
              onChange={(e) =>
                setForm({ ...form, retailer_name: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            />

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Proprietor
            </label>
            <input
              placeholder="Proprietor"
              value={form.proprietor}
              onChange={(e) =>
                setForm({ ...form, proprietor: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            />

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Mobile
            </label>
            <input
              placeholder="Mobile"
              value={form.mobile}
              onChange={(e) =>
                setForm({ ...form, mobile: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            />

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              District
            </label>
            <select
              value={form.district}
              onChange={(e) =>
                setForm({
                  ...form,
                  district: e.target.value,
                  upazila: "",
                  union_name: "",
                })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Upazila
            </label>
            <select
              value={form.upazila}
              onChange={(e) =>
                setForm({
                  ...form,
                  upazila: e.target.value,
                  union_name: "",
                })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            >
              <option value="">Select Upazila</option>
              {upazilas.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Union
            </label>
            <select
              value={form.union_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  union_name: e.target.value,
                  bazar: "",
                })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            >
              <option value="">Select Union</option>
              {unions.map((u: any) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Bazar
            </label>
            <select
              value={form.bazar}
              onChange={(e) =>
                setForm({ ...form, bazar: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm mb-4"
            >
              <option value="">Select Bazar</option>
              {filteredBazars.map((bazar) => (
                <option key={bazar.id} value={bazar.name}>
                  {bazar.name}
                </option>
              ))}
            </select>

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Location Select From Map
            </label>
            <button
              type="button"
              onClick={() => {
                if (!showRetailerMap) {
                  setSelectedLocation(null);
                }
                setShowRetailerMap(!showRetailerMap);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded mb-3"
            >
              Open Map
            </button>

            {form.latitude && form.longitude && (
              <div className="mb-3 text-green-700 font-semibold">
                📍 Location Selected
              </div>
            )}

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Broiler Sale
            </label>
            <input
              type="number"
              placeholder="Broiler Sale"
              value={form.broiler_sale}
              onChange={(e) =>
                setForm({ ...form, broiler_sale: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            />

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Layer Sale
            </label>
            <input
              type="number"
              placeholder="Layer Sale"
              value={form.layer_sale}
              onChange={(e) =>
                setForm({ ...form, layer_sale: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            />

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Sonali Sale
            </label>
            <input
              type="number"
              placeholder="Sonali Sale"
              value={form.sonali_sale}
              onChange={(e) =>
                setForm({ ...form, sonali_sale: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            />

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Cattle Sale
            </label>
            <input
              type="number"
              placeholder="Cattle Sale"
              value={form.cattle_sale}
              onChange={(e) =>
                setForm({ ...form, cattle_sale: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            />

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Fish Sale
            </label>
            <input
              type="number"
              placeholder="Fish Sale"
              value={form.fish_sale}
              onChange={(e) =>
                setForm({ ...form, fish_sale: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            />

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Total Monthly Sale
            </label>
            <input
              type="number"
              value={form.monthly_sale}
              readOnly
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3 bg-gray-100 font-bold"
            />

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Focus Item
            </label>
            <select
              value={form.focus_item}
              onChange={(e) =>
                setForm({ ...form, focus_item: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            >
              <option value="">Select Focus Item</option>
              <option value="Broiler Feed">Broiler Feed</option>
              <option value="Layer Feed">Layer Feed</option>
              <option value="Sonali Feed">Sonali Feed</option>
              <option value="Cattle Feed">Cattle Feed</option>
              <option value="Fish Feed">Fish Feed</option>
              <option value="Goat Feed">Goat Feed</option>
              <option value="Duck Feed">Duck Feed</option>
              <option value="Others">Others</option>
            </select>

            <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                💾 Save Retailer
              </button>

              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                ✖ Close
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        type="text"
        placeholder="🔍 Search Retailer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition mb-6"
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          🔎 Filter Retailers
        </h3>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={districtFilter}
            onChange={(e) => {
              setDistrictFilter(e.target.value);
              setUpazilaFilter("");
              setUnionFilter("");
              setBazarFilter("");
            }}
            className="min-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
          >
            <option value="">All Districts</option>
            {[...new Set(retailers.map((r) => r.district))].map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

          <select
            value={upazilaFilter}
            onChange={(e) => {
              setUpazilaFilter(e.target.value);
              setUnionFilter("");
              setBazarFilter("");
            }}
            className="min-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
          >
            <option value="">All Upazilas</option>
            {filterUpazilas.map((u: any) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={unionFilter}
            onChange={(e) => {
              setUnionFilter(e.target.value);
              setBazarFilter("");
            }}
            className="min-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
          >
            <option value="">All Unions</option>
            {filterUnions.map((u: any) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={bazarFilter}
            onChange={(e) => setBazarFilter(e.target.value)}
            className="min-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
          >
            <option value="">All Bazar</option>
            {filterBazars.map((b: any) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="min-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </select>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="min-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
          >
            <option value="">All Parent Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.agent_name}
              </option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="rounded-lg bg-slate-700 hover:bg-slate-800 text-white px-5 py-2 text-sm font-medium shadow-sm transition"
          >
            🔄 Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowSummary(true)}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
          >
            📊 Summary
          </button>

          <button
            onClick={exportRetailersExcel}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all"
          >
            📥 Export
          </button>

          <button
            onClick={() => {
              setShowSummary(false);
              setShowMap(!showMap);
            }}
            className={`px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 ${
              showMap
                ? "bg-slate-700 hover:bg-slate-800 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <FaMap />
            {showMap ? "Hide Map" : "View Map"}
          </button>
        </div>
      </div>

      {showMap && (
        <div id="retailer-map-section" className="mt-4 mb-6">
          <h2 className="font-bold text-lg mb-2">Retailer Locations</h2>

          <div className="relative">
            <MapContainer
              center={mapCenter}
              zoom={8}
              style={{
                height: "500px",
                width: "100%",
              }}
            >
              <MapLayers />

              {!myLocationMode && (
                <FitBounds
                  positions={filteredRetailers
                    .filter((a) => a.latitude && a.longitude)
                    .map((a) => [Number(a.latitude), Number(a.longitude)])}
                />
              )}

              {selectedLocation && <RecenterMap position={selectedLocation} />}

              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>
                    <div
                      style={{
                        maxHeight: "250px",
                        overflowY: "auto",
                        width: "220px",
                      }}
                    >
                      <h3 className="text-base font-bold text-slate-800 mb-2">
                        📍 My Location
                      </h3>
                      <h4 className="text-base font-medium text-slate-700 mb-2">
                        Nearest Retailers
                      </h4>

                      {nearestRetailers.map((r, index) => (
                        <div key={r.id} style={{ marginBottom: "8px" }}>
                          <button
                            onClick={() => {
                              setSelectedLocation([
                                Number(r.latitude),
                                Number(r.longitude),
                              ]);
                            }}
                            style={{
                              border: "none",
                              background: "none",
                              color: "blue",
                              cursor: "pointer",
                              fontWeight: "bold",
                              padding: 0,
                            }}
                          >
                            {index + 1}. {r.retailer_name}
                          </button>
                          <br />
                          {r.distance} km
                        </div>
                      ))}
                    </div>
                  </Popup>
                </Marker>
              )}

              {filteredRetailers.map((r) => {
                if (!r.latitude || !r.longitude) {
                  return null;
                }

                return (
                  <Marker
                    key={r.id}
                    position={[Number(r.latitude), Number(r.longitude)]}
                    icon={createRetailerMarker(
                      r.companies?.logo_url || "",
                      r.retailer_name || ""
                    )}
                  >
                    <Popup maxWidth={300}>
                      <div
                        style={{
                          maxHeight: "300px",
                          overflowY: "auto",
                          width: "260px",
                        }}
                      >
                        {r.companies?.logo_url && (
                          <img
                            src={r.companies.logo_url}
                            alt="logo"
                            style={{
                              width: "60px",
                              marginBottom: "10px",
                            }}
                          />
                        )}

                        <h3
                          style={{
                            fontWeight: "bold",
                            fontSize: "18px",
                            marginBottom: "10px",
                          }}
                        >
                          {r.retailer_name}
                        </h3>

                        <hr />

                        <p>
                          <b>Company:</b> {r.companies?.company_name}
                        </p>
                        <p>
                          <b>Parent Agent:</b> {r.agents?.agent_name || "-"}
                        </p>
                        <p>
                          <b>Retailer Name:</b> {r.retailer_name}
                        </p>
                        <p>
                          <b>Proprietor:</b> {r.proprietor}
                        </p>
                        <p>
                          <b>Mobile:</b> {r.mobile}
                        </p>
                        <p>
                          <b>Bazar:</b> {r.bazar}
                        </p>
                        <p>
                          <b>Union:</b> {r.union_name}
                        </p>
                        <p>
                          <b>Upazila:</b> {r.upazila}
                        </p>
                        <p>
                          <b>District:</b> {r.district}
                        </p>
                        <p>
                          <b>Monthly Sale:</b> {r.monthly_sale}
                        </p>
                        <p>
                          <b>Focus Item:</b> {r.focus_item}
                        </p>
                        <p>
                          <b>Status:</b> {r.status}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {showMap && (
              <button
                onClick={getMyLocation}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full shadow-xl px-5 py-2.5 font-semibold hover:from-blue-700 hover:to-sky-600 transition-all duration-300"
              >
                <FaMapMarkerAlt />
                My Location
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-max border text-xs">
          <thead>
            <tr>
              <th className="border px-2 py-0.5 text-xs whitespace-nowrap">
                Company
              </th>
              <th className="border px-2 py-0.5 text-xs whitespace-nowrap">
                Parent Agent
              </th>
              <th className="border px-2 py-0.5 text-xs whitespace-nowrap">
                Retailer Name
              </th>
              <th className="border px-2 py-0.5 text-xs whitespace-nowrap">
                Mobile
              </th>
              <th className="border px-2 py-0.5 text-xs whitespace-nowrap">
                Bazar
              </th>
              <th className="border px-2 py-0.5 text-xs whitespace-nowrap">
                Union
              </th>
              <th className="border px-2 py-0.5 text-xs whitespace-nowrap">
                Upazila
              </th>
              <th className="border px-2 py-0.5 text-xs whitespace-nowrap">
                Monthly Sale
              </th>
              <th className="border px-2 py-0.5 text-xs whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedRetailers.map((r) => (
              <tr key={r.id}>
                <td className="border px-2 py-0.5 text-xs">
                  {r.companies?.company_name}
                </td>
                <td className="border px-2 py-0.5 text-xs">
                  {r.agents?.agent_name || "-"}
                </td>
                <td className="border px-2 py-0.5 text-xs font-semibold">
                  {r.retailer_name}
                </td>
                <td className="border px-2 py-0.5 text-xs">{r.mobile}</td>
                <td className="border px-2 py-0.5 text-xs">{r.bazar}</td>
                <td className="border px-2 py-0.5 text-xs">{r.union_name}</td>
                <td className="border px-2 py-0.5 text-xs">{r.upazila}</td>
                <td className="border px-2 py-0.5 text-xs">{r.monthly_sale}</td>

                <td className="border px-2 py-0.5 text-xs">
                  <button
                    onClick={() => {
                      setSelectedRetailer(r);
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
                  >
                    View
                  </button>

                  <button
                    onClick={() => {
                      setShowForm(true);
                      setEditingId(r.id);
                      setForm({
                        agent_id: String(r.agent_id || ""),
                        company_id: String(r.company_id || ""),
                        retailer_name: r.retailer_name || "",
                        proprietor: r.proprietor || "",
                        mobile: r.mobile || "",
                        bazar: r.bazar || "",
                        union_name: r.union_name || "",
                        upazila: r.upazila || "",
                        district: r.district || "",
                        broiler_sale: String(r.broiler_sale || 0),
                        layer_sale: String(r.layer_sale || 0),
                        sonali_sale: String(r.sonali_sale || 0),
                        cattle_sale: String(r.cattle_sale || 0),
                        fish_sale: String(r.fish_sale || 0),
                        monthly_sale: String(r.monthly_sale || 0),
                        focus_item: r.focus_item || "",
                        latitude: String(r.latitude || ""),
                        longitude: String(r.longitude || ""),
                        status: r.status || "Active",
                      });

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      if (!r.latitude || !r.longitude) {
                        alert("Location not available");
                        return;
                      }
                      setSelectedRetailer(null);
                      setShowMap(true);

                      setSelectedLocation([
                        Number(r.latitude),
                        Number(r.longitude),
                      ]);

                      setTimeout(() => {
                        document
                          .getElementById("retailer-map-section")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      }, 100);
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                  >
                    View Map
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRetailer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded w-[700px] max-h-[90vh] overflow-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Retailer Details</h2>
              <button onClick={() => setSelectedRetailer(null)}>✖</button>
            </div>

            <div className="space-y-2">
              <p>
                <b>Company:</b> {selectedRetailer?.companies?.company_name}
              </p>
              <p>
                <b>Parent Agent:</b> {selectedRetailer?.agents?.agent_name || "-"}
              </p>
              <p>
                <b>Retailer Name:</b> {selectedRetailer.retailer_name}
              </p>
              <p>
                <b>Proprietor:</b> {selectedRetailer.proprietor}
              </p>
              <p>
                <b>Mobile:</b> {selectedRetailer.mobile}
              </p>
              <p>
                <b>Bazar:</b> {selectedRetailer.bazar}
              </p>
              <p>
                <b>Union:</b> {selectedRetailer.union_name}
              </p>
              <p>
                <b>Upazila:</b> {selectedRetailer.upazila}
              </p>
              <p>
                <b>District:</b> {selectedRetailer.district}
              </p>
              <p>
                <b>Broiler Sale:</b> {selectedRetailer.broiler_sale}
              </p>
              <p>
                <b>Layer Sale:</b> {selectedRetailer.layer_sale}
              </p>
              <p>
                <b>Sonali Sale:</b> {selectedRetailer.sonali_sale}
              </p>
              <p>
                <b>Cattle Sale:</b> {selectedRetailer.cattle_sale}
              </p>
              <p>
                <b>Fish Sale:</b> {selectedRetailer.fish_sale}
              </p>
              <p>
                <b>Monthly Sale:</b> {selectedRetailer.monthly_sale}
              </p>
              <p>
                <b>Focus Item:</b> {selectedRetailer.focus_item}
              </p>
              <p>
                <b>Latitude:</b> {selectedRetailer.latitude}
              </p>
              <p>
                <b>Longitude:</b> {selectedRetailer.longitude}
              </p>
              <p>
                <b>Status:</b> {selectedRetailer.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded w-[700px] max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Retailer Summary of {selectedCompanyName}
                {unionFilter && ` in ${unionFilter}`}
                {upazilaFilter && `, ${upazilaFilter}`}
                {districtFilter && `, ${districtFilter}`}
              </h2>

              <button
                onClick={() => setShowSummary(false)}
                className="text-red-600 font-bold"
              >
                ✖
              </button>
            </div>

            <div className="mb-4 font-semibold">
              Total Retailers: {filteredRetailers.length}
              {" | "}
              Total Sale: {totalMonthlySale}
            </div>

            <table className="w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-0.5 text-xs">Company</th>
                  <th className="border px-2 py-0.5 text-xs">Retailers</th>
                  <th className="border px-2 py-0.5 text-xs">Sale</th>
                </tr>
              </thead>

              <tbody>
                {companySummary.map((c: any) => (
                  <tr key={c.name}>
                    <td className="border px-2 py-0.5 text-xs">{c.name}</td>
                    <td className="border px-2 py-0.5 text-xs">{c.agents}</td>
                    <td className="border px-2 py-0.5 text-xs">{c.sale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showRetailerMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
          <div className="bg-white p-4 rounded w-[900px]">
            <div className="flex justify-between mb-3">
              <h2 className="font-bold text-xl">Select Retailer Location</h2>
              <button onClick={() => setShowRetailerMap(false)}>✖</button>
            </div>

            <LocationPicker
              center={
                selectedUpazila
                  ? [Number(selectedUpazila.lat), Number(selectedUpazila.lon)]
                  : selectedDistrict
                  ? [Number(selectedDistrict.lat), Number(selectedDistrict.lon)]
                  : [23.685, 90.3563]
              }
              zoom={selectedUpazila ? 13 : selectedDistrict ? 11 : 7}
              selectedPosition={
                form.latitude && form.longitude
                  ? [Number(form.latitude), Number(form.longitude)]
                  : null
              }
              onSelect={(lat, lng) => {
                setForm({
                  ...form,
                  latitude: lat.toString(),
                  longitude: lng.toString(),
                });
                setShowRetailerMap(false);
              }}
              markers={
                <>
                  {retailers
                    .filter((a) => a.latitude && a.longitude)
                    .map((r) => (
                      <Marker
                        key={r.id}
                        position={[Number(r.latitude), Number(r.longitude)]}
                        icon={createRetailerMarker(
                          r.companies?.logo_url,
                          r.retailer_name
                        )}
                      />
                    ))}
                </>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}