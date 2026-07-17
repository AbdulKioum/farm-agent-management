export interface Agent {
  id?: number;

  company_id: number;

  agent_name: string;
  proprietor: string;

  mobile: string;

  bazar: string;

  union_name: string;
  upazila: string;
  district: string;

  broiler_sale: number;
  layer_sale: number;
  sonali_sale: number;
  cattle_sale: number;
  fish_sale: number;

  monthly_sale: number;

  focus_item: string;

  latitude: number | null;
  longitude: number | null;

  status: string;
}