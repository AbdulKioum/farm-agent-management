export interface Company {
  id?: number;

  company_name: string;
  address: string;
  website: string;
  status: string;

  regional_manager?: string;
  area_manager?: string;
  mobile?: string;
  email?: string;
}