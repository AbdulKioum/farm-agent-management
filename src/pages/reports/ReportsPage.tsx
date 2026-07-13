import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import { useMemo } from "react";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function RecenterMap({
  position,
}: {
  position: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 15);
  }, [position]);

  return null;
}

export default function ReportsPage() {
  const [farmers, setFarmers] =
    useState<any[]>([]);
  
    const [reportType, setReportType] =
  useState("farmer");

    const [agentReport,
  setAgentReport] =
  useState<any[]>([]);

const [companyReport,
  setCompanyReport] =
  useState<any[]>([]);

  const [filteredFarmers,
    setFilteredFarmers] =
    useState<any[]>([]);

  const [filteredAgents,
  setFilteredAgents] =
  useState<any[]>([]);

const [filteredCompanies,
  setFilteredCompanies] =
  useState<any[]>([]);

  const [companies, setCompanies] =
    useState<any[]>([]);

  const [, setAgents] =
    useState<any[]>([]);

    const [showMap, setShowMap] =
  useState(false);

  const [filters, setFilters] =
  useState({
    company_id: "",
    agent_id: "",
    district: "",
    upazila: "",
    union_name: "",
    farm_type: "",
    status: "",
  });

  const [userLocation,
  setUserLocation] =
  useState<[number, number] | null>(null);

  const [selectedFarm,
  setSelectedFarm] =
  useState<
    [number, number] | null
  >(null);

  useEffect(() => {
    loadData();
  }, []);

 useEffect(() => {
  applyFilters();
}, [
  filters,
  farmers,
  agentReport,
  companyReport,
  reportType,
]);

  async function loadData() {

    const { data: farmerData } =
  await supabase
    .from("farmers")
    .select(`
      *,
      companies(
        company_name,
        logo_url
      ),
      agents(agent_name)
    `);

    setFarmers(
      farmerData || []
    );

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

    setAgents(
      agentData || []
    );

    const { data: agentData2 } =
  await supabase
    .from("agents")
    .select(`
      *,
      companies(
        company_name,
        logo_url
      )
    `);

    console.log(agentData2);

setAgentReport(
  agentData2 || []
);

const { data: companyData2 } =
  await supabase
    .from("companies")
    .select(`
      *,
      agents(
        agent_name
      )
    `);

setCompanyReport(
  companyData2 || []
);

setAgentReport(
  agentData2 || []
);

setFilteredAgents(
  agentData2 || []
);

setCompanyReport(
  companyData2 || []
);

setFilteredCompanies(
  companyData2 || []
);
  }
  

 function applyFilters() {

  // FARMER REPORT

  if (reportType === "farmer") {

    let data = [...farmers];

    if (filters.company_id) {
      data = data.filter(
        (f) =>
          String(f.company_id) ===
          filters.company_id
      );
    }

    if (filters.agent_id) {
      data = data.filter(
        (f) =>
          String(f.agent_id) ===
          filters.agent_id
      );
    }

    if (filters.district) {
      data = data.filter(
        (f) =>
          f.district
            ?.toLowerCase()
            .includes(
              filters.district.toLowerCase()
            )
      );
    }

    if (filters.upazila) {
      data = data.filter(
        (f) =>
          f.upazila
            ?.toLowerCase()
            .includes(
              filters.upazila.toLowerCase()
            )
      );
    }

   if (filters.union_name) {
  data = data.filter(
    (a) =>
      a.union_name
        ?.toLowerCase()
        .includes(
          filters.union_name.toLowerCase()
        )
  );
}
    if (filters.farm_type) {
      data = data.filter(
        (f) =>
          f.farm_type ===
          filters.farm_type
      );
    }

    if (filters.status) {
      data = data.filter(
        (f) =>
          f.status ===
          filters.status
      );
    }

    setFilteredFarmers(data);
    return;
  }

  // AGENT REPORT

  if (reportType === "agent") {

    let data = [...agentReport];

    if (filters.company_id) {
      data = data.filter(
        (a) =>
          String(a.company_id) ===
          filters.company_id
      );
    }

    if (filters.district) {
      data = data.filter(
        (a) =>
          a.district
            ?.toLowerCase()
            .includes(
              filters.district.toLowerCase()
            )
      );
    }

    if (filters.upazila) {
      data = data.filter(
        (a) =>
          a.upazila
            ?.toLowerCase()
            .includes(
              filters.upazila.toLowerCase()
            )
      );
    }

    if (filters.union_name) {
  data = data.filter(
    (a) =>
      a.union_name
        ?.toLowerCase()
        .includes(
          filters.union_name.toLowerCase()
        )
  );
}

    if (filters.status) {
      data = data.filter(
        (a) =>
          a.status ===
          filters.status
      );
    }

    setFilteredAgents(data);
    return;
  }

  // COMPANY REPORT

  if (reportType === "company") {

    let data = [...companyReport];

    if (filters.status) {
      data = data.filter(
        (c) =>
          c.status ===
          filters.status
      );
    }

    setFilteredCompanies(data);
  }
}


function getCurrentLocation() {

  navigator.geolocation.getCurrentPosition(
    (position) => {

      const lat =
        position.coords.latitude;

      const lng =
        position.coords.longitude;

      setUserLocation([
      lat + Math.random() * 0.000001,
      lng + Math.random() * 0.000001,
    ]);

    },
    (error) => {
      alert(
        "Location permission denied"
      );
      console.log(error);
    }
  );

}


  function exportExcel() {
    console.log("EXPORT CLICKED");
    const exportData =
  filteredFarmers.map(
    (f) => ({
      Company:
        f.companies?.company_name || "",

      Agent:
        f.agents?.agent_name || "",

      Farmer_Name:
        f.farmer_name || "",

      Mobile:
        f.mobile || "",

      Village:
        f.village || "",

      Union:
        f.union_name || "",

      Upazila:
        f.upazila || "",

      District:
        f.district || "",

      Farm_Type:
        f.farm_type || "",

      Farm_Size:
        f.farm_size || "",

      Feed_Type:
        f.feed_type || "",

      Latitude:
        f.latitude || "",

      Longitude:
        f.longitude || "",

      Status:
        f.status || "",

      Remarks:
        f.remarks || "",

    })
  );

    const ws =
      XLSX.utils.json_to_sheet(
        exportData
      );

    const wb =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "Farmers"
    );

    const excelBuffer =
      XLSX.write(
        wb,
        {
          bookType:
            "xlsx",
          type: "array",
        }
      );

    const file =
      new Blob(
        [excelBuffer],
        {
          type:
            "application/octet-stream",
        }
      );

    saveAs(
      file,
      "farmers-report.xlsx"
    );
  }

  function exportAgentExcel() {

  const exportData =
    filteredAgents.map(
      (a) => ({
        Company:
          a.companies
            ?.company_name,

        Agent_Name:
          a.agent_name,

        Proprietor:
          a.proprietor,

        Mobile:
          a.mobile,

        Address:
          a.address,

        Village:
          a.village,

        Union:
          a.union_name,

        Upazila:
          a.upazila,

        District:
          a.district,

        Monthly_Sale:
          a.monthly_sale,

        Focus_Item:
          a.focus_item,

        Latitude:
          a.latitude,

        Longitude:
          a.longitude,

        Status:
          a.status,
      })
    );

  const ws =
    XLSX.utils.json_to_sheet(
      exportData
    );

  const wb =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Agents"
  );

  const excelBuffer =
    XLSX.write(
      wb,
      {
        bookType:
          "xlsx",
        type: "array",
      }
    );

  saveAs(
    new Blob(
      [excelBuffer]
    ),
    "agents-report.xlsx"
  );
}

