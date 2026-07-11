export interface Farmer {
  id?: number;

  company_id: number;

  agent_id: number;

  farmer_name: string;

  mobile: string;

  village: string;

  union_name: string;

  upazila: string;

  district: string;

  farm_type: string;

  farm_size: string;

  feed_type: string;

  latitude?: number | null;

  longitude?: number | null;

  status: string;

  remarks: string;
}