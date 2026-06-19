const BOT_META = {
  knowledge: { code: 'KN', name: 'Knowledge' },
  reasoning: { code: 'RS', name: 'Reasoning' },
  coding: { code: 'CD', name: 'Coding' },
  maths: { code: 'MA', name: 'Maths' },
  news: { code: 'NW', name: 'News' }
};

export default function Sidebar({ activeBot, onSelect, userEmail, onLogout }) {
  return (
    <aside className="w-60 bg-panel border-r border-border flex flex-col h-screen">
      <div className="p-5 border-b border-border">
        <div className="font-bold text-lg">Relay</div>
        <div className="text-muted text-xs uppercase tracking-wide mt-1">multi-bot console</div>
      </div>

      <div className="text-muted text-xs uppercase tracking-wide px-5 pt-4 pb-2">Channels</div>
      <nav className="flex flex-col gap-1 px-3">
        {Object.entries(BOT_META).map(([id, bot]) => {
          const isActive = id === activeBot;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left border-l-2 ${
                isActive ? 'bg-panel2 border-accent' : 'border-transparent hover:bg-panel2'
              }`}
            >
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${
                isActive ? 'text-accent border-accent' : 'text-muted border-border'
              }`}>
                {bot.code}
              </span>
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
