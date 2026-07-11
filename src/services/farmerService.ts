import { supabase } from "../lib/supabase";
import type { Farmer } from "../types/farmer";

export async function getFarmers() {
  const { data, error } = await supabase
    .from("farmers")
    .select(
      `
      *,
      companies(company_name),
      agents(agent_name)
    `
    )
    .order("id", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function createFarmer(
  farmer: Farmer
) {
  const { data, error } =
    await supabase
      .from("farmers")
      .insert([farmer])
      .select();

  if (error) throw error;

  return data;
}

export async function updateFarmer(
  id: number,
  farmer: Farmer
) {
  const { data, error } =
    await supabase
      .from("farmers")
      .update(farmer)
      .eq("id", id)
      .select();

  if (error) throw error;

  return data;
}

export async function deleteFarmer(
  id: number
) {
  const { error } =
    await supabase
      .from("farmers")
      .delete()
      .eq("id", id);

  if (error) throw error;
}