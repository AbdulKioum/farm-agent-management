import { supabase } from "../lib/supabase";

export interface UserData {
  id?: string;
  email: string;
  password?: string;
  name?: string;
  full_name?: string;
  role: string;
  status?: string;
}

// 1. Fetch all users from public.users table
export const getUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

// 2. Create User via Edge Function
export const createUser = async (userData: UserData) => {
  const { data, error } = await supabase.functions.invoke("manage-users", {
    body: { action: "CREATE", userData },
  });

  if (data?.error) {
    throw new Error(data.error);
  }

  if (error) {
    try {
      const errRes = await error.context.json();
      if (errRes?.error) throw new Error(errRes.error);
    } catch {
      // Fallback if context JSON parsing fails
    }
    throw new Error(error.message || "Failed to create user");
  }

  return data;
};

// 3. Update User via Edge Function
export const updateUser = async (userId: string, userData: Partial<UserData>) => {
  const { data, error } = await supabase.functions.invoke("manage-users", {
    body: { action: "UPDATE", userId, userData },
  });

  if (data?.error) {
    throw new Error(data.error);
  }

  if (error) {
    try {
      const errRes = await error.context.json();
      if (errRes?.error) throw new Error(errRes.error);
    } catch {
      // Fallback
    }
    throw new Error(error.message || "Failed to update user");
  }

  return data;
};

// Alias export for backward compatibility with components using 'updateUserRole'
export { updateUser as updateUserRole };

// 4. Delete User via Edge Function
export const deleteUser = async (userId: string) => {
  const { data, error } = await supabase.functions.invoke("manage-users", {
    body: { 
      action: "DELETE", 
      userId: userId,
      userData: { id: userId } // Backup payload
    },
  });

  if (data?.error) {
    throw new Error(data.error);
  }

  if (error) {
    try {
      const errRes = await error.context.json();
      if (errRes?.error) throw new Error(errRes.error);
    } catch {
      // Fallback
    }
    throw new Error(error.message || "Failed to delete user");
  }

  return data;
};