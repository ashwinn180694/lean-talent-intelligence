import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import Groq from 'groq-sdk';

type Company = {
  name: string;
  priority_tier: string | null;
  sub_sector: string | null;
  region: string | null;
  hq_country: string | null;
  country: string | null;
  lean_fit_score: number | null;
  recommended_functions: string | null;
  headcount_range: string | null;
  funding_stage: string | null;
  total_raised: string | null;
  founded_year: number | null;
};

// Keyword-based pre-filter — only send relevant companies to Groq
function filterRelevant(companies: Company[], question: string): Company[] {
  const q = question.toLowerCase();

  let pool = [...companies];

  // Tier filter
  const tierMatch = q.match(/tier\s*([123])/);
  if (tierMatch) pool = pool.filter(c => c.priority_tier === `Tier ${tierMatch[1]}`);

  // Sector filter
  const sectors: Record<string, string[]> = {
    'Payments':               ['payment'],
    'Crypto / Digital Assets':['crypto','blockchain','defi','web3','digital asset'],
    'Stablecoin':             ['stablecoin','stable coin'],
    'Neobank':                ['neobank','neo bank','digital bank'],
    'Remittance':             ['remittance','money transfer','cross-border'],
    'RegTech':                ['regtech','compliance','kyc','aml'],
    'Open Banking':           ['open banking'],
    'Lending':                ['lending','credit','loan'],
    'Insurance':              ['insurance','insurtech'],
    'WealthTech':             ['wealth','wealthtech'],
    'BaaS':                   ['baas','banking as a service'],
  };
  for (const [sector, kws] of Object.entries(sectors)) {
    if (kws.some(k => q.includes(k))) {
      const match = pool.filter(c => c.sub_sector === sector);
      if (match.length >= 3) { pool = match; break; }
    }
  }

  // Country / region filter
  const geoMap: Record<string, string[]> = {
    'UAE':          ['uae','dubai','abu dhabi'],
    'Saudi Arabia': ['saudi','ksa','riyadh'],
    'GCC':          ['gcc','gulf'],
    'UK':           ['uk','london','britain'],
    'USA':          ['usa','united states',' us '],
    'Singapore':    ['singapore'],
    'Egypt':        ['egypt','cairo'],
    'India':        ['india'],
    'France':       ['france','paris'],
    'Germany':      ['germany'],
  };
  for (const [geo, kws] of Object.entries(geoMap)) {
    if (kws.some(k => q.includes(k))) {
      const match = pool.filter(c =>
        (c.hq_country || c.country || '').toLowerCase().includes(geo.toLowerCase()) ||
        (c.region || '').toLowerCase().includes(geo.toLowerCase())
      );
      if (match.length >= 3) { pool = match; break; }
    }
  }

  // Fit score filter
  const fitMatch = q.match(/fit\s*(?:score\s*)?[≥>=]+\s*(\d+)/);
  if (fitMatch) {
    const min = parseFloat(fitMatch[1]);
    const match = pool.filter(c => (c.lean_fit_score || 0) >= min);
    if (match.length >= 3) pool = match;
  }

  // Stage filter
  if (q.includes('series a')) pool = pool.filter(c => c.funding_stage?.toLowerCase().includes('series a'));
  else if (q.includes('series b')) pool = pool.filter(c => c.funding_stage?.toLowerCase().includes('series b'));
  else if (q.includes('series c')) pool = pool.filter(c => c.funding_stage?.toLowerCase().includes('series c'));
  else if (/\bpublic\b|ipo/.test(q)) pool = pool.filter(c => c.funding_stage?.toLowerCase().includes('public'));

  // Named company — include it regardless
  const named = companies.filter(c => q.includes(c.name.toLowerCase()));
  const nameSet = new Set(named.map(c => c.name));
  pool = [...named, ...pool.filter(c => !nameSet.has(c.name))];

  // If too few results, broaden to top 60 by fit
  if (pool.length < 8) pool = companies.slice(0, 60);

  // Hard cap at 70 companies (~2k tokens)
  return pool.slice(0, 70);
}

const SYSTEM_PROMPT = `You are a talent intelligence assistant for Lean Technologies (fintech infra, MENA + global).
You have a curated universe of target companies for talent sourcing.
Rules:
- Only reference companies in the data. Never invent companies.
- Be concise. Use bullet points for lists.
- Fit score /10: ≥8 high-fit, ≥6 good, <6 low.
- Tiers: 1=strategic, 2=active watch, 3=monitor.
- CSV fields: name,tier,sector,region,country,fit,headcount,stage,raised,functions`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured in environment variables.' }, { status: 500 });
    }

    const supabase = createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { data: companies, error: dbError } = await supabase
      .from('companies')
      .select('name,priority_tier,sub_sector,region,hq_country,country,lean_fit_score,recommended_functions,headcount_range,funding_stage,total_raised,founded_year')
      .order('lean_fit_score', { ascending: false });

    if (dbError) return NextResponse.json({ error: 'Failed to load company data' }, { status: 500 });

    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')?.content || '';
    const relevant = filterRelevant((companies || []) as Company[], lastUserMsg);

    const csvRows = relevant.map(c => [
      c.name,
      c.priority_tier || '',
      c.sub_sector || '',
      c.region || '',
      c.hq_country || c.country || '',
      c.lean_fit_score ?? '',
      c.headcount_range || '',
      c.funding_stage || '',
      c.total_raised || '',
      (c.recommended_functions || '').replace(/,/g, ';'),
    ].join(','));

    const context = `name,tier,sector,region,country,fit,headcount,stage,raised,functions\n${csvRows.join('\n')}`;

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nDATA (${relevant.length} companies):\n${context}` },
        ...messages,
      ],
      max_tokens: 800,
      temperature: 0.4,
      stream: false,
    });

    const reply = completion.choices[0]?.message?.content || 'No response generated.';
    return NextResponse.json({ reply });

  } catch (err: unknown) {
    console.error('Chat error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
