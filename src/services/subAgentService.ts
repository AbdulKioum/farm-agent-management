import { supabase } from "../lib/supabase";

export async function getSubAgents() {
  const { data, error } = await supabase
    .from("sub_agents")
    .select("*, companies(company_name, logo_url), agents(agent_name)")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching sub-agents:", error);
    return [];
  }
  return data;
}

export async function createSubAgent(payload: any) {
  const { data, error } = await supabase
    .from("sub_agents")
    .insert([payload])
    .select();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSubAgent(id: number, payload: any) {
  const { data, error } = await supabase
    .from("sub_agents")
    .update(payload)
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSubAgent(id: number) {
  const { error } = await supabase
    .from("sub_agents")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}