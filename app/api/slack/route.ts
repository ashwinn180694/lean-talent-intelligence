import { NextRequest, NextResponse } from 'next/server';
import { postToSlack, tierChangeMessage, candidateAddedMessage } from '@/lib/slack';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, ...params } = body;

  if (type === 'tier_change') {
    await postToSlack(tierChangeMessage(params));
  } else if (type === 'candidate_added') {
    await postToSlack(candidateAddedMessage(params));
  }

  return NextResponse.json({ ok: true });
}
