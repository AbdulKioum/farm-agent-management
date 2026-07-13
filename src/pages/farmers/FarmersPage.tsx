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
      district: "",

      farm_type: "",
      farm_size: "",

      feed_type: "",

      latitude: "",
      longitude: "",

      status: "Active",

      remarks: "",
    });

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
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave() {
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
      district: "",

      farm_type: "",
      farm_size: "",

      feed_type: "",

      latitude: "",
      longitude: "",

      status: "Active",

      remarks: "",
    });

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

  return (
    <div className="p-4">

      <h1 className="text-2xl font-bold mb-4">
        Farmer Management
      </h1>

      <div className="border p-4 rounded mb-4">

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
          className="border p-2 w-full mb-2"
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

        <select
          value={form.agent_id}
          onChange={(e) =>
            setForm({
              ...form,
              agent_id:
                e.target.value,
            })
          }
          className="border p-2 w-full mb-2"
        >
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
          className="border p-2 w-full mb-2"
        />

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
          className="border p-2 w-full mb-2"
        />

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
          className="border p-2 w-full mb-2"
        />

        <input
          placeholder="Union"
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
          className="border p-2 w-full mb-2"
        />

        <input
          placeholder="Upazila"
          value={form.upazila}
          onChange={(e) =>
            setForm({
              ...form,
              upazila:
                e.target.value,
            })
          }
          className="border p-2 w-full mb-2"
        />

        <input
          placeholder="District"
          value={form.district}
          onChange={(e) =>
            setForm({
              ...form,
              district:
                e.target.value,
            })
          }
          className="border p-2 w-full mb-2"
        />

          <button
  type="button"
  onClick={() =>
    setShowMap(true)
  }
  className="bg-blue-600 text-white px-4 py-2 rounded mb-3"
>
  Select From Map
</button>

{form.latitude &&
  form.longitude && (
    <div className="mb-3 text-green-700 font-semibold">
      📍 Location Selected
    </div>
)}

        <select
          value={form.farm_type}
          onChange={(e) =>
            setForm({
              ...form,
              farm_type:
                e.target.value,
            })
          }
          className="border p-2 w-full mb-2"
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
          className="border p-2 w-full mb-2"
        />

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
          className="border p-2 w-full mb-2"
        />

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
          className="border p-2 w-full mb-2"
        />

        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {editingId
            ? "Update Farmer"
            : "Save Farmer"}
        </button>

      </div>

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
              Farmer
            </th>

            <th className="border p-2">
              Mobile
            </th>

            <th className="border p-2">
              Farm Type
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
            .filter((f) =>
              f.farmer_name
                ?.toLowerCase()
                .includes(
                  search.toLowerCase()
                )
            )
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