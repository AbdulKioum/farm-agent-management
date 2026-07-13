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

export default function AgentsPage() {
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
    address: "",
    village: "",
    union_name: "",
    upazila: "",
    district: "",
    monthly_sale: "0",
    focus_item: "",
    latitude: "",
    longitude: "",
    status: "Active",
  });

  async function loadData() {
    const agentData = await getAgents();
    setAgents(agentData || []);

    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("company_name");

    setCompanies(data || []);
  }

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

    setEditingId(null);

    setForm({
      company_id: "",
      agent_name: "",
      proprietor: "",
      mobile: "",
      address: "",
      village: "",
      union_name: "",
      upazila: "",
      district: "",
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Agent Management
      </h1>

      <div className="border rounded p-4 mb-6">

        <select
          value={form.company_id}
          onChange={(e) =>
            setForm({
              ...form,
              company_id:
                e.target.value,
            })
          }
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
          className="border p-2 w-full mb-2"
        />

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
          value={form.union_name}
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

        <input
          type="number"
          placeholder="Monthly Sale"
          value={form.monthly_sale}
          onChange={(e) =>
            setForm({
              ...form,
              monthly_sale:
                e.target.value,
            })
          }
          className="border p-2 w-full mb-2"
        />

        <select
          value={form.focus_item}
          onChange={(e) =>
            setForm({
              ...form,
              focus_item:
                e.target.value,
            })
          }
          className="border p-2 w-full mb-2"
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

        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save Agent
        </button>

      </div>

      <input
        type="text"
        placeholder="Search Agent..."
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
              Mobile
            </th>

            <th className="border p-2">
              District
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
          {agents
            .filter((agent) =>
              agent.agent_name
                ?.toLowerCase()
                .includes(
                  search.toLowerCase()
                )
            )
            .map((agent) => (
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
                  {agent.district}
                </td>

                <td className="border p-2">
                  {agent.status}
                </td>

                <td className="border p-2">
                  <button
  onClick={() => {
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

      address:
        agent.address ||
        "",

      village:
        agent.village ||
        "",

      union_name:
        agent.union_name ||
        "",

      upazila:
        agent.upazila ||
        "",

      district:
        agent.district ||
        "",

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
                    onClick={() =>
                      setSelectedAgent(
                        agent
                      )
                    }
                    className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
                  >
                    View
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

      {selectedAgent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

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
              <p><b>Address:</b> {selectedAgent.address}</p>
              <p><b>Village:</b> {selectedAgent.village}</p>
              <p><b>Union:</b> {selectedAgent.union_name}</p>
              <p><b>Upazila:</b> {selectedAgent.upazila}</p>
              <p><b>District:</b> {selectedAgent.district}</p>
              <p><b>Monthly Sale:</b> {selectedAgent.monthly_sale}</p>
              <p><b>Focus Item:</b> {selectedAgent.focus_item}</p>
              <p><b>Latitude:</b> {selectedAgent.latitude}</p>
              <p><b>Longitude:</b> {selectedAgent.longitude}</p>
              <p><b>Status:</b> {selectedAgent.status}</p>

            </div>

          </div>

        </div>
      )}

      {showMap && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white p-4 rounded w-[900px]">

      <div className="flex justify-between mb-3">

        <h2 className="font-bold text-xl">
          Select Agent Location
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

          setShowMap(false);
        }}
      />

    </div>

  </div>
)}
    </div>
  );
}