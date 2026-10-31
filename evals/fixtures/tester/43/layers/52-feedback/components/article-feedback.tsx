'use client';

import { useState } from 'react';

export function ArticleFeedback({ slug }: { slug: string }) {
  const [state, setState] = useState<'idle' | 'sent' | 'failed'>('idle');

  async function send(helpful: boolean) {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, helpful }),
    });
    setState(response.ok ? 'sent' : 'failed');
  }

  if (state === 'sent') return <p>Thanks for the feedback.</p>;
  return (
    <div className="feedback">
      <span>Was this article helpful?</span>
      <button type="button" onClick={() => send(true)}>Yes</button>
      <button type="button" onClick={() => send(false)}>No</button>
      {state === 'failed' ? <p role="alert">We couldn't save your feedback. Please try again.</p> : null}
    </div>
  );
}
