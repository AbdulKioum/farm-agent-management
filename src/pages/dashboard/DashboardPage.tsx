import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const [stats, setStats] =
    useState({
      companies: 0,
      agents: 0,
      farmers: 0,
      activeFarmers: 0,
    });
const [districtStats,
  setDistrictStats] =
  useState<any[]>([]);
  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {

    const { count: companies } =
      await supabase
        .from("companies")
        .select("*", {
          count: "exact",
          head: true,
        });

    const { count: agents } =
      await supabase
        .from("agents")
        .select("*", {
          count: "exact",
          head: true,
        });

    const { count: farmers } =
      await supabase
        .from("farmers")
        .select("*", {
          count: "exact",
          head: true,
        });

    const {
      count: activeFarmers,
    } = await supabase
      .from("farmers")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "Active");

    setStats({
      companies:
        companies || 0,
      agents:
        agents || 0,
      farmers:
        farmers || 0,
      activeFarmers:
        activeFarmers || 0,
    });

    const { data: farmersData } =
  await supabase
    .from("farmers")
    .select("district");

const districtMap: any = {};

farmersData?.forEach(
  (f) => {
    if (!f.district) return;

    districtMap[
      f.district
    ] =
      (districtMap[
        f.district
      ] || 0) + 1;
  }
);

const districtArray =
  Object.entries(
    districtMap
  )
    .map(
      ([district, count]) => ({
        district,
        count,
      })
    )
    .sort(
      (a: any, b: any) =>
        b.count - a.count
    );

setDistrictStats(
  districtArray
);
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid md:grid-cols-4 gap-4">

        <div className="border rounded p-4 shadow">
          <h3 className="text-gray-500">
            Total Companies
          </h3>

          <p className="text-3xl font-bold">
            {stats.companies}
          </p>
        </div>

        <div className="border rounded p-4 shadow">
          <h3 className="text-gray-500">
            Total Agents
          </h3>

          <p className="text-3xl font-bold">
            {stats.agents}
          </p>
        </div>

        <div className="border rounded p-4 shadow">
          <h3 className="text-gray-500">
            Total Farmers
          </h3>

          <p className="text-3xl font-bold">
            {stats.farmers}
          </p>
        </div>

        <div className="border rounded p-4 shadow">
          <h3 className="text-gray-500">
            Active Farmers
          </h3>

          <p className="text-3xl font-bold">
            {stats.activeFarmers}
          </p>
        </div>
        <div className="mt-8">

  <h2 className="text-xl font-bold mb-4">
    Farmers by District
  </h2>

  <table className="w-full border">

    <thead>
      <tr>
        <th className="border p-2">
          District
        </th>

        <th className="border p-2">
          Farmers
        </th>
      </tr>
    </thead>

    <tbody>

      {districtStats.map(
        (item) => (
          <tr
            key={
              item.district
            }
          >
            <td className="border p-2">
              {
                item.district
              }
            </td>

            <td className="border p-2">
              {item.count}
            </td>
          </tr>
        )
      )}

    </tbody>

  </table>

</div>

      </div>
    </div>

    
  );
  

  
}