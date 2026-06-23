const BOT_META = {
  knowledge: { code: 'KN', name: 'Knowledge' },
  reasoning: { code: 'RS', name: 'Reasoning' },
  coding: { code: 'CD', name: 'Coding', icon: 'coding' },
  maths: { code: 'MA', name: 'Maths' },
  news: { code: 'NW', name: 'News' }
};

function BotNavIcon({ code, active, isCoding }) {
  return (
    <span
      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
        active ? 'bg-white/15 text-white' : 'bg-coding-blue/15 text-coding-glow border border-coding-blue/30'
      }`}
    >
      {isCoding ? (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M8 7L3 12L8 17M16 7L21 12L16 17"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        code
      )}
    </span>
  );
}

function RelayLogo({ onClose }) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2.5">
        <div className="flex -space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-coding-blue shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-coding-glow shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        </div>
        <div>
          <div className="font-bold text-lg leading-tight">Relay</div>
          <div className="text-muted text-[10px] uppercase tracking-widest mt-0.5">Multi-Bot Console</div>
        </div>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="md:hidden text-muted hover:text-white p-1"
          title="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function Sidebar({ activeBot, onSelect, userEmail, onLogout, onClose }) {
  return (
    <aside className="w-60 bg-panel border-r border-border flex flex-col h-screen">
      <div className="p-5 border-b border-border">
        <RelayLogo onClose={onClose} />
      </div>

      <div className="text-muted text-xs uppercase tracking-wide px-5 pt-4 pb-2">Channels</div>
      <nav className="flex flex-col gap-1 px-3">
        {Object.entries(BOT_META).map(([id, bot]) => {
          const isActive = id === activeBot;
          const isCoding = id === 'coding';

          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                isActive
                  ? 'bg-coding-blue text-white shadow-[0_0_20px_rgba(37,99,235,0.35)]'
                  : 'hover:bg-panel2'
              }`}
            >
              <BotNavIcon code={bot.code} active={isActive} isCoding={isCoding} />
              <span className="text-sm">{bot.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-border text-xs text-muted">
        <div className="mb-2 truncate">{userEmail}</div>
        <button onClick={onLogout} className="text-signal hover:underline">Log out</button>
      </div>
    </aside>
  );
}
