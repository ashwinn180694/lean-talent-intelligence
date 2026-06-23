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
  source_url?: string | null;
  data_sources?: string[] | null;
  awesomefintech_categories?: string | null;
  awesomefintech_rank?: string | null;
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
  owner_email: string | null;
  notes?: string | null;
  cv_summary?: string | null;
  relationship_score?: number | null;
  warmth_level?: string | null;
  tags?: string[] | null;
  next_follow_up_at?: string | null;
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

export type TalentPool = {
  id: string;
  name: string;
  description: string | null;
};
