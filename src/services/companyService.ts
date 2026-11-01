import { supabase } from "../lib/supabase";

export async function getCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("id", { ascending: false });

  if (error) throw error;

  return data;
}

export async function createCompany(company: any) {
  let logoUrl = null;

  if (company.logo) {
    const fileName = `${Date.now()}-${company.logo.name}`;

    const { error: uploadError } = await supabase.storage
      .from("company-logos")
      .upload(fileName, company.logo);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("company-logos")
      .getPublicUrl(fileName);

    logoUrl = publicUrlData.publicUrl;
  }

  const { data, error } = await supabase
    .from("companies")
    .insert([
      {
        company_name: company.company_name,
        phone: company.phone || "",
        email: company.email || "",
        website: company.website,
        address: company.address,
        status: company.status,
        logo_url: logoUrl,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}

export async function updateCompany(id: number, company: any) {
  let updateData: any = {
    company_name: company.company_name,
    phone: company.phone || "",
    email: company.email || "",
    website: company.website,
    address: company.address,
    status: company.status,
  };

  if (company.logo) {
    const fileName = `${Date.now()}-${company.logo.name}`;

    const { error: uploadError } = await supabase.storage
      .from("company-logos")
      .upload(fileName, company.logo);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("company-logos")
      .getPublicUrl(fileName);

    updateData.logo_url = publicUrlData.publicUrl;
  }

  const { data, error } = await supabase
    .from("companies")
    .update(updateData)
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;
}

export async function deleteCompany(id: number) {
  const { error } = await supabase.from("companies").delete().eq("id", id);

  if (error) throw error;
}