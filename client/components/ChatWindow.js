import { useEffect, useRef, useState } from 'react';
import apiFetch from '../lib/api';
import MessageBubble from './MessageBubble';
import { exportAsPdf, exportAsWord } from '../lib/exportDoc';

const BOT_META = {
  knowledge: { code: 'KN', name: 'Knowledge', tagline: 'Ask anything, get a clear explanation' },
  reasoning: { code: 'RS', name: 'Reasoning', tagline: 'Step-by-step thinking through a problem' },
  coding: { code: 'CD', name: 'Coding', tagline: 'Write and explain code' },
  maths: { code: 'MA', name: 'Maths', tagline: 'Solve equations and show the working' },
  news: { code: 'NW', name: 'News', tagline: 'Summaries of real current headlines' }
};

export default function ChatWindow({ botId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);
  const bot = BOT_META[botId];

  useEffect(() => {
    setError('');
    apiFetch(`/api/chat/${botId}`)
      .then(data => setMessages(data.messages || []))
      .catch(err => setError(err.message));
  }, [botId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setError('');
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');

    try {
      const data = await apiFetch(`/api/chat/${botId}`, {
        method: 'POST',
        body: JSON.stringify({ message: text })
      });
      setMessages(data.messages);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <main className="flex-1 flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent font-mono text-xs flex items-center justify-center">
            {bot.code}
          </div>
          <div>
            <div className="font-semibold">{bot.name}</div>
            <div className="text-xs text-muted">{bot.tagline}</div>
          </div>
        </div>
        <div className="text-xs font-mono uppercase text-signal flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-signal" /> Online
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        {messages.length === 0 && !error && (
          <div className="m-auto text-center text-muted max-w-sm text-sm">
            Send a message to start a conversation with the {bot.name} bot.
          </div>
        )}
        {error && <div className="text-red-400 text-sm">{error}</div>}
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} text={m.text} botCode={bot.code} />
        ))}
        {sending && (
          <div className="text-muted text-xs font-mono">{bot.name} is typing…</div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="px-6 py-4 border-t border-border">
        <div className="flex gap-2 items-end">
          <textarea
            rows={1}
            className="flex-1 bg-panel2 border border-border rounded-lg px-3 py-2.5 text-sm resize-none h-11"
            placeholder={`Message the ${bot.name} bot…`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className="bg-accent text-bg font-semibold text-sm rounded-lg px-5 py-2.5 disabled:opacity-60"
          >
            Send
          </button>
        </div>

        <div className="flex gap-2 mt-2.5">
          <button
            onClick={() => exportAsPdf(bot.name, messages)}
            className="text-xs font-mono uppercase text-muted border border-border rounded-md px-3 py-1.5 hover:text-signal hover:border-signal"
          >
            Export · PDF
          </button>
          <button
            onClick={() => exportAsWord(bot.name, messages)}
            className="text-xs font-mono uppercase text-muted border border-border rounded-md px-3 py-1.5 hover:text-signal hover:border-signal"
          >
            Export · Word
          </button>
        </div>
      </div>
    </main>
  );
}
