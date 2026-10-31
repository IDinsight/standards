'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import type { ChatEvent } from '../../lib/chat/reply.ts';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  status?: 'streaming' | 'done' | 'truncated' | 'error';
};

const UNAVAILABLE = 'The assistant is unavailable right now. Please try again later.';

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  function apply(event: ChatEvent) {
    setMessages((current) => {
      const last = current.at(-1);
      if (!last || last.role !== 'assistant') return current;
      let updated: Message;
      if (event.type === 'delta') updated = { ...last, content: last.content + event.text };
      else if (event.type === 'replace') updated = { ...last, content: event.text };
      else if (event.type === 'end') updated = { ...last, status: event.reason === 'truncated' ? 'truncated' : 'done' };
      else updated = { ...last, content: event.message, status: 'error' };
      return [...current.slice(0, -1), updated];
    });
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || busy) return;
    const history = messages
      .filter((message) => message.status !== 'error' && message.content)
      .map(({ role, content: text }) => ({ role, content: text }));
    setMessages([...messages, { role: 'user', content }, { role: 'assistant', content: '', status: 'streaming' }]);
    setDraft('');
    setBusy(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: [...history, { role: 'user', content }] }),
      });
      if (!response.ok || !response.body) throw new Error(`Chat request failed with ${response.status}`);
      await readEvents(response.body, apply);
    } catch {
      apply({ type: 'error', message: UNAVAILABLE });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="chat" aria-label="Assistant chat">
      <ol className="chat-log" aria-live="polite">
        {messages.map((message, index) => (
          <li key={index} className={`chat-message chat-${message.role}`} data-status={message.status}>
            {message.content || (message.status === 'streaming' ? '…' : '')}
            {message.status === 'truncated' ? <p className="chat-note">This reply was cut short.</p> : null}
          </li>
        ))}
      </ol>
      <form onSubmit={send} className="chat-form">
        <label htmlFor="chat-input">Ask a question</label>
        <textarea
          id="chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          maxLength={2000}
        />
        <button type="submit" disabled={busy || !draft.trim()}>Send</button>
      </form>
    </section>
  );
}

async function readEvents(body: ReadableStream<Uint8Array>, onEvent: (event: ChatEvent) => void) {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    let newline = buffer.indexOf('\n');
    while (newline !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) onEvent(JSON.parse(line) as ChatEvent);
      newline = buffer.indexOf('\n');
    }
  }
}
