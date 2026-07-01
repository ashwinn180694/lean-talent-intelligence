import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `You are a talent intelligence assistant for Lean Technologies, a fintech infrastructure company operating across MENA and globally.

You have access to Lean's curated universe of fintech companies — these are target companies for talent sourcing and competitive intelligence.

Your job:
- Answer questions about companies in the universe (tiers, sectors, regions, funding, headcount, fit scores)
- Help identify the best companies to source talent from for a given role or function
- Highlight patterns, gaps, or trends across the portfolio
- Generate concise company briefings on request

Rules:
- Only reference companies that appear in the data provided. Never invent companies.
- Be concise. Use bullet points for lists of companies.
- When listing companies, include their tier and fit score where relevant.
- Fit score is out of 10. Score ≥8 is high-fit, ≥6 is good, <6 is low.
- Priority tiers: Tier 1 = strategic priority, Tier 2 = active watch, Tier 3 = monitor.
- When asked about a specific role or function, recommend companies where that function appears in recommended_functions, or where the sector aligns.

Today's date: ${new Date().toISOString().split('T')[0]}`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured. Add it to your Netlify environment variables.' }, { status: 500 });
    }

    // Auth check
    const supabase = createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { messages } = body;
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Fetch company data
    const { data: companies, error: dbError } = await supabase
      .from('companies')
      .select('name, priority_tier, sub_sector, region, country, hq_country, lean_fit_score, recommended_functions, headcount_range, funding_stage, total_raised, founded_year, headquarters, rationale')
      .order('lean_fit_score', { ascending: false });

    if (dbError) {
      console.error('DB error:', dbError);
      return NextResponse.json({ error: 'Failed to load company data' }, { status: 500 });
    }

    const companyContext = (companies || []).map(c => ({
      name: c.name,
      tier: c.priority_tier,
      sector: c.sub_sector,
      region: c.region,
      country: c.hq_country || c.country,
      fit: c.lean_fit_score,
      functions: c.recommended_functions,
      headcount: c.headcount_range,
      stage: c.funding_stage,
      raised: c.total_raised,
      founded: c.founded_year,
      hq: c.headquarters,
      rationale: c.rationale,
    }));

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `${SYSTEM_PROMPT}\n\nCOMPANY UNIVERSE (${companyContext.length} companies):\n${JSON.stringify(companyContext)}`,
        },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.4,
      stream: false,
    });

    const reply = completion.choices[0]?.message?.content || 'No response generated.';
    return NextResponse.json({ reply });

  } catch (err: unknown) {
    console.error('Chat API error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
