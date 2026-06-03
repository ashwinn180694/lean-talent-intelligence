import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Missing Supabase env vars');

const supabase = createClient(url, key);
const csv = fs.readFileSync(path.join(process.cwd(), 'data', 'lean_150_company_universe.csv'), 'utf8');
const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });

const rows = parsed.data.map((r) => ({
  name: r.company_name || r.name,
  sector: r.sector || r.category || '',
  sub_sector: r.sub_sector || r.category || '',
  priority_tier: r.priority_tier || r.tier || '',
  lean_fit_score: Number(r.lean_fit_score || r.fit_score || r.fit || 7),
  region: r.region || '',
  country: r.country || '',
  hq: r.hq || r.headquarters || '',
  website_url: r.website_url || r.website || '',
  linkedin_company_url: r.linkedin_company_url || r.linkedin_url || r.linkedin || '',
  careers_url: r.careers_url || '',
  recommended_functions: r.recommended_functions || r.functions || '',
  rationale: r.rationale || r.notes || '',
  source: 'Lean 150 universe v1'
})).filter(r => r.name);

const { error } = await supabase.from('companies').upsert(rows, { onConflict: 'name' });
if (error) throw error;
console.log(`Seeded ${rows.length} companies`);
