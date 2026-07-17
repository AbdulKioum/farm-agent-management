import LocationPicker from "../../components/maps/LocationPicker";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent,
} from "../../services/agentService";
import { useAuth } from "../../context/AuthContext";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMap } from "react-leaflet";
import {
  FaMapMarkerAlt,
  FaMap,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getBazars } from "../../services/bazarService";


function createAgentMarker(
  logoUrl: string,
  agentName: string
) {
  return L.divIcon({
    html: `
      <div
        style="
          display:flex;
          flex-direction:column;
          align-items:center;
        "
      >

        <div
          style="
            font-size:9px;
            font-weight:bold;
            color:black;
            background:white;
            padding:1px 4px;
            margin-bottom:-3px;
            line-height:1;
            white-space:nowrap;
            box-shadow:0 0 3px rgba(0,0,0,.3);
          "
        >
          ${agentName}
        </div>

        <img
          src="${logoUrl}"
          style="
            width:45px;
            margin-top:0px;
            object-fit:contain;
          "
        />
      </div>
    `,
    className: "",
    iconSize: [80, 75],
  });
}

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


export default function AgentsPage() {
  const { role } = useAuth();

  const [showForm, setShowForm] =
  useState(false);
  const [showMap, setShowMap] =
  useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] =
    useState<any>(null);
    const [editingId, setEditingId] =
  useState<number | null>(null);

  const [form, setForm] = useState({
    company_id: "",
    agent_name: "",
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
  const [companyFilter, setCompanyFilter] =
  useState("");
  const [districtFilter, setDistrictFilter] =
  useState("");
  const [upazilaFilter, setUpazilaFilter] =
  useState("");

const [unionFilter, setUnionFilter] =
  useState("");
  const [bazarFilter,
  setBazarFilter] =
  useState("");
  const [showAgentMap, setShowAgentMap] =
  useState(false);
  const [userLocation, setUserLocation] =
  useState<
    [number, number] | null
  >(null);
  const [nearestAgents, setNearestAgents] =
  useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] =
  useState<
    [number, number] | null
  >(null);
  const [mapCenter, setMapCenter] =
  useState<[number, number]>([
    24.75, 90.40,
  ]);
  const [districts, setDistricts] =
  useState<any[]>([]);

const [upazilas, setUpazilas] =
  useState<any[]>([]);

const [unions, setUnions] =
  useState<any[]>([]);

  const [bazars, setBazars] =
  useState<any[]>([]);

  const [showSummary, setShowSummary] =
  useState(false);

  const [myLocationMode, setMyLocationMode] =
  useState(false);



useEffect(() => {

  if (
    filteredAgents.length > 0 &&
    filteredAgents[0].latitude &&
    filteredAgents[0].longitude
  ) {

    const newPosition: [
      number,
      number
    ] = [
      Number(
        filteredAgents[0]
          .latitude
      ),
      Number(
        filteredAgents[0]
          .longitude
      ),
    ];

    setMapCenter(
      newPosition
    );

  }

}, [
  districtFilter,
  upazilaFilter,
  unionFilter,
  companyFilter,
]);

  function clearFilters() {
  setCompanyFilter("");
  setDistrictFilter("");
  setUpazilaFilter("");
  setUnionFilter("");
  setSearch("");
}

function getMyLocation() {

  if (
    !navigator.geolocation
  ) {
    alert(
      "Geolocation not supported"
    );
    return;
  }

  
  navigator.geolocation.getCurrentPosition(
    (position) => {

      setUserLocation([
  position.coords.latitude,
  position.coords.longitude,
]);

setSelectedLocation([
  position.coords.latitude,
  position.coords.longitude,
]);

setTimeout(() => {
  setSelectedLocation(null);
}, 1000);

setMyLocationMode(true);

setSelectedLocation([
  position.coords.latitude,
  position.coords.longitude,
]);

      const nearest =
  filteredAgents
    .filter(
      (a) =>
        a.latitude &&
        a.longitude
    )
    .map((a) => ({
      ...a,

      distance:
        getDistanceKm(
          position.coords
            .latitude,
          position.coords
            .longitude,

          Number(
            a.latitude
          ),

          Number(
            a.longitude
          )
        ),
    }))
    .sort(
      (a, b) =>
        a.distance -
        b.distance
    )
    .slice(0, 10);

setNearestAgents(
  nearest
);

    },
    () => {
      alert(
        "Location access denied"
      );
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

  const dLat =
    ((lat2 - lat1) *
      Math.PI) /
    180;

  const dLon =
    ((lon2 - lon1) *
      Math.PI) /
    180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return (
    Math.round(R * c * 100) /
    100
  );
}




  async function loadData() {
    const agentData = await getAgents();
    setAgents(agentData || []);

    
    const bazarData =
  await getBazars();


setBazars(bazarData);

    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("company_name");

    setCompanies(data || []);

    const { data: districtData } =
  await supabase
    .from("districts")
    .select("*")
    .order("name");

setDistricts(
  districtData || []
);

const { data: unionData } =
  await supabase
    .from("unions")
    .select("*")
    .order("name");

setUnions(
  unionData || []
);
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
    monthly_sale:
      total.toString(),
  }));

}, [
  form.broiler_sale,
  form.layer_sale,
  form.sonali_sale,
  form.cattle_sale,
  form.fish_sale,
]);

  useEffect(() => {

  if (
    districts.length > 0 &&
    form.district === ""
  ) {

    const mymensingh =
      districts.find(
        (d) =>
          d.name ===
          "Mymensingh"
      );

    if (mymensingh) {

      setForm((prev) => ({
        ...prev,
        district:
          mymensingh.name,
      }));

    }
  }

}, [districts]);

  useEffect(() => {

  if (
    districts.length > 0 &&
    !form.district
  ) {

    setForm((prev) => ({
      ...prev,
      district: "Mymensingh",
    }));

  }

}, [districts]);

  useEffect(() => {

  if (!form.district) {
    setUpazilas([]);
    return;
  }

  async function loadUpazilas() {

    const district =
      districts.find(
        (d) =>
          d.name ===
          form.district
      );

    if (!district) return;

    const { data } =
      await supabase
        .from("upazilas")
        .select("*")
        .eq(
          "district_id",
          district.id
        )
        .order("name");

    setUpazilas(
      data || []
    );
  }

  loadUpazilas();

}, [
  form.district,
  districts,
]);

