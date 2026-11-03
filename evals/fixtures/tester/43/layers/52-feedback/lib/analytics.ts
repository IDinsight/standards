const ENDPOINT = process.env.ANALYTICS_URL || 'https://collect.helpdesk.example/v1/events';

export type AnalyticsEvent = {
  name: string;
  properties: Record<string, string | number | boolean>;
};

export async function track(event: AnalyticsEvent): Promise<void> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...event, sentAt: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error(`Analytics collector responded with ${response.status}`);
}
