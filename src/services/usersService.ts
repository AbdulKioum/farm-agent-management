import { supabase } from "../lib/supabase";

export async function getUsers() {
  const { data, error } =
    await supabase
      .from("users")
      .select("*")
      .order("id", {
        ascending: false,
      });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function updateUserRole(
  id: number,
  role: string
) {
  const { error } =
    await supabase
      .from("users")
      .update({ role })
      .eq("id", id);

  if (error)
    console.error(error);
}

export async function updateUserStatus(
  id: number,
  status: string
) {
  const { error } =
    await supabase
      .from("users")
      .update({ status })
      .eq("id", id);

  if (error)
    console.error(error);
}