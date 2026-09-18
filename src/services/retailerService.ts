import { supabase } from "../lib/supabase";

export async function getRetailers() {
  const { data, error } = await supabase
    .from("retailers")
    .select(`
      *,
      companies (id, company_name, logo_url),
      agents (id, agent_name)
    `)
    .order("retailer_name", { ascending: true });

  if (error) {
    console.error("Error fetching retailers:", error);
    return [];
  }
  return data;
}

export async function createRetailer(payload: any) {
  const { data, error } = await supabase
    .from("retailers")
    .insert([payload])
    .select();

  if (error) throw error;
  return data;
}

export async function updateRetailer(id: number, payload: any) {
  const { data, error } = await supabase
    .from("retailers")
    .update(payload)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}

export async function deleteRetailer(id: number) {
  const { error } = await supabase
    .from("retailers")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}