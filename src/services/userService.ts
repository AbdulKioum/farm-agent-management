import { supabase } from "../lib/supabase";

export async function getUserRole(
  email: string
) {
  const { data, error } =
    await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}