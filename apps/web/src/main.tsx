import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './theme.css';

function Workspace() {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  async function check(signal?: AbortSignal) {
    setState('loading');
    try {
      const response = await fetch('/api/health', { signal, cache: 'no-store' });
      const value: unknown = await response.json();
      if (!response.ok || typeof value !== 'object' || value === null || !('data' in value) ||
          typeof value.data !== 'object' || value.data === null || !('status' in value.data) || value.data.status !== 'ok') throw new Error('Unavailable');
      if (!signal?.aborted) setState('ready');
    } catch {
      if (!signal?.aborted) setState('error');
    }
  }
  useEffect(() => { const controller = new AbortController(); void check(controller.signal); return () => controller.abort(); }, []);
  return <main className="workspace-card">
    <p className="eyebrow">LECTURE FEEDBACK</p><h1>LECTRA</h1>
    <p>This workspace contains setup only. Sign-in and surveys are not available yet.</p>
    <p role="status" aria-live="polite">{state === 'loading' ? 'Checking service connection…' : state === 'ready' ? 'Service connection ready.' : 'Service is unavailable. Try again.'}</p>
    {state === 'error' && <button onClick={() => void check()}>Try again</button>}
  </main>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Workspace /></StrictMode>);
