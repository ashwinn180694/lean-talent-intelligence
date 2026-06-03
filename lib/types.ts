export type Company = {
  id: string;
  name: string;
  sector: string | null;
  sub_sector: string | null;
  priority_tier: string | null;
  lean_fit_score: number | null;
  region: string | null;
  country: string | null;
  hq: string | null;
  website_url: string | null;
  linkedin_company_url: string | null;
  recommended_functions: string | null;
  rationale: string | null;
};
export type Candidate = {
  id: string;
  full_name: string;
  title: string | null;
  company_id: string | null;
  company_name?: string | null;
  location: string | null;
  function_area: string | null;
  seniority: string | null;
  linkedin_url: string | null;
  status: string | null;
  owner_email: string | null;
};
