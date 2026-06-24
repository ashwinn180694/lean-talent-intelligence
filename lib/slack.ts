const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

type SlackPayload = {
  text?: string;
  blocks?: object[];
};

export async function postToSlack(payload: SlackPayload) {
  if (!WEBHOOK_URL) return; // Silently skip if not configured
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
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Tier change* — <${companyUrl}|${companyName}>\n${oldTier ? `${tierEmoji[oldTier] || '⚫'} ${oldTier}` : '_(unranked)_'} → ${tierEmoji[newTier] || '⚫'} *${newTier}*`,
        },
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `Changed by ${changerEmail.split('@')[0]}` }],
      },
    ],
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
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*New candidate tracked* — <${companyUrl}|${companyName}>\n*${candidateName}*${role ? ` · ${role}` : ''} · Stage: ${stage}`,
        },
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `Added by ${addedBy.split('@')[0]}` }],
      },
    ],
  };
}
