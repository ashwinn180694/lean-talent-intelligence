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
  careers_url: string | null;
  crunchbase_url?: string | null;
  recommended_functions: string | null;
  rationale: string | null;
  source?: string | null;
  updated_at?: string | null;
};

export type Candidate = {
  id: string;
  full_name: string;
  title: string | null;
  company_id: string | null;
  company_name?: string | null;
  location: string | null;
  country?: string | null;
  function_area: string | null;
  seniority: string | null;
  linkedin_url: string | null;
  status: string | null;
  owner_id?: string | null;
  owner_email: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CompanyNote = {
  id: string;
  company_id: string;
  note: string;
  owner_email: string | null;
  created_at: string;
};

export type ActivityFeedItem = {
  id: string;
  actor_email: string | null;
  action: string;
  entity_type: string | null;
  entity_name: string | null;
  created_at: string;
};
