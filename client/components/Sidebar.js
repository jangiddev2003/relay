import Link from 'next/link';

function BotNavIcon({ code, active, isCustom }) {
  return (
    <span
      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
        active ? 'bg-white/15 text-white' : 'bg-coding-blue/15 text-coding-glow border border-coding-blue/30'
      }`}
    >
      {isCustom ? (
        <span className="text-[10px]">🤖</span>
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
          <div className="font-bold text-lg leading-tight text-text">Relay</div>
          <div className="text-muted text-[10px] uppercase tracking-widest mt-0.5">AI Agent Platform</div>
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

export default function Sidebar({ activeBot, customBots = [], onSelect, onDeleteBot, userEmail, onLogout, onClose }) {
  return (
    <aside className="w-60 bg-panel border-r border-border flex flex-col h-screen">
      <div className="p-5 border-b border-border">
        <RelayLogo onClose={onClose} />
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {/* Chats Section */}
        <div className="text-muted text-xs uppercase tracking-wide px-5 pb-2">Chats</div>
        <nav className="flex flex-col gap-1 px-3 mb-6">
          <button
            onClick={() => onSelect('routed')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
              activeBot === 'routed'
                ? 'bg-coding-blue text-white shadow-[0_0_20px_rgba(37,99,235,0.35)]'
                : 'hover:bg-panel2 text-text'
            }`}
          >
            <BotNavIcon code="RL" active={activeBot === 'routed'} isCustom={false} />
            <span className="text-sm font-medium">Relay AI</span>
          </button>
        </nav>

        {/* My Bots Section */}
        <div className="flex items-center justify-between px-5 pb-2">
          <span className="text-muted text-xs uppercase tracking-wide">My Bots</span>
          <Link href="/create-bot">
            <span className="text-xs text-accent hover:text-white font-medium cursor-pointer transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New
            </span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {customBots.length === 0 ? (
            <div className="text-muted text-xs px-5 py-2 italic">No custom bots yet.</div>
          ) : (
            customBots.map((bot) => {
              const isActive = activeBot === bot._id;
              return (
                <div
                  key={bot._id}
                  className={`group relative flex items-center justify-between w-full rounded-xl transition-colors ${
                    isActive
                      ? 'bg-coding-blue text-white shadow-[0_0_20px_rgba(37,99,235,0.35)]'
                      : 'hover:bg-panel2 text-text'
                  }`}
                >
                  <button
                    onClick={() => onSelect(bot._id)}
                    className="flex items-center gap-3 px-3 py-2.5 text-left flex-1 min-w-0"
                  >
                    <BotNavIcon code="" active={isActive} isCustom={true} />
                    <span className="text-sm font-medium truncate">{bot.name}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBot(bot._id, bot.name);
                    }}
                    title={`Delete ${bot.name}`}
                    className={`mr-3 p-1 rounded-md text-muted hover:text-red-400 hover:bg-black/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all shrink-0 ${
                      isActive ? 'text-white/60 hover:text-white hover:bg-white/10' : ''
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-border text-xs text-muted">
        <div className="mb-2 truncate">{userEmail}</div>
        <button onClick={onLogout} className="text-signal hover:underline font-medium">Log out</button>
      </div>
    </aside>
  );
}
