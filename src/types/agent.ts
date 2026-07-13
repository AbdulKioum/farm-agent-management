export interface Agent {
  id?: number;

  company_id: number;

  agent_name: string;
  proprietor: string;

  mobile: string;

  address: string;
  village: string;
  union_name: string;
  upazila: string;
  district: string;

  monthly_sale: number;

  focus_item: string;

  latitude: number | null;
  longitude: number | null;

  status: string;
}