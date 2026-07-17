import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import LocationPicker from "../../components/maps/LocationPicker";

import {
  getFarmers,
  createFarmer,
  updateFarmer,
  deleteFarmer,
} from "../../services/farmerService";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
delete (L.Icon.Default.prototype as any)
  ._getIconUrl;

  import { useMap } from "react-leaflet";


L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


function getFarmIcon(
  farmType: string
) {
  switch (
    farmType?.toLowerCase()
  ) {

    case "layer":
      return "🥚";

    case "broiler":
      return "🐔";

    case "sonali":
      return "🐓";

    case "cattle":
      return "🐄";

    case "fish":
      return "🐟";

    default:
      return "📍";
  }
}

function createFarmMarker(
  logoUrl: string,
  farmType: string,
  farmerName: string
) {

  const icon =
    getFarmIcon(
      farmType
    );

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
            background:white;
            padding:1px 5px;
            border-radius:5px;
            font-size:9px;
            font-weight:600;
            white-space:nowrap;
            box-shadow:0 1px 3px rgba(0,0,0,.20);
            margin-bottom:-6px;
            z-index:999;
            position:relative;
          "
        >
          ${farmerName}
        </div>

       <div
        style="
          display:flex;
          align-items:flex-end;
          margin-top:-2px;
        "
      >

          <img
            src="${logoUrl}"
            style="
              width:45px;
              height:29px;
              object-fit:contain;
            "
          />

          <div
          style="
            margin-left:-8px;
            margin-bottom:-1px;
            font-size:16px;
            z-index:999;
          "
        >
          ${icon}
        </div>

        </div>

      </div>
    `,

    className: "",

    iconSize: [80, 55],

  });
}


export default function FarmersPage() {
  const { role } = useAuth();

if (role === "viewer") {
  return (
    <div className="p-6">
      Access Denied
    </div>
  );
}
  const [farmers, setFarmers] =
    useState<any[]>([]);

  const [companies, setCompanies] =
    useState<any[]>([]);

  const [agents, setAgents] =
    useState<any[]>([]);
  
  const [filteredAgents,
  setFilteredAgents] =
  useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [selectedFarmer, setSelectedFarmer] =
    useState<any>(null);

    const [showMap, setShowMap] =
  useState(false);

  const [form, setForm] =
    useState({
      company_id: "",
      agent_id: "",

      farmer_name: "",
      mobile: "",

      village: "",
      union_name: "",
      upazila: "",
      district: "Mymensingh",

      farm_type: "",
      farm_size: "",

      feed_type: "",

      latitude: "",
      longitude: "",

      status: "Active",

      remarks: "",
    });

    const [companyFilter, setCompanyFilter] =
  useState("");

const [agentFilter, setAgentFilter] =
  useState("");

const [districtFilter, setDistrictFilter] =
  useState("");

const [upazilaFilter, setUpazilaFilter] =
  useState("");

const [unionFilter, setUnionFilter] =
  useState("");

const [showForm, setShowForm] =
  useState(false);

  const [districts, setDistricts] =
  useState<any[]>([]);

const [upazilas, setUpazilas] =
  useState<any[]>([]);

const [unions, setUnions] =
  useState<any[]>([]);

  const [showFarmerMap,
setShowFarmerMap] =
useState(false);


  const [showSummary,
setShowSummary] =
useState(false);
const [farmTypeFilter,
setFarmTypeFilter] =
useState("");

const [myLocationMode,
setMyLocationMode] =
useState(false);

const [
  selectedFarmerPosition,
  setSelectedFarmerPosition,
] = useState<
  [number, number] | null
>(null);

const [myPosition,
setMyPosition] =
useState<
  [number, number] | null
>(null);


  function clearFilters() {
  setCompanyFilter("");
  setAgentFilter("");
  setDistrictFilter("");
  setUpazilaFilter("");
  setUnionFilter("");
  setFarmTypeFilter("");
  setSearch("");
}



  async function loadData() {
    const farmerData =
      await getFarmers();

    setFarmers(farmerData || []);

    const { data: companyData } =
      await supabase
        .from("companies")
        .select("*")
        .order("company_name");

    setCompanies(
      companyData || []
    );

    const { data: agentData } =
      await supabase
        .from("agents")
        .select("*")
        .order("agent_name");

    setAgents(agentData || []);

    const { data: districtData } =
  await supabase
    .from("districts")
    .select("*")
    .order("name");

setDistricts(
  districtData || []
);
  }
  

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave() {

    if (
  !form.company_id ||
  !form.agent_id ||
  !form.farmer_name.trim()
) {
  alert(
    "Company, Agent and Farmer Name are required"
  );
  return;
}
      

    const payload = {
      ...form,

      company_id:
        Number(
          form.company_id
        ),

      agent_id:
        Number(
          form.agent_id
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
      await updateFarmer(
        editingId,
        payload as any
      );

      alert(
        "Farmer Updated"
      );
    } else {
      await createFarmer(
        payload as any
      );

      alert(
        "Farmer Saved"
      );
    }

    setEditingId(null);

    setForm({
      company_id: "",
      agent_id: "",

      farmer_name: "",
      mobile: "",

      village: "",
      union_name: "",
      upazila: "",
      district: "Mymensingh",

      farm_type: "",
      farm_size: "",

      feed_type: "",

      latitude: "",
      longitude: "",

      status: "Active",

      remarks: "",
    });

    setShowForm(false);

    loadData();
  }

  async function handleDelete(
    id: number
  ) {
    const ok =
      confirm(
        "Delete Farmer?"
      );

    if (!ok) return;

    await deleteFarmer(id);

    loadData();
  }


  function FitBounds({
  positions,
}: {
  positions: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
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

function FlyToFarmer({
  position,
}: {
  position:
    | [number, number]
    | null;
}) {

  const map =
    useMap();

  useEffect(() => {

    if (
      position
    ) {

      map.flyTo(
        position,
        17
      );

    }

  }, [
    position,
    map,
  ]);

  return null;
}


function FlyToLocation({
  position,
}: {
  position:
    | [number, number]
    | null;
}) {

  const map = useMap();

  useEffect(() => {

    if (position) {

      map.flyTo(
        position,
        15
      );

    }

  }, [
    position,
    map,
  ]);

  return null;
}


  function exportFarmersExcel() {

  const exportData =
    farmers
      .filter((f) => {

        const matchSearch =
          f.farmer_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchCompany =
          companyFilter === "" ||
          String(
            f.company_id
          ) === companyFilter;

        const matchAgent =
          agentFilter === "" ||
          String(
            f.agent_id
          ) === agentFilter;

        const matchDistrict =
          districtFilter === "" ||
          f.district ===
            districtFilter;

        const matchUpazila =
          upazilaFilter === "" ||
          f.upazila ===
            upazilaFilter;

        const matchUnion =
          unionFilter === "" ||
          f.union_name ===
            unionFilter;

        const matchFarmType =
          farmTypeFilter === "" ||
          f.farm_type ===
            farmTypeFilter;

        return (
          matchSearch &&
          matchCompany &&
          matchAgent &&
          matchDistrict &&
          matchUpazila &&
          matchUnion && 
          matchFarmType
        );
      })

      .sort((a: any, b: any) => {

        const companyCompare =
          (
            a.companies
              ?.company_name || ""
          ).localeCompare(
            b.companies
              ?.company_name || ""
          );

        if (
          companyCompare !== 0
        ) {
          return companyCompare;
        }

        return (
          a.farmer_name || ""
        ).localeCompare(
          b.farmer_name || ""
        );

      })

      .map((farmer: any) => ({

        Company:
          farmer.companies
            ?.company_name || "",

        Agent:
          farmer.agents
            ?.agent_name || "",

        Farmer_Name:
          farmer.farmer_name,

        Mobile:
          farmer.mobile,

        Village:
          farmer.village,

        Union:
          farmer.union_name,

        Upazila:
          farmer.upazila,

        District:
          farmer.district,

        Farm_Type:
          farmer.farm_type,

        Farm_Size:
          farmer.farm_size,

        Feed_Type:
          farmer.feed_type,

        Status:
          farmer.status,

        Remarks:
          farmer.remarks,

      }));


  const worksheet =
    XLSX.utils.json_to_sheet(
      exportData
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Farmers"
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
    `Farmers_${
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
      farmTypeFilter ||
      "AllFarmType"
    }_${
      today
    }.xlsx`;

  saveAs(
    file,
    fileName
  );
}




  const selectedDistrict =
  districts.find(
    (d) =>
      d.name ===
      form.district
  );

  useEffect(() => {
  async function loadUpazilas() {

    if (
      !selectedDistrict
    ) {
      setUpazilas([]);
      return;
    }

    const { data } =
      await supabase
        .from("upazilas")
        .select("*")
        .eq(
          "district_id",
          selectedDistrict.id
        )
        .order("name");

    setUpazilas(
      data || []
    );
  }

  loadUpazilas();

}, [selectedDistrict]);

const selectedUpazila =
  upazilas.find(
    (u) =>
      u.name ===
      form.upazila
  );

  useEffect(() => {

  async function loadUnions() {

    if (
      !selectedUpazila
    ) {
      setUnions([]);
      return;
    }

    const { data } =
      await supabase
        .from("unions")
        .select("*")
        .eq(
          "upazila_id",
          selectedUpazila.id
        )
        .order("name");

    setUnions(
      data || []
    );
  }

  loadUnions();

}, [selectedUpazila]);



const companySummary =
  Object.values(
    farmers
      .filter((f) => {

        const matchSearch =
          f.farmer_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchCompany =
          companyFilter === "" ||
          String(
            f.company_id
          ) === companyFilter;

        const matchAgent =
          agentFilter === "" ||
          String(
            f.agent_id
          ) === agentFilter;

        const matchDistrict =
          districtFilter === "" ||
          f.district === districtFilter;

        const matchUpazila =
          upazilaFilter === "" ||
          f.upazila === upazilaFilter;

        const matchUnion =
          unionFilter === "" ||
          f.union_name === unionFilter;

        return (
          matchSearch &&
          matchCompany &&
          matchAgent &&
          matchDistrict &&
          matchUpazila &&
          matchUnion
        );

      })
      .reduce(
      (acc: any, farmer: any) => {

        const company =
          farmer.companies
            ?.company_name ||
          "Unknown";

        if (!acc[company]) {

          acc[company] = {

            company,

            totalFarmers: 0,
            totalFarmSize: 0,

            broilerFarmers: 0,
            broilerSize: 0,

            layerFarmers: 0,
            layerSize: 0,

            sonaliFarmers: 0,
            sonaliSize: 0,

            cattleFarmers: 0,
            cattleSize: 0,

            fishFarmers: 0,
            fishSize: 0,

          };
        }

        acc[company]
          .totalFarmers += 1;

        const size =
          Number(
            farmer.farm_size || 0
          );

        acc[company]
          .totalFarmSize += size;

        switch (
          farmer.farm_type
        ) {

          case "Broiler":

            acc[company]
              .broilerFarmers += 1;

            acc[company]
              .broilerSize += size;

            break;

          case "Layer":

            acc[company]
              .layerFarmers += 1;

            acc[company]
              .layerSize += size;

            break;

          case "Sonali":

            acc[company]
              .sonaliFarmers += 1;

            acc[company]
              .sonaliSize += size;

            break;

          case "Cattle":

            acc[company]
              .cattleFarmers += 1;

            acc[company]
              .cattleSize += size;

            break;

          case "Fish":

            acc[company]
              .fishFarmers += 1;

            acc[company]
              .fishSize += size;

            break;

        }

        return acc;

      },
      {}
    )
  );

  const selectedCompanyName =
  companies.find(
    (c) =>
      String(c.id) ===
      companyFilter
  )?.company_name ||
  "All Companies";



  function exportFarmerSummaryExcel() {

  const exportData =
    companySummary.map(
      (row: any) => ({

        Company:
          row.company,

        Total_Farmers:
          row.totalFarmers,

        Total_Farm_Size:
          row.totalFarmSize,

        Broiler_Farmers:
          row.broilerFarmers,

        Broiler_Size:
          row.broilerSize,

        Layer_Farmers:
          row.layerFarmers,

        Layer_Size:
          row.layerSize,

        Sonali_Farmers:
          row.sonaliFarmers,

        Sonali_Size:
          row.sonaliSize,

        Cattle_Farmers:
          row.cattleFarmers,

        Cattle_Size:
          row.cattleSize,

        Fish_Farmers:
          row.fishFarmers,

        Fish_Size:
          row.fishSize,

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
    "Farmer Summary"
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

  const fileName =
    `Farmer_Summary_${
      districtFilter ||
      "AllDistricts"
    }_${
      upazilaFilter ||
      "AllUpazilas"
    }_${
      unionFilter ||
      "AllUnions"
    }_${
      farmTypeFilter ||
      "AllTypes"
    }_${
      today
    }.xlsx`;

  saveAs(
    file,
    fileName
  );
}
  

const filteredFarmers =
  farmers.filter((f) => {

    const matchSearch =
      f.farmer_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const matchCompany =
      companyFilter === "" ||
      String(f.company_id) === companyFilter;

    const matchAgent =
      agentFilter === "" ||
      String(f.agent_id) === agentFilter;

    const matchDistrict =
      districtFilter === "" ||
      f.district === districtFilter;

    const matchUpazila =
      upazilaFilter === "" ||
      f.upazila === upazilaFilter;

    const matchUnion =
      unionFilter === "" ||
      f.union_name === unionFilter;

    const matchFarmType =
      farmTypeFilter === "" ||
      f.farm_type === farmTypeFilter;

    return (
      matchSearch &&
      matchCompany &&
      matchAgent &&
      matchDistrict &&
      matchUpazila &&
      matchUnion &&
      matchFarmType
    );
  });





  const nearestFarmers =
  myPosition
    ? [...filteredFarmers]
        .filter(
          (f) =>
            f.latitude &&
            f.longitude
        )
        .map((f) => ({

          ...f,

          distance:
            Math.sqrt(
              Math.pow(
                Number(
                  f.latitude
                ) -
                  myPosition[0],
                2
              ) +
                Math.pow(
                  Number(
                    f.longitude
                  ) -
                    myPosition[1],
                  2
                )
            ),

        }))
        .sort(
          (a, b) =>
            a.distance -
            b.distance
        )
        .slice(0, 10)
    : [];

    

  return (
    <div className="p-4">

      <h1 className="text-2xl font-bold mb-4">
        Farmer Management
      </h1>

      <div className="mb-4">
      <button
  onClick={() => {
  setEditingId(null);

  setForm({
    company_id: "",
    agent_id: "",

    farmer_name: "",
    mobile: "",

    village: "",
    union_name: "",
    upazila: "",
    district: "Mymensingh",

    farm_type: "",
    farm_size: "",

    feed_type: "",

    latitude: "",
    longitude: "",

    status: "Active",

    remarks: "",
  });

  setShowForm(true);
}}
  className="bg-green-600 text-white px-4 py-2 rounded"
>
  Add Farmer
</button>
    </div>

    {showForm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-xl font-bold">
          {editingId
            ? "Edit Farmer"
            : "Add Farmer"}
        </h2>

        <button
          onClick={() =>
            setShowForm(false)
          }
        >
          ✖
        </button>

      </div>



          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Company </label>
        <select
          value={form.company_id}
          onChange={(e) => {
  const companyId =
    e.target.value;

  setForm({
    ...form,
    company_id:
      companyId,
    agent_id: "",
  });

  const filtered =
    agents.filter(
      (agent) =>
        String(
          agent.company_id
        ) === companyId
    );

  setFilteredAgents(
    filtered
  );
}}

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
            Agent </label>
        <select
          value={form.agent_id}
          onChange={(e) =>
            setForm({
              ...form,
              agent_id:
                e.target.value,
            })
          }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"        >
          <option value="">
            Select Agent
          </option>

          {filteredAgents.map(
            (agent) => (
              <option
                key={agent.id}
                value={agent.id}
              >
                {
                  agent.agent_name
                }
              </option>
            )
          )}
        </select>

    <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Farmer </label>
        <input
          placeholder="Farmer Name"
          value={
            form.farmer_name
          }
          onChange={(e) =>
            setForm({
              ...form,
              farmer_name:
                e.target.value,
            })
          }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"        />
        
        
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
    (district) => (
      <option
        key={district.id}
        value={district.name}
      >
        {district.name}
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
    (upazila) => (
      <option
        key={upazila.id}
        value={upazila.name}
      >
        {upazila.name}
      </option>
    )
  )}
</select>

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Union </label>
<select
  value={
    form.union_name
  }
  onChange={(e) =>
    setForm({
      ...form,
      union_name:
        e.target.value,
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
>
  <option value="">
    Select Union
  </option>

  {unions.map(
    (union) => (
      <option
        key={union.id}
        value={union.name}
      >
        {union.name}
      </option>
    )
  )}
</select>

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Village </label>
<input
          placeholder="Village"
          value={form.village}
          onChange={(e) =>
            setForm({
              ...form,
              village:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        />


          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Location Select from Map </label>
          <button
  type="button"
  onClick={() =>
    setShowMap(true)
  }
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
            Farm Type </label>
        <select
          value={form.farm_type}
          onChange={(e) =>
            setForm({
              ...form,
              farm_type:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        >
          <option value="">
            Farm Type
          </option>

          <option>
            Broiler
          </option>

          <option>
            Layer
          </option>

          <option>
            Sonali
          </option>

          <option>
            Cattle
          </option>

          <option>
            Fish
          </option>

          <option>
            Goat
          </option>

          <option>
            Duck
          </option>
        </select>

          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Farm Size </label>
        <input
          placeholder="Farm Size"
          value={
            form.farm_size
          }
          onChange={(e) =>
            setForm({
              ...form,
              farm_size:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        />

          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Feed Type </label>
        <input
          placeholder="Feed Type"
          value={
            form.feed_type
          }
          onChange={(e) =>
            setForm({
              ...form,
              feed_type:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        />

          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Remarks </label>
        <textarea
          placeholder="Remarks"
          value={form.remarks}
          onChange={(e) =>
            setForm({
              ...form,
              remarks:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        />

        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {editingId
            ? "Update Farmer"
            : "Save Farmer"}
        </button>

        <button
  onClick={() =>
    setShowForm(false)
  }
  className="bg-gray-500 text-white px-4 py-2 rounded"
>
  Cancel
</button>

    </div>

  </div>
)}

      <input
        type="text"
        placeholder="Search Farmer..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        className="border p-2 w-full mb-4"
      />

      <div className="flex flex-wrap gap-2 mb-4">


  <select
    value={companyFilter}
    onChange={(e) =>
      setCompanyFilter(
        e.target.value
      )
    }
    className="border p-2 rounded"
  >
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
    value={agentFilter}
    onChange={(e) =>
      setAgentFilter(
        e.target.value
      )
    }
    className="border p-2 rounded"
  >
    <option value="">
      All Agents
    </option>

    {agents.map((a) => (
      <option
        key={a.id}
        value={a.id}
      >
        {a.agent_name}
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
    className="border p-2 rounded"
  >
    <option value="">
      All Districts
    </option>

    {[...new Set(
      farmers.map(
        (f) => f.district
      )
    )].map((district) => (
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
    className="border p-2 rounded"
  >
    <option value="">
      All Upazilas
    </option>

    {[...new Set(
      farmers.map(
        (f) => f.upazila
      )
    )].map((upazila) => (
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
    onChange={(e) =>
      setUnionFilter(
        e.target.value
      )
    }
    className="border p-2 rounded"
  >
    <option value="">
      All Unions
    </option>

    {[...new Set(
      farmers.map(
        (f) => f.union_name
      )
    )].map((union) => (
      <option
        key={union}
        value={union}
      >
        {union}
      </option>
    ))}
  </select>


<select
  value={farmTypeFilter}
  onChange={(e) =>
    setFarmTypeFilter(
      e.target.value
    )
  }
  className="border p-2 rounded"
>
  <option value="">
    All Farm Types
  </option>

  <option value="Broiler">
    Broiler
  </option>

  <option value="Layer">
    Layer
  </option>

  <option value="Sonali">
    Sonali
  </option>

  <option value="Cattle">
    Cattle
  </option>

  <option value="Fish">
    Fish
  </option>

</select>



  <button
  onClick={clearFilters}
  className="bg-gray-600 text-white px-4 py-2 rounded"
>
  Clear Filters
</button>


<button
  onClick={() =>
    setShowSummary(true)
  }
  className="bg-indigo-600 text-white px-4 py-2 rounded"
>
  Farmer Summary
</button>

<button
  onClick={
    exportFarmersExcel
  }
  className="bg-green-700 text-white px-4 py-2 rounded"
>
  Export Farmers Excel
</button>

<button
  onClick={() => {

    if (!showFarmerMap) {

      setMyLocationMode(
        false
      );

      setMyPosition(
        null
      );

      setSelectedFarmerPosition(
        null
      );

    }

    setShowFarmerMap(
      !showFarmerMap
    );

  }}
  className="bg-blue-600 text-white px-4 py-2 rounded"
>
  {showFarmerMap
    ? "Hide Map"
    : "Show Map"}
</button>

<button
  onClick={() => {

    navigator.geolocation.getCurrentPosition(
      (position) => {

        setMyPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);

        setMyLocationMode(true);
      }
    );

  }}
  className="bg-green-600 text-white px-4 py-2 rounded"
>
  📍 My Location
</button>

</div>


{showFarmerMap && (

<div className="bg-white rounded-xl shadow-lg p-4 mb-4">

  <h3 className="text-lg font-semibold mb-3">
    Farmer Map
  </h3>

  <MapContainer

    center={[
      24.7471,
      90.4203,
    ]}
    zoom={8}
    style={{
      height: "600px",
      width: "100%",
    }}
  >

    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <FlyToFarmer
  position={
    selectedFarmerPosition
  }
/>

{myLocationMode &&
  myPosition && (

  <FlyToLocation
    position={
      myPosition
    }
  />

)}

    {myPosition && (

  <Marker
    position={
      myPosition
    }
  >

    <Popup>
      📍 My Location
    </Popup>

  </Marker>

)}


<FitBounds
  positions={
    myLocationMode
      ? []
      : filteredFarmers
          .filter(
            (f) =>
              f.latitude &&
              f.longitude
          )
          .map((f) => [
            Number(
              f.latitude
            ),
            Number(
              f.longitude
            ),
          ])
  }
/>




    {filteredFarmers
      .filter(
        (f) =>
          f.latitude &&
          f.longitude
      )
      .map(
        (farmer) => (

         <Marker
          key={farmer.id}
          position={[
            Number(farmer.latitude),
            Number(farmer.longitude),
          ]}
          icon={createFarmMarker(
            farmer.companies?.logo_url,
            farmer.farm_type,
            farmer.farmer_name
          )}
        >

            <Popup maxWidth={350}>

            <div
              style={{
                minWidth: "250px",
                lineHeight: "1.7",
              }}
            >

              <img
                  src={
                    farmer.companies
                      ?.logo_url
                  }
                  style={{
                    width: "70px",
                    maxHeight: "58px",
                    objectFit: "contain",
                    marginBottom: "8px",
                  }}
                />

              <h3
                style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  marginBottom: "8px",
                }}
              >
                {getFarmIcon(
                  farmer.farm_type
                )}{" "}
                {farmer.farmer_name}
              </h3>

              <hr />

              <div>
                <b>Company:</b>{" "}
                {farmer.companies
                  ?.company_name}
              </div>

              <div>
                <b>Agent:</b>{" "}
                {farmer.agents
                  ?.agent_name}
              </div>

              <div>
                <b>Mobile:</b>{" "}
                {farmer.mobile}
              </div>

              <div>
                <b>Farm Type:</b>{" "}
                {farmer.farm_type}
              </div>

              <div>
                <b>Farm Size:</b>{" "}
                {farmer.farm_size}
              </div>

              <div>
                <b>Village:</b>{" "}
                {farmer.village}
              </div>

              <div>
                <b>Union:</b>{" "}
                {farmer.union_name}
              </div>

              <div>
                <b>Upazila:</b>{" "}
                {farmer.upazila}
              </div>

              <div>
                <b>District:</b>{" "}
                {farmer.district}
              </div>

              <div>
                <b>Status:</b>{" "}
                {farmer.status}
              </div>

              <div>
                <b>Remarks:</b>{" "}
                {farmer.remarks || "-"}
              </div>

            </div>

          </Popup>

          </Marker>

        )
      )}

  </MapContainer>



  {myLocationMode && (

<div className="mt-4 bg-white p-4 rounded-xl shadow">

  <h3 className="text-lg font-semibold mb-3">
    📍 Nearest Farmers
  </h3>


  {nearestFarmers.map(
    (farmer) => (

      <div
        key={farmer.id}
        className="
          border-b
          py-2
          cursor-pointer
          hover:bg-gray-100
        "

        onClick={() =>
  setSelectedFarmerPosition(
    [
      Number(
        farmer.latitude
      ),
      Number(
        farmer.longitude
      ),
    ]
  )
}
      >

        {getFarmIcon(
          farmer.farm_type
        )}{" "}

        {farmer.farmer_name}

      </div>

    )
  )}

</div>

)}

</div>

)}



<div className="overflow-x-auto">
      <table className="w-max border">

        <thead>

          <tr>
            <th className="border p-2">
              Company
            </th>

            <th className="border p-2">
              Agent
            </th>

            <th className="border p-2">
              Farmer
            </th>

            <th className="border p-2">
              Mobile
            </th>

            <th className="border p-2">
              Farm Type
            </th>

            <th className="border p-2">
              Village
            </th>

            <th className="border p-2">
              Union
            </th>

            <th className="border p-2">
              Upazila
            </th>

            <th className="border p-2">
              Farm Size
            </th>

            <th className="border p-2">
              Status
            </th>

            <th className="border p-2">
              Actions
            </th>
          </tr>

        </thead>

        <tbody>

          {farmers
  .filter((f) => {

    const matchSearch =
      f.farmer_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const matchCompany =
      companyFilter === ""
        ? true
        : String(
            f.company_id
          ) === companyFilter;

    const matchAgent =
      agentFilter === ""
        ? true
        : String(
            f.agent_id
          ) === agentFilter;

    const matchDistrict =
      districtFilter === ""
        ? true
        : f.district ===
          districtFilter;

    const matchUpazila =
      upazilaFilter === ""
        ? true
        : f.upazila ===
          upazilaFilter;

    const matchUnion =
      unionFilter === ""
        ? true
        : f.union_name ===
          unionFilter;

    const matchFarmType =
      farmTypeFilter === "" ||
      f.farm_type ===
        farmTypeFilter;

    return (
      matchSearch &&
      matchCompany &&
      matchAgent &&
      matchDistrict &&
      matchUpazila &&
      matchUnion &&
      matchFarmType
    );
  })

  .sort((a: any, b: any) => {

  const companyCompare =
    (
      a.agents?.companies
        ?.company_name || ""
    ).localeCompare(
      b.agents?.companies
        ?.company_name || ""
    );

  if (companyCompare !== 0) {
    return companyCompare;
  }

  return (
    a.farmer_name || ""
  ).localeCompare(
    b.farmer_name || ""
  );

})

  .map((farmer) => (
              <tr
                key={farmer.id}
              >
                <td className="border p-2">
                  {
                    farmer
                      .companies
                      ?.company_name
                  }
                </td>

                <td className="border p-2">
                  {
                    farmer
                      .agents
                      ?.agent_name
                  }
                </td>

                <td className="border p-2">
                  {
                    farmer.farmer_name
                  }
                </td>

                <td className="border p-2">
                  {
                    farmer.mobile
                  }
                </td>

                <td className="border p-2">
                  {
                    farmer.farm_type
                  }
                </td>

                <td className="border p-2">
                  {
                    farmer.village
                  }
                </td>
                  
                  <td className="border p-2">
                  {
                    farmer.union_name
                  }
                </td>

                <td className="border p-2">
                  {
                    farmer.upazila
                  }
                </td>

                <td className="border p-2">
                  {
                    farmer.farm_size
                  }
                </td>

                <td className="border p-2">
                  {
                    farmer.status
                  }
                </td>

                <td className="border p-2">

  <button
    onClick={() =>
      setSelectedFarmer(farmer)
    }
    className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
  >
    View
  </button>

  <button
    onClick={() => {
      setEditingId(farmer.id);
      const filtered =
  agents.filter(
    (agent) =>
      agent.company_id ===
      farmer.company_id
  );

setFilteredAgents(
  filtered
);

      setForm({
        company_id: String(
          farmer.company_id
        ),

        agent_id: String(
          farmer.agent_id
        ),

        farmer_name:
          farmer.farmer_name || "",

        mobile:
          farmer.mobile || "",

        village:
          farmer.village || "",

        union_name:
          farmer.union_name || "",

        upazila:
          farmer.upazila || "",

        district:
          farmer.district || "",

        farm_type:
          farmer.farm_type || "",

        farm_size:
          farmer.farm_size || "",

        feed_type:
          farmer.feed_type || "",

        latitude: String(
          farmer.latitude || ""
        ),

        longitude: String(
          farmer.longitude || ""
        ),

        status:
          farmer.status ||
          "Active",

        remarks:
          farmer.remarks || "",
      });

      setShowForm(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }}
    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
  >
    Edit
  </button>

  <button
    onClick={() =>
      handleDelete(
        farmer.id
      )
    }
    className="bg-red-600 text-white px-2 py-1 rounded"
  >
    Delete
  </button>

</td>
              </tr>
            ))}

        </tbody>

      </table>

      </div>

      

{selectedFarmer && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

    <div className="bg-white p-6 rounded w-[700px] max-h-[90vh] overflow-auto">

      <div className="flex justify-between mb-4">

        <h2 className="text-xl font-bold">
          Farmer Details
        </h2>

        <button
          onClick={() =>
            setSelectedFarmer(
              null
            )
          }
        >
          ✖
        </button>

      </div>

      <div className="space-y-2">

        <p>
          <b>Company:</b>{" "}
          {
            selectedFarmer
              ?.companies
              ?.company_name
          }
        </p>

        <p>
          <b>Agent:</b>{" "}
          {
            selectedFarmer
              ?.agents
              ?.agent_name
          }
        </p>

        <p>
          <b>Farmer:</b>{" "}
          {
            selectedFarmer
              ?.farmer_name
          }
        </p>

        <p>
          <b>Mobile:</b>{" "}
          {
            selectedFarmer
              ?.mobile
          }
        </p>

        <p>
          <b>Village:</b>{" "}
          {
            selectedFarmer
              ?.village
          }
        </p>

        <p>
          <b>Union:</b>{" "}
          {
            selectedFarmer
              ?.union_name
          }
        </p>

        <p>
          <b>Upazila:</b>{" "}
          {
            selectedFarmer
              ?.upazila
          }
        </p>

        <p>
          <b>District:</b>{" "}
          {
            selectedFarmer
              ?.district
          }
        </p>

        <p>
          <b>Farm Type:</b>{" "}
          {
            selectedFarmer
              ?.farm_type
          }
        </p>

        <p>
          <b>Farm Size:</b>{" "}
          {
            selectedFarmer
              ?.farm_size
          }
        </p>

        <p>
          <b>Feed Type:</b>{" "}
          {
            selectedFarmer
              ?.feed_type
          }
        </p>

        <p>
          <b>Latitude:</b>{" "}
          {
            selectedFarmer
              ?.latitude
          }
        </p>

        <p>
          <b>Longitude:</b>{" "}
          {
            selectedFarmer
              ?.longitude
          }
        </p>

        <p>
          <b>Status:</b>{" "}
          {
            selectedFarmer
              ?.status
          }
        </p>

        <p>
          <b>Remarks:</b>{" "}
          {
            selectedFarmer
              ?.remarks
          }
        </p>

      </div>

    </div>

  </div>
)}


{showSummary && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <div className="bg-white rounded-xl p-6 w-[95%] max-w-7xl max-h-[90vh] overflow-auto">

    <div className="flex justify-between items-center mb-4">

      <h2 className="text-xl font-bold">
        Farmer Summary
      </h2>

      <button
        onClick={() =>
          setShowSummary(false)
        }
      >
        ✖
      </button>

    </div>

    <h2 className="text-xl font-bold mb-2">
  Farmer Summary of {selectedCompanyName}
</h2>

<button
  onClick={exportFarmerSummaryExcel}
  className="bg-green-600 text-white px-4 py-2 rounded mt-2 mb-4"
>
  Export Farmer Summary
</button>

<p>
  Union: {unionFilter || "All Unions"}
</p>

<p>
  Upazila: {upazilaFilter || "All Upazilas"}
</p>

<p>
  District: {districtFilter || "All Districts"}
</p>

    <thead>

<tr className="bg-gray-100">

<th className="border p-2">
  Company
</th>

<th className="border p-2">
  Total Farmers
</th>

<th className="border p-2">
  Total Farm Size
</th>

<th className="border p-2">
  Broiler Farmers
</th>

<th className="border p-2">
  Broiler Size
</th>

<th className="border p-2">
  Layer Farmers
</th>

<th className="border p-2">
  Layer Size
</th>

<th className="border p-2">
  Sonali Farmers
</th>

<th className="border p-2">
  Sonali Size
</th>

<th className="border p-2">
  Cattle Farmers
</th>

<th className="border p-2">
  Cattle Size
</th>

<th className="border p-2">
  Fish Farmers
</th>

<th className="border p-2">
  Fish Size
</th>

</tr>

</thead>

<tbody>

{companySummary.map(
  (row: any) => (

<tr key={row.company}>

<td className="border p-2">
  {row.company}
</td>

<td className="border p-2">
  {row.totalFarmers}
</td>

<td className="border p-2">
  {row.totalFarmSize}
</td>

<td className="border p-2">
  {row.broilerFarmers}
</td>

<td className="border p-2">
  {row.broilerSize}
</td>

<td className="border p-2">
  {row.layerFarmers}
</td>

<td className="border p-2">
  {row.layerSize}
</td>

<td className="border p-2">
  {row.sonaliFarmers}
</td>

<td className="border p-2">
  {row.sonaliSize}
</td>

<td className="border p-2">
  {row.cattleFarmers}
</td>

<td className="border p-2">
  {row.cattleSize}
</td>

<td className="border p-2">
  {row.fishFarmers}
</td>

<td className="border p-2">
  {row.fishSize}
</td>

</tr>

))}

</tbody>

  </div>

</div>

)}



{showMap && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white p-4 rounded w-[900px]">

      <div className="flex justify-between mb-3">

        <h2 className="font-bold text-xl">
          Select Farm Location
        </h2>

        <button
          onClick={() =>
            setShowMap(false)
          }
        >
          ✖
        </button>

      </div>

      <LocationPicker
        onSelect={(
          lat,
          lng
        ) => {
          setForm({
            ...form,
            latitude:
              lat.toString(),
            longitude:
              lng.toString(),
          });

          setShowMap(
            false
          );
        }}
      />

    </div>

  </div>
)}

    </div>
  );
}