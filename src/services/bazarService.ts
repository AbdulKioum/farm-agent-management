import { supabase } from "../lib/supabase";

export async function getBazars() {
  const { data, error } =
    await supabase
      .from("bazars")
      .select("*");

  if (error) throw error;

  return data;
}