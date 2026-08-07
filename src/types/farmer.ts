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

  // New Category
  farm_category: string;

  // Poultry
  broiler: number;
  layer: number;
  sonali: number;
  duck: number;
  quail: number;
  deshi_chicken: number;

  // Cattle
  dairy_cow: number;
  bull: number;
  calf_heifer: number;

  // Fish
  pangus: number;
  tilapia: number;
  koi: number;
  shing: number;
  pabda: number;
  gulsha: number;
  magur: number;
  carp: number;
  golda: number;
  bagda: number;
  tengra: number;

  feed_type: string;

  latitude?: number | null;
  longitude?: number | null;

  status: string;
  remarks: string;
}