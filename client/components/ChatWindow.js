import { useEffect, useRef, useState } from 'react';
import apiFetch from '../lib/api';
import MessageBubble from './MessageBubble';
import { exportAsPdf, exportAsWord, exportAsZip } from '../lib/exportDoc';

const BOT_META = {
  knowledge: { code: 'KN', name: 'Knowledge', tagline: 'Ask anything, get a clear explanation' },
  reasoning: { code: 'RS', name: 'Reasoning', tagline: 'Step-by-step thinking through a problem' },
  coding: {
    code: 'CD',
    name: 'Coding',
    tagline: 'Write and explain code',
    emptyTitle: 'Start a conversation with Coding.',
    emptySubtitle: 'Ask anything about code, algorithms, or debugging.'
  },
  maths: { code: 'MA', name: 'Maths', tagline: 'Solve equations and show the working' },
  news: { code: 'NW', name: 'News', tagline: 'Summaries of real current headlines' }
};

function CodingIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 7L3 12L8 17M16 7L21 12L16 17"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function PlusIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

function HistoryIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 8v4l3 3"></path>
      <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path>
    </svg>
  );
}

function CloseIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function CheckIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function EditIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
}

function TrashIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}

function BotCubeHero({ botId, code }) {
  const isCoding = botId === 'coding';
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('perspective(500px) rotateX(14deg) rotateY(-18deg) scale3d(1, 1, 1)');

  useEffect(() => {
    function handleGlobalMouseMove(e) {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = e.clientX - centerX;
      const y = e.clientY - centerY;

      // Normalize relative to viewport size
      const pctX = x / window.innerWidth;
      const pctY = y / window.innerHeight;

      const maxTilt = 35; // Max degrees of tilt
      const rotX = -pctY * maxTilt;
      const rotY = pctX * maxTilt;

      setTransformStyle(`perspective(500px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`);
    }

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  return (
    <div className="relative mx-auto mb-8 w-36 h-40 flex items-center justify-center">
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-12 bg-coding-glow/25 blur-2xl rounded-full" />
      <div
        ref={cardRef}
        className="relative mx-auto w-28 h-28 rounded-2xl bg-gradient-to-br from-[#1e3a5f] via-[#111827] to-[#0a0f1a] border border-coding-glow/40 shadow-[0_0_48px_rgba(59,130,246,0.35)] flex items-center justify-center select-none"
        style={{
          transform: transformStyle,
          transition: 'transform 0.15s ease-out'
        }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-coding-glow/10 to-transparent" />
        <span className="relative text-coding-glow text-3xl font-bold font-mono drop-shadow-[0_0_16px_rgba(96,165,250,0.9)]">
          {isCoding ? '</>' : code}
        </span>
      </div>
    </div>
  );
}

export default function ChatWindow({ botId }) {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const chatEndRef = useRef(null);
  const bot = BOT_META[botId];
  const isCoding = botId === 'coding';

  useEffect(() => {
    setError('');
    setConversationId(null);
    apiFetch(`/api/chat/${botId}`)
      .then(data => {
        setConversationId(data.conversationId);
        setMessages(data.messages || []);
      })
      .catch(err => setError(err.message));
  }, [botId]);

  useEffect(() => {
    if (isHistoryOpen) {
      fetchHistory();
    }
  }, [botId, isHistoryOpen, messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchHistory() {
    try {
      const data = await apiFetch(`/api/chat/${botId}/history`);
      setHistory(data.history || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }

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
        body: JSON.stringify({ message: text, conversationId })
      });
      setConversationId(data.conversationId);
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

  function handleNewChat() {
    setConversationId(null);
    setMessages([]);
    setError('');
  }

  async function handleLoadConversation(convoId) {
    setError('');
    try {
      const data = await apiFetch(`/api/chat/${botId}?conversationId=${convoId}`);
      setConversationId(convoId);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleStartRename(id, title) {
    setEditingId(id);
    setEditTitle(title);
  }

  async function handleSaveRename(id) {
    if (!editTitle.trim()) return;
    try {
      await apiFetch(`/api/chat/${botId}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editTitle })
      });
      setEditingId(null);
      fetchHistory();
    } catch (err) {
      alert("Failed to rename conversation: " + err.message);
    }
  }

  function handleEditKeyDown(e, id) {
    if (e.key === 'Enter') {
      handleSaveRename(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  }

  async function handleDeleteConversation(id) {
    if (!confirm("Are you sure you want to delete this chat conversation?")) return;
    try {
      await apiFetch(`/api/chat/${botId}/${id}`, {
        method: 'DELETE'
      });
      if (conversationId === id) {
        handleNewChat();
      }
      fetchHistory();
    } catch (err) {
      alert("Failed to delete conversation: " + err.message);
    }
  }

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-coding-panel">
      {/* Main chat window content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="px-6 py-4 border-b flex items-center justify-between border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coding-blue flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.45)] font-mono text-xs font-bold shrink-0">
              {isCoding ? <CodingIcon /> : bot.code}
            </div>
            <div>
              <div className="font-semibold text-lg">{bot.name}</div>
              <div className="text-xs text-muted">{bot.tagline}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono uppercase text-signal flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-signal" /> Online
            </div>
            <button
              onClick={handleNewChat}
              title="Start a new chat"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-coding-glow hover:bg-blue-500/20 transition-all shadow-[0_0_12px_rgba(59,130,246,0.15)] shrink-0"
            >
              <PlusIcon /> New Chat
            </button>
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              title="View chat history"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
                isHistoryOpen
                  ? 'bg-coding-blue text-white border-coding-blue shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                  : 'bg-blue-500/10 border-blue-500/30 text-coding-glow hover:bg-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
              }`}
            >
              <HistoryIcon /> History
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          {messages.length === 0 && !error && (
            <div className="m-auto text-center max-w-lg">
              <BotCubeHero botId={botId} code={bot.code} />
              <h2 className="text-2xl font-semibold mb-2">
                {isCoding ? bot.emptyTitle : `Start a conversation with ${bot.name}.`}
              </h2>
              <p className="text-muted">
                {isCoding ? bot.emptySubtitle : bot.tagline}
              </p>
            </div>
          )}
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              role={m.role}
              text={m.text}
              botCode={bot.code}
              variant="coding"
            />
          ))}
          {sending && (
            <div className="text-muted text-xs font-mono">{bot.name} is typing…</div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="px-6 py-4 border-t border-blue-900/40">
          <div className="flex gap-2 items-end">
            <textarea
              rows={1}
              className="flex-1 border rounded-xl px-4 py-3 text-sm resize-none min-h-[44px] bg-[#111827] border-blue-900/50 placeholder:text-muted/70 focus:border-coding-blue/60"
              placeholder={`Message the ${bot.name} bot…`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSend}
              disabled={sending}
              className="font-semibold text-sm rounded-xl px-5 py-3 disabled:opacity-60 flex items-center gap-2 bg-coding-blue text-white shadow-[0_0_24px_rgba(37,99,235,0.4)] hover:bg-blue-600"
            >
              Send
              <SendIcon />
            </button>
          </div>

          <div className="flex gap-2 mt-2.5">
            <button
              onClick={() => exportAsPdf(bot.name, messages)}
              className="text-xs font-mono uppercase border rounded-full px-3 py-1.5 text-muted border-blue-900/50 bg-[#111827] hover:text-coding-glow hover:border-coding-blue/50"
            >
              Export - PDF
            </button>
            <button
              onClick={() => exportAsWord(bot.name, messages)}
              className="text-xs font-mono uppercase border rounded-full px-3 py-1.5 text-muted border-blue-900/50 bg-[#111827] hover:text-coding-glow hover:border-coding-blue/50"
            >
              Export - Word
            </button>
            {isCoding && (
              <button
                onClick={() => exportAsZip(bot.name, messages)}
                className="text-xs font-mono uppercase border rounded-full px-3 py-1.5 text-muted border-blue-900/50 bg-[#111827] hover:text-coding-glow hover:border-coding-blue/50"
              >
                Export - ZIP
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible History Drawer */}
      {isHistoryOpen && (
        <aside className="w-80 border-l border-blue-900/40 bg-[#0A0F1A] flex flex-col h-full shrink-0">
          <div className="px-5 py-4 border-b border-blue-900/40 flex items-center justify-between">
            <h3 className="font-semibold text-sm tracking-wide text-coding-glow">Chat History</h3>
            <button onClick={() => setIsHistoryOpen(false)} className="text-muted hover:text-white transition-colors">
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {history.length === 0 ? (
              <div className="text-muted text-xs text-center py-8">No previous chats.</div>
            ) : (
              history.map(item => (
                <div
                  key={item.id}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-center justify-between border ${
                    conversationId === item.id
                      ? 'bg-coding-blue/20 border-coding-blue/40 text-white shadow-[0_0_12px_rgba(37,99,235,0.15)]'
                      : 'bg-panel2/40 border-transparent text-muted hover:bg-panel2/80 hover:text-white'
                  }`}
                >
                  <div
                    onClick={() => {
                      if (editingId !== item.id) {
                        handleLoadConversation(item.id);
                      }
                    }}
                    className="flex-1 min-w-0 cursor-pointer flex flex-col gap-1"
                  >
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={e => handleEditKeyDown(e, item.id)}
                        onClick={e => e.stopPropagation()}
                        className="bg-black/40 border border-blue-900/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-coding-blue w-full"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium truncate block w-full">{item.title}</span>
                    )}
                    <span className="text-[10px] text-muted/60">{new Date(item.updatedAt).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSaveRename(item.id); }}
                          title="Save"
                          className="text-signal hover:text-white p-1 transition-colors"
                        >
                          <CheckIcon />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                          title="Cancel"
                          className="text-red-400 hover:text-white p-1 transition-colors"
                        >
                          <CloseIcon className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartRename(item.id, item.title); }}
                          title="Rename"
                          className="text-muted hover:text-coding-glow p-1 transition-colors"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteConversation(item.id); }}
                          title="Delete"
                          className="text-muted hover:text-red-400 p-1 transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
