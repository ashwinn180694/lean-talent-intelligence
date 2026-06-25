import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createSupabaseServer } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const { companyId } = await req.json();
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  // Auth check
  const supabase = createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch company
  const { data: company } = await supabase
    .from('companies')
    .select('name,sub_sector,region,country,priority_tier,lean_fit_score,description,website_url,founded_year,headcount_range,funding_stage,total_raised,key_investors,recommended_functions')
    .eq('id', companyId)
    .single();

  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  // Check if summary already exists and is recent (< 30 days)
  const { data: existing } = await supabase
    .from('companies')
    .select('ai_summary, ai_summary_at')
    .eq('id', companyId)
    .single();

  if (existing?.ai_summary && existing?.ai_summary_at) {
    const age = Date.now() - new Date(existing.ai_summary_at).getTime();
    if (age < 30 * 24 * 60 * 60 * 1000) {
      return NextResponse.json({ summary: existing.ai_summary, cached: true });
    }
  }

  // Generate with Claude
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Write a concise 2-sentence talent intelligence brief about ${company.name}, a ${company.sub_sector || 'fintech'} company${company.region ? ` based in ${company.region}` : ''}${company.country ? ` (${company.country})` : ''}.

Context:
- Category: ${company.sub_sector || 'Fintech'}
- Tier: ${company.priority_tier || 'Unknown'}
- Lean fit score: ${company.lean_fit_score || 'N/A'}/10
- Headcount: ${company.headcount_range || 'Unknown'}
- Funding stage: ${company.funding_stage || 'Unknown'}
- Total raised: ${company.total_raised || 'Unknown'}
- Key investors: ${company.key_investors || 'Unknown'}
- Founded: ${company.founded_year || 'Unknown'}
- Relevant functions for Lean: ${company.recommended_functions || 'Unknown'}
${company.description ? `- Description: ${company.description}` : ''}

Write 2 punchy sentences covering: what the company does and why it's relevant for Lean's talent sourcing. Focus on talent opportunity, not investment advice. No markdown, plain text only.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  });

  const summary = (message.content[0] as { type: string; text: string }).text.trim();

  // Save to DB
  await supabase
    .from('companies')
    .update({ ai_summary: summary, ai_summary_at: new Date().toISOString() })
    .eq('id', companyId);

  return NextResponse.json({ summary, cached: false });
}