function exportCompanyExcel() {

  const exportData =
    filteredCompanies.map(
      (c) => ({
        Company:
          c.company_name,

        Status:
          c.status,
      })
    );

  const ws =
    XLSX.utils.json_to_sheet(
      exportData
    );

  const wb =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Companies"
  );

  const excelBuffer =
    XLSX.write(
      wb,
      {
        bookType:
          "xlsx",
        type: "array",
      }
    );

  saveAs(
    new Blob(
      [excelBuffer]
    ),
    "companies-report.xlsx"
  );
}

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

    case "cattle":
      return "🐄";

    case "goat":
      return "🐐";

    case "fish":
      return "🐟";

    default:
      return "📍";
  }
}

function createFarmMarker(
  logoUrl: string,
  farmType: string
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
        align-items:flex-end;
      "
    >
      <img
        src="${logoUrl}"
        style="
          width:55px;
          height:35px;
          object-fit:contain;
        "
      />

      <div
        style="
          margin-left:-9px;
          margin-bottom:-5px;
          font-size:14px;
        "
      >
        ${icon}
      </div>
    </div>
  `,
  className: "",
  iconSize: [50, 35],
});
}

function createAgentMarker(
  logoUrl: string
) {
  return L.divIcon({
    html: `
      <div
        style="
          display:flex;
          align-items:center;
          justify-content:center;
        "
      >
        <img
          src="${logoUrl}"
          style="
            width:55px;
            height:35px;
            object-fit:contain;
          "
        />
      </div>
    `,
    className: "",
    iconSize: [50, 35],
  });
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
    R * c
  ).toFixed(2);
}


const sourceData =
  reportType === "agent"
    ? agentReport
    : farmers;

const districts = [
  ...new Set(
    sourceData
      .map((f) => f.district)
      .filter(Boolean)
  ),
];

const upazilas = [
  ...new Set(
    sourceData
      .filter(
        (f) =>
          !filters.district ||
          f.district ===
            filters.district
      )
      .map((f) => f.upazila)
      .filter(Boolean)
  ),
];

const unions = [
  ...new Set(
    sourceData
      .filter(
        (f) =>
          (!filters.district ||
            f.district ===
              filters.district) &&
          (!filters.upazila ||
            f.upazila ===
              filters.upazila)
      )
      .map((f) => f.union_name)
      .filter(Boolean)
  ),
];

const mapCenter = useMemo(() => {

  if (userLocation) {
    return userLocation;
  }

  const data =
    reportType === "agent"
      ? filteredAgents
      : filteredFarmers;

  const valid =
    data.filter(
      (x) =>
        x.latitude &&
        x.longitude
    );

  if (valid.length === 0) {
    return [24.75, 90.40];
  }

  const avgLat =
    valid.reduce(
      (sum, x) =>
        sum + Number(x.latitude),
      0
    ) / valid.length;

  const avgLng =
    valid.reduce(
      (sum, x) =>
        sum + Number(x.longitude),
      0
    ) / valid.length;

  return [avgLat, avgLng];

}, [
  filteredFarmers,
  filteredAgents,
  reportType,
  userLocation,
]);

const nearestFarmers =
  userLocation
    ? [...filteredFarmers]
        .filter(
          (f) =>
            f.latitude &&
            f.longitude
        )
        .sort(
          (a, b) =>
            Number(
              getDistanceKm(
                userLocation[0],
                userLocation[1],
                Number(a.latitude),
                Number(a.longitude)
              )
            ) -
            Number(
              getDistanceKm(
                userLocation[0],
                userLocation[1],
                Number(b.latitude),
                Number(b.longitude)
              )
            )
        )
        .slice(0, 10)
    : [];

    const nearestAgents =
  userLocation
    ? [...filteredAgents]
        .filter(
          (a) =>
            a.latitude &&
            a.longitude
        )
        .sort(
          (a, b) =>
            Number(
              getDistanceKm(
                userLocation[0],
                userLocation[1],
                Number(a.latitude),
                Number(a.longitude)
              )
            ) -
            Number(
              getDistanceKm(
                userLocation[0],
                userLocation[1],
                Number(b.latitude),
                Number(b.longitude)
              )
            )
        )
        .slice(0, 10)
    : [];

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Reports
      </h1>

      <div className="flex gap-2 mb-4">

  <button
    onClick={() => setReportType("farmer")}
    className="bg-blue-600 text-white px-4 py-2 rounded"
  >
    Farmer Report
  </button>

  <button
    onClick={() => setReportType("agent")}
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    Agent Report
  </button>

  <button
    onClick={() => setReportType("company")}
    className="bg-purple-600 text-white px-4 py-2 rounded"
  >
    Company Report
  </button>

  <button
  onClick={() =>
    setShowMap(!showMap)
  }
  className="bg-blue-600 text-white px-4 py-2 rounded mb-4 ml-2"
>
  {showMap
    ? "Hide Map"
    : "Show On Map"}
</button>

<button
  onClick={getCurrentLocation}
  className="bg-blue-600 text-white px-4 py-2 rounded ml-2"
>
  📍 My Location
</button>

</div>

{reportType === "farmer" && (
  <button
    onClick={exportExcel}
    className="bg-green-600 text-white px-4 py-2 rounded mb-4"
  >
    Export Farmers Excel
  </button>
)}

{reportType === "agent" && (
  <button
    onClick={exportAgentExcel}
    className="bg-green-600 text-white px-4 py-2 rounded mb-4"
  >
    Export Agents Excel
  </button>
)}

{reportType === "company" && (
  <button
    onClick={exportCompanyExcel}
    className="bg-green-600 text-white px-4 py-2 rounded mb-4"
  >
    Export Companies Excel
  </button>

  
)}

      <div className="grid md:grid-cols-3 gap-3 mb-6">

        <select
          value={
            filters.company_id
          }
          onChange={(e) => {
  const companyId =
    e.target.value;

  setFilters({
    ...filters,
    company_id:
      companyId,
    agent_id: "",
  });

  setFilters({
  ...filters,
  company_id: companyId,
  agent_id: "",
});

}}
          className="border p-2"
        >
          <option value="">
            All Companies
          </option>

          {companies.map(
            (c) => (
              <option
                key={c.id}
                value={c.id}
              >
                {
                  c.company_name
                }
              </option>
            )
          )}
        </select>

       {reportType === "farmer" && (
  <select
    value={filters.agent_id}
    onChange={(e) =>
      setFilters({
        ...filters,
        agent_id:
          e.target.value,
      })
    }
    className="border p-2"
  >
    <option value="">
      All Agents
    </option>

    {filteredAgents.map(
      (a) => (
        <option
          key={a.id}
          value={a.id}
        >
          {a.agent_name}
        </option>
      )
    )}
  </select>
)}
        <select
  value={filters.district}
  onChange={(e) =>
    setFilters({
      ...filters,
      district:
        e.target.value,
      upazila: "",
      union_name: "",
    })
  }
  className="border p-2"
>
  <option value="">
    All Districts
  </option>

  {districts.map(
    (district) => (
      <option
        key={district}
        value={district}
      >
        {district}
      </option>
    )
  )}
</select>
<select
  value={filters.upazila}
  onChange={(e) =>
    setFilters({
      ...filters,
      upazila:
        e.target.value,
      union_name: "",
    })
  }
  className="border p-2"
>
  <option value="">
    All Upazilas
  </option>

  {upazilas.map(
    (upazila) => (
      <option
        key={upazila}
        value={upazila}
      >
        {upazila}
      </option>
    )
  )}
</select>

<select
  value={filters.union_name}
  onChange={(e) =>
    setFilters({
      ...filters,
      union_name:
        e.target.value,
    })
  }
  className="border p-2"
>
  <option value="">
    All Unions
  </option>

  {unions.map(
    (union) => (
      <option
        key={union}
        value={union}
      >
        {union}
      </option>
    )
  )}
</select>

      </div>

      {reportType === "farmer" && (
  <div>
    {/* Existing Farmer Table এখানে থাকবে */}
  </div>
)}


{reportType === "company" && (
  <table className="w-full border mt-4">

    <thead>
      <tr>
        <th className="border p-2">
          Company
        </th>

        <th className="border p-2">
          Website
        </th>

        <th className="border p-2">
          Address
        </th>

        <th className="border p-2">
          Status
        </th>
      </tr>
    </thead>

    <tbody>
      {filteredCompanies.map(
        (c) => (
          <tr key={c.id}>
            <td className="border p-2">
              {c.company_name}
            </td>

            <td className="border p-2">
              {c.website}
            </td>

            <td className="border p-2">
              {c.address}
            </td>

            <td className="border p-2">
              {c.status}
            </td>
          </tr>
        )
      )}
    </tbody>

  </table>
)}

{showMap &&
  (reportType === "farmer" ||
  reportType === "agent") && (
    <div className="mb-6">
      
      <MapContainer

      key={`${mapCenter[0]}-${mapCenter[1]}`}
      center={mapCenter as [number, number]}
       zoom={
  userLocation
    ? 15
    : filters.union_name
    ? 13
    : filters.upazila
    ? 11
    : filters.district
    ? 10
    : 8
}
        style={{
          height: "500px",
          width: "100%",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectedFarm ? (
  <RecenterMap
    position={selectedFarm}
  />
) : (
  userLocation && (
    <RecenterMap
      position={userLocation}
    />
  )
)}

   {userLocation && (
  <Marker position={userLocation}>
    <Popup maxWidth={300}>
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          width: "260px",
        }}
      >

        <h4
  style={{
    margin: 0,
    fontSize: "15px",
  }}
>
  📍 Your Location
</h4>

<hr
  style={{
    marginTop: "8px",
    marginBottom: "8px",
  }}
/>

        {reportType === "farmer" && (
  <>
    <h3>
      Nearest Farms
    </h3>

    {nearestFarmers.map(
      (f, index) => (
        <div
          key={f.id}
          style={{
            marginBottom: "8px",
          }}
        >
          <button
            onClick={() =>
              setSelectedFarm([
                Number(f.latitude),
                Number(f.longitude),
              ])
            }
            style={{
              color: "blue",
              cursor: "pointer",
              fontWeight: "bold",
              textAlign: "left",
              border: "none",
              background: "none",
              padding: 0,
            }}
          >
            {index + 1}.
            {f.farmer_name}
          </button>

          <br />

          {getDistanceKm(
            userLocation[0],
            userLocation[1],
            Number(f.latitude),
            Number(f.longitude)
          )} km
        </div>
      )
    )}
  </>
)}

{reportType === "agent" && (
  <>
    <h3>
      Nearest Agents
    </h3>

    {nearestAgents.map(
      (a, index) => (
        <div
          key={a.id}
          style={{
            marginBottom: "8px",
          }}
        >
          <button
            onClick={() =>
              setSelectedFarm([
                Number(a.latitude),
                Number(a.longitude),
              ])
            }
            style={{
              color: "green",
              cursor: "pointer",
              fontWeight: "bold",
              textAlign: "left",
              border: "none",
              background: "none",
              padding: 0,
            }}
          >
            {index + 1}.
            {a.agent_name}
          </button>

          <br />

          {getDistanceKm(
            userLocation[0],
            userLocation[1],
            Number(a.latitude),
            Number(a.longitude)
          )} km
        </div>
      )
    )}
  </>
)}

          

      </div>
      
    </Popup>
  </Marker>
)}

        {reportType === "farmer" &&
  filteredFarmers.map(
          (f) =>
            f.latitude &&
            f.longitude && (
              <Marker
              key={f.id}
              icon={createFarmMarker(
  f.companies?.logo_url || "",
  f.farm_type
)}
              position={[
                Number(f.latitude),
                Number(f.longitude),
              ]}
>
                <Popup maxWidth={200}>
  <div
  style={{
    maxHeight: "250px",
    overflowY: "auto",
    width: "240px",
  }}
>

              {f.companies?.logo_url && (
  <img
    src={f.companies.logo_url}
    alt="logo"
    style={{
      width: "60px",
      marginBottom: "10px",
    }}
  />
)}

    <h3 className="font-bold text-lg">
      {f.farmer_name}
    </h3>

    {userLocation && (
  <p>
    <b>Distance:</b>{" "}
    {getDistanceKm(
      userLocation[0],
      userLocation[1],
      Number(f.latitude),
      Number(f.longitude)
    )} km
  </p>
)}

    <hr />

    <p>
      <b>Company:</b>{" "}
      {f.companies?.company_name}
    </p>

    <p>
      <b>Agent:</b>{" "}
      {f.agents?.agent_name}
    </p>

    <p>
      <b>Mobile:</b>{" "}
      {f.mobile}
    </p>

    <p>
      <b>Farm Type:</b>{" "}
      {f.farm_type}
    </p>

    <p>
      <b>Farm Size:</b>{" "}
      {f.farm_size}
    </p>

    <p>
      <b>Feed Type:</b>{" "}
      {f.feed_type}
    </p>

    <p>
      <b>Village:</b>{" "}
      {f.village}
    </p>

    <p>
      <b>Union:</b>{" "}
      {f.union_name}
    </p>

    <p>
      <b>Upazila:</b>{" "}
      {f.upazila}
    </p>

    <p>
      <b>District:</b>{" "}
      {f.district}
    </p>

    <p>
      <b>Status:</b>{" "}
      {f.status}
    </p>


    {f.remarks && (
      <p>
        <b>Remarks:</b>{" "}
        {f.remarks}
      </p>
    )}


    

  </div>
</Popup>
              </Marker>
            )
        )}

        {reportType === "agent" &&
  filteredAgents.map(
    (a) =>
      a.latitude &&
      a.longitude && (
        <Marker
          key={a.id}
          position={[
            Number(a.latitude),
            Number(a.longitude),
          ]}
          icon={createAgentMarker(
  a.companies?.logo_url || ""
)}
          
        >
          <Popup maxWidth={300}>
            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                width: "260px",
              }}
            >
              {a.companies?.logo_url && (
                <img
                  src={
                    a.companies.logo_url
                  }
                  alt="logo"
                  style={{
                    width: "45px",
                    marginBottom: "6px",
                  }}
                />
              )}

              <h3 className="font-bold text-lg">
                {a.agent_name}
              </h3>

              {userLocation && (
              <p>
                <b>Distance:</b>{" "}
                {getDistanceKm(
                  userLocation[0],
                  userLocation[1],
                  Number(a.latitude),
                  Number(a.longitude)
                )} km
              </p>
            )}

              <hr/>
              

              <p>
                <b>Company:</b>{" "}
                {
                  a.companies
                    ?.company_name
                }
              </p>

              <p>
                <b>Proprietor:</b>{" "}
                {a.proprietor}
              </p>

              <p>
                <b>Mobile:</b>{" "}
                {a.mobile}
              </p>

              <p>
                <b>Village:</b>{" "}
                {a.village}
              </p>

              <p>
                <b>Union:</b>{" "}
                {a.union_name}
              </p>

              <p>
                <b>Upazila:</b>{" "}
                {a.upazila}
              </p>

              <p>
                <b>District:</b>{" "}
                {a.district}
              </p>

              <p>
                <b>Monthly Sale:</b>{" "}
                {a.monthly_sale}
              </p>

              <p>
                <b>Focus Item:</b>{" "}
                {a.focus_item}
              </p>

              <p>
                <b>Status:</b>{" "}
                {a.status}
              </p>
                

            </div>
          </Popup>
        </Marker>
      )
  )}

      </MapContainer>

    </div>

)}

{reportType === "agent" && (
  <table className="w-full border mt-4">

    <thead>
      <tr>
        <th className="border p-2">
          Company
        </th>

        <th className="border p-2">
          Agent
        </th>

        <th className="border p-2">
          Mobile
        </th>

        <th className="border p-2">
          District
        </th>

        <th className="border p-2">
          Upazila
        </th>
        <th className="border p-2">
          Union
        </th>


        <th className="border p-2">
          Monthly Sale
        </th>

        <th className="border p-2">
          Status
        </th>
        
      </tr>
    </thead>

    <tbody>
      {filteredAgents.map(
        (a) => (
          <tr key={a.id}>
            <td className="border p-2">
              {a.companies?.company_name}
            </td>

            <td className="border p-2">
              {a.agent_name}
            </td>

            <td className="border p-2">
              {a.mobile}
            </td>

            <td className="border p-2">
              {a.district}
            </td>

            <td className="border p-2">
              {a.upazila}
            </td>

            <td className="border p-2">
           {a.union_name}
          </td>

            <td className="border p-2">
              {a.monthly_sale}
            </td>

            <td className="border p-2">
              {a.status}
            </td>
          </tr>
        )
      )}
    </tbody>

  </table>
)}



    {reportType === "farmer" && (
      <table className="w-full border">

        <thead>

          <tr>

            <th className="border p-2">
              Company
            </th>

            <th className="border p-2">
              Agent
            </th>

            <th className="border p-2">
              Farmer Name
            </th>

            <th className="border p-2">
              Mobile
            </th>

            <th className="border p-2">
              District
            </th>

            <th className="border p-2">
              Upazila
            </th>

            <th className="border p-2">
              Union
            </th>

            <th className="border p-2">
              Farm Type
            </th>

            <th className="border p-2">
              Status
            </th>

          </tr>

        </thead>

        <tbody>

          {filteredFarmers.map(
            (f) => (
              <tr
                key={f.id}
              >

                <td className="border p-2">
                  {
                    f.companies
                      ?.company_name
                  }
                </td>

                <td className="border p-2">
                  {
                    f.agents
                      ?.agent_name
                  }
                </td>

                <td className="border p-2">
                  {
                    f.farmer_name
                  }
                </td>

                <td className="border p-2">
                  {
                    f.mobile
                  }
                </td>

                <td className="border p-2">
                  {
                    f.district
                  }
                </td>

                <td className="border p-2">
                  {
                    f.upazila
                  }
                </td>

                <td className="border p-2">
                  {
                    f.union_name
                  }
                </td>

                <td className="border p-2">
                  {
                    f.farm_type
                  }
                </td>

                <td className="border p-2">
                  {
                    f.status
                  }
                </td>

              </tr>
            )
          )}

        </tbody>

      </table>

      
    )}
    
    </div>
  );
}