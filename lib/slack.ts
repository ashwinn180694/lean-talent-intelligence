const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Supports both Slack Workflow Builder webhooks and standard incoming webhooks
export async function postToSlack(payload: { text: string }) {
  if (!WEBHOOK_URL) return;
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('Slack webhook failed:', e);
  }
}

export function tierChangeMessage(params: {
  companyName: string;
  oldTier: string | null;
  newTier: string;
  changerEmail: string;
  companyUrl: string;
}) {
  const { companyName, oldTier, newTier, changerEmail, companyUrl } = params;
  const tierEmoji: Record<string, string> = { 'Tier 1': '🟢', 'Tier 2': '🔵', 'Tier 3': '⚫' };
  const from = oldTier ? `${tierEmoji[oldTier] || '⚫'} ${oldTier}` : 'Unranked';
  const to = `${tierEmoji[newTier] || '⚫'} ${newTier}`;
  return {
    text: `📊 *Tier change* — ${companyName}\n${from} → ${to}\nChanged by ${changerEmail.split('@')[0]}\n${companyUrl}`,
  };
}

export function candidateAddedMessage(params: {
  candidateName: string;
  companyName: string;
  role: string | null;
  stage: string;
  addedBy: string;
  companyUrl: string;
}) {
  const { candidateName, companyName, role, stage, addedBy, companyUrl } = params;
  return {
    text: `👤 *New candidate tracked* — ${companyName}\n${candidateName}${role ? ` · ${role}` : ''} · Stage: ${stage}\nAdded by ${addedBy.split('@')[0]}\n${companyUrl}`,
  };
}
