import { articles } from '../articles-data.ts';
import type { ProviderMessage } from '../llm/client.ts';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

const MAX_TURNS = 12;

export function systemPrompt(): string {
  const topics = articles.map((article) => `- ${article.title}: ${article.summary}`).join('\n');
  return [
    'You are the Helpdesk assistant on the Helpdesk help center.',
    'Answer questions about using Helpdesk in plain language and keep answers short.',
    'If you are not sure, say so and point the visitor to a help article or to support@helpdesk.example.',
    'Help articles:',
    topics,
  ].join('\n');
}

export function buildMessages(history: ChatTurn[]): ProviderMessage[] {
  return [{ role: 'system', content: systemPrompt() }, ...history.slice(-MAX_TURNS)];
}