useEffect(() => {

  if (!form.upazila) {
    setUnions([]);
    return;
  }

  async function loadUnions() {

    const upazila =
      upazilas.find(
        (u) =>
          u.name ===
          form.upazila
      );

    if (!upazila) return;

    const { data } =
      await supabase
        .from("unions")
        .select("*")
        .eq(
          "upazila_id",
          upazila.id
        )
        .order("name");

    setUnions(
      data || []
    );
  }

  loadUnions();

}, [
  form.upazila,
  upazilas,
]);


  useEffect(() => {
    loadData();
  }, []);

  async function handleSave() {
  try {
    if (
      !form.company_id ||
      !form.agent_name
    ) {
      alert(
        "Company and Agent Name Required"
      );
      return;
    }

    const payload = {
      ...form,

      company_id: Number(
        form.company_id
      ),

      broiler_sale:
        Number(
          form.broiler_sale || 0
        ),

      layer_sale:
        Number(
          form.layer_sale || 0
        ),

      sonali_sale:
        Number(
          form.sonali_sale || 0
        ),

      cattle_sale:
        Number(
          form.cattle_sale || 0
        ),

      fish_sale:
        Number(
          form.fish_sale || 0
        ),

      monthly_sale:
        form.monthly_sale === ""
          ? 0
          : Number(
              form.monthly_sale
            ),

      latitude:
        form.latitude === ""
          ? null
          : Number(
              form.latitude
            ),

      longitude:
        form.longitude === ""
          ? null
          : Number(
              form.longitude
            ),
    };

    if (editingId) {
      await updateAgent(
        editingId,
        payload
      );

      alert(
        "Agent Updated"
      );
    } else {
      await createAgent(
        payload
      );

      alert("Agent Saved");
    }
    setShowForm(false);
    setEditingId(null);

    setForm({
      company_id: "",
    agent_name: "",
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

    loadData();
  } catch (error: any) {
    alert(
      error?.message ||
        "Save Failed"
    );
  }
}

  async function handleDelete(
    id: number
  ) {
    const ok =
      confirm("Delete Agent?");

    if (!ok) return;

    await deleteAgent(id);
    loadData();
  }

  const filteredAgents =
  agents.filter((agent) => {

    const matchSearch =
      agent.agent_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );

         

      
    const matchCompany =
      companyFilter === ""
        ? true
        : String(
            agent.company_id
          ) === companyFilter;

    const matchDistrict =
      districtFilter === ""
        ? true
        : agent.district ===
          districtFilter;

    const matchUpazila =
      upazilaFilter === ""
        ? true
        : agent.upazila ===
          upazilaFilter;

    const matchUnion =
      unionFilter === ""
        ? true
        : agent.union_name ===
          unionFilter;

          const matchBazar =
  bazarFilter === ""
    ? true
    : agent.bazar ===
      bazarFilter;

          

    return (
      matchSearch &&
      matchCompany &&
      matchDistrict &&
      matchUpazila &&
      matchUnion &&
      matchBazar
    );
  });

  const selectedDistrict =
  districts.find(
    (d) =>
      d.name ===
      form.district
  );

  const selectedUnion =
  unions.find(
    (u: any) =>
      u.name ===
      form.union_name
  );



const filteredBazars =
  bazars.filter(
    (b: any) =>
      b.union_id ===
      selectedUnion?.id
  );

  const selectedCompanyName =
  companies.find(
    (c) =>
      String(c.id) ===
      companyFilter
  )?.company_name ||
  "All Companies";

  const totalMonthlySale =
  filteredAgents.reduce(
    (sum, agent) =>
      sum +
      Number(
        agent.monthly_sale || 0
      ),
    0
  );

  const companySummary =
  Object.values(
    filteredAgents.reduce(
      (acc: any, agent) => {

        const company =
          agent.companies
            ?.company_name ||
          "Unknown";

        if (!acc[company]) {
          acc[company] = {
            name: company,
            agents: 0,
            sale: 0,
          };
        }

        acc[company].agents += 1;

        acc[company].sale +=
          Number(
            agent.monthly_sale || 0
          );

        return acc;

      },
      {}
    )
  );





 const selectedFilterUnion =
  unions.find(
    (u: any) =>
      u.name ===
      unionFilter
  );

const filteredBazarList =
  bazars.filter(
    (b: any) =>
      unionFilter === ""
        ? true
        : Number(
            b.union_id
          ) ===
          Number(
            selectedFilterUnion?.id
          )
  );

  
  const sortedAgents =
  [...filteredAgents].sort(
    (a: any, b: any) => {

      const companyCompare =
        (
          a.companies
            ?.company_name || ""
        ).localeCompare(
          b.companies
            ?.company_name || ""
        );

      if (companyCompare !== 0) {
        return companyCompare;
      }

      return (
        a.agent_name || ""
      ).localeCompare(
        b.agent_name || ""
      );
    }
  );

  function exportAgentsExcel() {

  const exportData =
    sortedAgents.map(
      (agent: any) => ({
        Company:
          agent.companies
            ?.company_name || "",

        Agent_Name:
          agent.agent_name,

        Proprietor:
          agent.proprietor,

        Mobile:
          agent.mobile,

        Bazar:
          agent.bazar,

        District:
          agent.district,

        Upazila:
          agent.upazila,

        Union:
          agent.union_name,

        Broiler_Sale:
          agent.broiler_sale || 0,

        Layer_Sale:
          agent.layer_sale || 0,

        Sonali_Sale:
          agent.sonali_sale || 0,

        Cattle_Sale:
          agent.cattle_sale || 0,

        Fish_Sale:
          agent.fish_sale || 0,

        Total_Monthly_Sale:
          agent.monthly_sale || 0,

        Focus_Item:
          agent.focus_item,

        Status:
          agent.status,
      })
    );

  const worksheet =
    XLSX.utils.json_to_sheet(
      exportData
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Agents"
  );

  const excelBuffer =
    XLSX.write(
      workbook,
      {
        bookType: "xlsx",
        type: "array",
      }
    );

  const file =
    new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

  const today =
  new Date()
    .toISOString()
    .split("T")[0];

const selectedCompany =
  companies.find(
    (c) =>
      String(c.id) ===
      companyFilter
  )?.company_name;

const fileName =
  `Agents_${
    selectedCompany ||
    "All"
  }_${
    districtFilter ||
    "AllDistricts"
  }_${
    upazilaFilter ||
    "AllUpazilas"
  }_${
    unionFilter ||
    "AllUnions"
  }_${
    today
  }.xlsx`;

saveAs(
  file,
  fileName
);
}

useEffect(() => {
  setMyLocationMode(false);
}, [
  companyFilter,
  districtFilter,
  upazilaFilter,
  unionFilter,
]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Agent Management
      </h1>
      <div className="mb-4">
  <button
  onClick={() => {
    setEditingId(null);

    setForm({
      company_id: "",
    agent_name: "",
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

    setShowForm(true);
  }}
    className="bg-blue-600 text-white px-4 py-2 rounded"
  >
    {showForm
      ? "Close Form"
      : "+ Add Agent"}
  </button>

</div>

{showForm && (

  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">

    <div className="bg-white p-6 rounded-lg w-[700px] max-h-[90vh] overflow-auto">

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-xl font-bold">
          {editingId
            ? "Edit Agent"
            : "Add Agent"}
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

      {/* FORM START */}

          
        <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Company </label>
        <select
          value={form.company_id}
          onChange={(e) =>
            setForm({
              ...form,
              company_id:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        >
          <option value="">
            Select Company
          </option>

          {companies.map(
            (company) => (
              <option
                key={company.id}
                value={company.id}
              >
                {
                  company.company_name
                }
              </option>
            )
          )}
        </select>

          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Agent Name </label>
        <input
          placeholder="Agent Name"
          value={form.agent_name}
          onChange={(e) =>
            setForm({
              ...form,
              agent_name:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"        />

          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Proprietor </label>
        <input
          placeholder="Proprietor"
          value={form.proprietor}
          onChange={(e) =>
            setForm({
              ...form,
              proprietor:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        />

          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Mobile </label>
        <input
          placeholder="Mobile"
          value={form.mobile}
          onChange={(e) =>
            setForm({
              ...form,
              mobile:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        />

        <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
          District </label>
      <select
    value={form.district}
    onChange={(e) =>
      setForm({
        ...form,
        district:
          e.target.value,
        upazila: "",
        union_name: "",
      })
    }
    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
  >
  <option value="">
    Select District
  </option>

  {districts.map(
    (d) => (
      <option
        key={d.id}
        value={d.name}
      >
        {d.name}
      </option>
    )
  )}
</select>

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
          Upazila </label>
<select
  value={form.upazila}
  onChange={(e) =>
    setForm({
      ...form,
      upazila:
        e.target.value,
      union_name: "",
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
>
  <option value="">
    Select Upazila
  </option>

  {upazilas.map(
    (u) => (
      <option
        key={u.id}
        value={u.name}
      >
        {u.name}
      </option>
    )
  )}
</select>

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
          Union </label>
<select
  value={form.union_name}
  onChange={(e) =>
    setForm({
      ...form,
      union_name:
        e.target.value,

      bazar: "",
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
>
  <option value="">
    Select Union
  </option>

  {unions.map(
  (u: any) => (
    <option
      key={u.id}
      value={u.name}
    >
      {u.name}
    </option>
  )
)}
</select>

        <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
  Bazar
</label>

<select
  value={form.bazar}
  onChange={(e) =>
    setForm({
      ...form,
      bazar: e.target.value,
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm mb-4"
>

  <option value="">
    Select Bazar
  </option>

  {filteredBazars.map(
    (bazar) => (
      <option
        key={bazar.id}
        value={bazar.name}
      >
        {bazar.name}
      </option>
    )
  )}

</select>

        
<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
          Location Select From Map </label>
        <button
  type="button"
  onClick={() => {

    if (!showAgentMap) {
      setSelectedLocation(
        null
      );
    }

    setShowAgentMap(
      !showAgentMap
    );

  }}
  className="bg-blue-600 text-white px-4 py-2 rounded mb-3"
>
  Open Map
</button>

{form.latitude &&
  form.longitude && (
    <div className="mb-3 text-green-700 font-semibold">
      📍 Location Selected
    </div>
)}

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
          Broiler Sale </label>
        <input
  type="number"
  placeholder="Broiler Sale"
  value={form.broiler_sale}
  onChange={(e) =>
    setForm({
      ...form,
      broiler_sale:
        e.target.value,
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
/>

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
          Layer Sale </label>
        <input
  type="number"
  placeholder="Layer Sale"
  value={form.layer_sale}
  onChange={(e) =>
    setForm({
      ...form,
      layer_sale:
        e.target.value,
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
/>

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
          Sonali Sale </label>
        <input
  type="number"
  placeholder="Sonali Sale"
  value={form.sonali_sale}
  onChange={(e) =>
    setForm({
      ...form,
      sonali_sale:
        e.target.value,
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
/>

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
          Cattle Sale </label>
        <input
  type="number"
  placeholder="Cattle Sale"
  value={form.cattle_sale}
  onChange={(e) =>
    setForm({
      ...form,
      cattle_sale:
        e.target.value,
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
/>

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
          Fish Sale </label>
        <input
  type="number"
  placeholder="Fish Sale"
  value={form.fish_sale}
  onChange={(e) =>
    setForm({
      ...form,
      fish_sale:
        e.target.value,
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
/>

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
          Total Monthly Sale </label>
<input
  type="number"
  value={form.monthly_sale}
  readOnly
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3 bg-gray-100 font-bold"
/>

        <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
          Focus Item </label>
        <select
          value={form.focus_item}
          onChange={(e) =>
            setForm({
              ...form,
              focus_item:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        >
          <option value="">
            Select Focus Item
          </option>
          <option value="Broiler Feed">
            Broiler Feed
          </option>
          <option value="Layer Feed">
            Layer Feed
          </option>
          <option value="Sonali Feed">
            Sonali Feed
          </option>
          <option value="Cattle Feed">
            Cattle Feed
          </option>
          <option value="Fish Feed">
            Fish Feed
          </option>
          <option value="Goat Feed">
            Goat Feed
          </option>
          <option value="Duck Feed">
            Duck Feed
          </option>
          <option value="Others">
            Others
          </option>
        </select>

        <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
          Status </label>
        <select
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        >
          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </select>
<div className="flex justify-between items-center mt-4">

  <button
    onClick={handleSave}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
  >
    💾 Save Agent
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
              {/* FORM END */}

    </div>

  </div>

)}


      <input
        type="text"
        placeholder="Search Agent..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
      />

<div className="flex flex-wrap gap-2 items-center mb-4">

<select
  value={companyFilter}
  onChange={(e) =>
    setCompanyFilter(
      e.target.value
    )
  }
  className="border p-2 rounded">
  <option value="">
    All Companies
  </option>

  {companies.map((c) => (
    <option
      key={c.id}
      value={c.id}
    >
      {c.company_name}
    </option>
  ))}
</select>

<select
  value={districtFilter}
  onChange={(e) =>
    setDistrictFilter(
      e.target.value
    )
  }
  className="border p-2 rounded ml-2"
>
  <option value="">
    All Districts
  </option>

  {[
    ...new Set(
      agents.map(
        (a) => a.district
      )
    ),
  ].map((district) => (
    <option
      key={district}
      value={district}
    >
      {district}
    </option>
  ))}
</select>

<select
  value={upazilaFilter}
  onChange={(e) =>
    setUpazilaFilter(
      e.target.value
    )
  }
  className="border p-2 rounded ml-2"
>
  <option value="">
    All Upazilas
  </option>

  {[
    ...new Set(
      agents.map(
        (a) => a.upazila
      )
    ),
  ].map((upazila) => (
    <option
      key={upazila}
      value={upazila}
    >
      {upazila}
    </option>
  ))}
</select>

<select
  value={unionFilter}
  onChange={(e) => {

    setUnionFilter(
      e.target.value
    );

    setBazarFilter("");

  }}
  className="border p-2 rounded ml-2"
>
  <option value="">
    All Unions
  </option>

  {[
    ...new Set(
      agents.map(
        (a) => a.union_name
      )
    ),
  ].map((union) => (
    <option
      key={union}
      value={union}
    >
      {union}
    </option>
  ))}
</select>

<select
  value={bazarFilter}
  onChange={(e) =>
    setBazarFilter(
      e.target.value
    )
  }
  className="border p-2 rounded"
>

  <option value="">
    All Bazar
  </option>

  {filteredBazarList.map(
    (b: any) => (
      <option
        key={b.id}
        value={b.name}
      >
        {b.name}
      </option>
    )
  )}

</select>

<button
  onClick={clearFilters}
  className="bg-gray-600 text-white px-4 py-2 rounded"
>
  Clear Filters
</button>

</div>

<div className="flex items-center gap-3 mb-4">



<button
  onClick={
    exportAgentsExcel
  }
  className="bg-green-600 text-white px-4 py-2 rounded"
>
  Export Excel
</button>


   <button
  onClick={() =>
    setShowSummary(true)
  }
  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
>
  Summary
</button>

  <button
    onClick={() =>
      setShowMap(!showMap)
    }
    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded flex items-center gap-2"
  >
    <FaMap />
    {showMap
      ? "Hide Map"
      : "Show On Map"}
  </button>

  <button
    onClick={getMyLocation}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
  >
    <FaMapMarkerAlt />
    My Location
  </button>



</div>

{showMap && (

   <div
    id="agent-map-section"
    className="mt-4 mb-6"
  >

    <h2 className="font-bold text-lg mb-2">
      Agent Locations
    </h2>



    <MapContainer
  center={mapCenter}
  zoom={8}
  style={{
    height: "500px",
    width: "100%",
  }}
>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {!myLocationMode && (
  <FitBounds
    positions={filteredAgents
      .filter(
        (a) =>
          a.latitude &&
          a.longitude
      )
      .map((a) => [
        Number(a.latitude),
        Number(a.longitude),
      ])}
  />
)}

      {selectedLocation && (
  <RecenterMap
    position={selectedLocation}
  />
)}

      {userLocation && (

  <Marker
    position={userLocation}
  >

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
  Nearest Agents
</h4>

    {nearestAgents.map(
      (a, index) => (

        <div
          key={a.id}
          style={{
            marginBottom:
              "8px",
          }}
        >

          <button
          onClick={() => {

  setSelectedLocation([
  Number(a.latitude),
  Number(a.longitude),
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
          {index + 1}.
          {a.agent_name}
        </button>

          <br />

          {
            a.distance
          } km

        </div>

      )
    )}

  </div>

</Popup>

  </Marker>

)}


      {filteredAgents.map(
        (agent) => {

          if (
            !agent.latitude ||
            !agent.longitude
          ) {
            return null;
          }

          return (
            <Marker
              key={agent.id}
              
            position={[
              Number(agent.latitude),
              Number(agent.longitude),
            ]}

           icon={createAgentMarker(
          agent.companies?.logo_url ||
            "",
          agent.agent_name || ""
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
                {agent.companies?.logo_url && (
                  <img
                    src={agent.companies.logo_url}
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
                  {agent.agent_name}
                </h3>

                <hr />

                <p>
                  <b>Company:</b>{" "}
                  {agent.companies?.company_name}
                </p>

                <p>
                  <b>Agent Name:</b>{" "}
                  {agent.agent_name}
                </p>

                <p>
                  <b>Proprietor:</b>{" "}
                  {agent.proprietor}
                </p>

                <p>
                  <b>Mobile:</b>{" "}
                  {agent.mobile}
                </p>

                <p><b>Bazar:</b> {agent.bazar}</p>

                <p>
                  <b>Union:</b>{" "}
                  {agent.union_name}
                </p>

                <p>
                  <b>Upazila:</b>{" "}
                  {agent.upazila}
                </p>

                <p>
                  <b>District:</b>{" "}
                  {agent.district}
                </p>

                <p>
                  <b>Monthly Sale:</b>{" "}
                  {agent.monthly_sale}
                </p>

                <p>
                  <b>Focus Item:</b>{" "}
                  {agent.focus_item}
                </p>

                <p>
                  <b>Latitude:</b>{" "}
                  {agent.latitude}
                </p>

                <p>
                  <b>Longitude:</b>{" "}
                  {agent.longitude}
                </p>

                <p>
                  <b>Status:</b>{" "}
                  {agent.status}
                </p>
              </div>
            </Popup>

            </Marker>
          );
        }
      )}

    </MapContainer>

  </div>
)}


      <div className="overflow-x-auto">
       <table className="w-max border">
        <thead>
          <tr>
            <th className="border p-2 whitespace-nowrap">
              Company
            </th>

            <th className="border p-2 whitespace-nowrap">
              Agent
            </th>

            <th className="border p-2 whitespace-nowrap">
              Mobile
            </th>

          <th className="border p-2 whitespace-nowrap">
              Bazar
            </th>

          <th className="border p-2 whitespace-nowrap">
              Union
            </th>

            <th className="border p-2 whitespace-nowrap">
              Upazila
            </th>

            <th className="border p-2 whitespace-nowrap">
              Monthly Sale
            </th>

            <th className="border p-2 whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>

  
          
          {sortedAgents.map((agent) => (
              <tr key={agent.id}>
                <td className="border p-2">
                  {
                    agent
                      .companies
                      ?.company_name
                  }
                </td>

                <td className="border p-2">
                  {
                    agent.agent_name
                  }
                </td>

                <td className="border p-2">
                  {agent.mobile}
                </td>

                  <td className="border p-2">
                  {agent.bazar}
                </td>

                <td className="border p-2">
                  {agent.union_name}
                </td>

                <td className="border p-2">
                  {agent.upazila}
                </td>
                  
                  <td className="border p-2">
                  {agent.monthly_sale}
                </td>


                <td className="border p-2">

                    <button
                    onClick={() => {

                    setSelectedAgent(agent);

                  }}
                 className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
                  >
                    View
                  </button>

                  <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingId(agent.id);
                    

                    setForm({
                      company_id:
                        String(
                          agent.company_id
                        ),

                      agent_name:
                        agent.agent_name ||
                        "",

                      proprietor:
                        agent.proprietor ||
                        "",

                      mobile:
                        agent.mobile ||
                        "",

                      bazar: agent.bazar || "",

                      union_name:
                        agent.union_name ||
                        "",

                      upazila:
                        agent.upazila ||
                        "",

                      district:
                        agent.district ||
                        "",

                        broiler_sale: String(
                          agent.broiler_sale || 0
                        ),

                        layer_sale: String(
                          agent.layer_sale || 0
                        ),

                        sonali_sale: String(
                          agent.sonali_sale || 0
                        ),

                        cattle_sale: String(
                          agent.cattle_sale || 0
                        ),

                        fish_sale: String(
                          agent.fish_sale || 0
                        ),

                      monthly_sale:
                        String(
                          agent.monthly_sale ||
                            0
                        ),

                      focus_item:
                        agent.focus_item ||
                        "",

                      latitude:
                        String(
                          agent.latitude ||
                            ""
                        ),

                      longitude:
                        String(
                          agent.longitude ||
                            ""
                        ),

                      status:
                        agent.status ||
                        "Active",
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

                    if (
                      !agent.latitude ||
                      !agent.longitude
                    ) {
                      alert(
                        "Location not available"
                      );
                      return;
                    }
                    setSelectedAgent(null);
                    setShowMap(true);

                    setSelectedLocation([
                      Number(agent.latitude),
                      Number(agent.longitude),
                    ]);

                    setTimeout(() => {
                      document
                        .getElementById(
                          "agent-map-section"
                        )
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
                    onClick={() =>
                      handleDelete(
                        agent.id
                      )
                    }
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

      {selectedAgent && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">

          <div className="bg-white p-6 rounded w-[700px] max-h-[90vh] overflow-auto">

            <div className="flex justify-between mb-4">

              <h2 className="text-xl font-bold">
                Agent Details
              </h2>

              <button
                onClick={() =>
                  setSelectedAgent(
                    null
                  )
                }
              >
                ✖
              </button>

            </div>

            <div className="space-y-2">

              <p><b>Company:</b> {selectedAgent?.companies?.company_name}</p>
              <p><b>Agent Name:</b> {selectedAgent.agent_name}</p>
              <p><b>Proprietor:</b> {selectedAgent.proprietor}</p>
              <p><b>Mobile:</b> {selectedAgent.mobile}</p>
              <p><b>Bazar:</b> {selectedAgent.bazar}</p>
              <p><b>Union:</b> {selectedAgent.union_name}</p>
              <p><b>Upazila:</b> {selectedAgent.upazila}</p>
              <p><b>District:</b> {selectedAgent.district}</p>
              <p><b>Broiler Sale:</b> {selectedAgent.broiler_sale}</p>
              <p><b>Layer Sale:</b> {selectedAgent.layer_sale}</p>
              <p><b>Sonali Sale:</b> {selectedAgent.sonali_sale}</p>
              <p><b>Cattle Sale:</b> {selectedAgent.cattle_sale}</p>
              <p><b>Fish Sale:</b> {selectedAgent.fish_sale}</p>
              <p><b>Monthly Sale:</b> {selectedAgent.monthly_sale}</p>
              <p><b>Focus Item:</b> {selectedAgent.focus_item}</p>
              <p><b>Latitude:</b> {selectedAgent.latitude}</p>
              <p><b>Longitude:</b> {selectedAgent.longitude}</p>
              <p><b>Status:</b> {selectedAgent.status}</p>

            </div>

          </div>

        </div>
      )}

      {showSummary && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">

    <div className="bg-white p-6 rounded w-[700px] max-h-[80vh] overflow-auto">

      <div className="flex justify-between items-center mb-4">

       <h2 className="text-xl font-bold">

      Agent Summary of
      {" "}
      {selectedCompanyName}

      {unionFilter &&
        ` in ${unionFilter}`}

      {upazilaFilter &&
        `, ${upazilaFilter}`}

      {districtFilter &&
        `, ${districtFilter}`}

    </h2>

        <button
          onClick={() =>
            setShowSummary(false)
          }
          className="text-red-600 font-bold"
        >
          ✖
        </button>

      </div>

      <div className="mb-4 font-semibold">
        Total Agents:
        {" "}
        {filteredAgents.length}
        {" | "}
        Total Sale:
        {" "}
        {totalMonthlySale}
      </div>

      <table className="w-full border">

        <thead>
          <tr>
            <th className="border p-2">
              Company
            </th>

            <th className="border p-2">
              Agents
            </th>

            <th className="border p-2">
              Sale
            </th>
          </tr>
        </thead>

        <tbody>

          {companySummary.map(
            (c: any) => (
              <tr key={c.name}>

                <td className="border p-2">
                  {c.name}
                </td>

                <td className="border p-2">
                  {c.agents}
                </td>

                <td className="border p-2">
                  {c.sale}
                </td>

              </tr>
            )
          )}

        </tbody>

      </table>

    </div>

  </div>
)}


      {showAgentMap && (

        
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">

    <div className="bg-white p-4 rounded w-[900px]">

      <div className="flex justify-between mb-3">

        <h2 className="font-bold text-xl">
          Select Agent Location
        </h2>

       <button
  onClick={() =>
    setShowAgentMap(false)
  }
>
  ✖
</button>

      </div>

      <LocationPicker
  center={
    selectedDistrict
      ? [
          Number(
            selectedDistrict.lat
          ),
          Number(
            selectedDistrict.lon
          ),
        ]
      : [23.6850, 90.3563]
  }
  zoom={
    selectedDistrict
      ? 11
      : 7
  }

  selectedPosition={
    form.latitude &&
    form.longitude
      ? [
          Number(
            form.latitude
          ),
          Number(
            form.longitude
          ),
        ]
      : null
  }

  onSelect={(lat, lng) => {
    setForm({
      ...form,
      latitude:
        lat.toString(),
      longitude:
        lng.toString(),
    });

    setShowAgentMap(false);
  }}
/>

    </div>

  </div>
)}
    </div>
  );
}