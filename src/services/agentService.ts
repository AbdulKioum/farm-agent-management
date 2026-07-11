import { supabase } from "../lib/supabase";
import type { Agent } from "../types/agent";

export async function getAgents() {
  const { data, error } = await supabase
    .from("agents")
    .select(
      `
      *,
      companies (
        company_name,
        logo_url
      )
    `
    )
    .order("id", { ascending: false });

  if (error) throw error;

  return data;
}

export async function createAgent(
  agent: Agent
) {
  console.log(
    "AGENT DATA:",
    agent
  );

  const { data, error } = await supabase
    .from("agents")
    .insert([agent])
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

export async function deleteAgent(
  id: number
) {
  const { error } = await supabase
    .from("agents")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function updateAgent(
  id: number,
  agent: any
) {
  const { data, error } =
    await supabase
      .from("agents")
      .update(agent)
      .eq("id", id)
      .select();

  if (error) throw error;

  return data;
}