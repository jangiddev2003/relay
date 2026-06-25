export default function MessageBubble({ role, text, botCode, variant = 'default' }) {
  const isUser = role === 'user';

  // Determine if we should show a code-accent styling (like the original Coding Bot had)
  const isCodingVariant = botCode === 'CD';

  const codeMap = {
    kn: 'Knowledge',
    knowledge: 'Knowledge',
    rs: 'Reasoning',
    reasoning: 'Reasoning',
    cd: 'Coding',
    coding: 'Coding',
    ma: 'Maths',
    maths: 'Maths',
    nw: 'News',
    news: 'News',
    rl: 'Relay AI',
    routed: 'Relay AI'
  };

  const cleanCode = botCode ? String(botCode).trim().toLowerCase() : '';
  const resolvedName = codeMap[cleanCode] || botCode || 'Assistant';

  return (
    <div className={`flex flex-col gap-1 max-w-[72%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
      <div className="text-[10px] uppercase tracking-wide text-muted font-mono">
        {isUser ? 'You' : `Bot · ${resolvedName}`}
      </div>
      <div
        className={`px-4 py-2.5 rounded-lg text-sm leading-relaxed whitespace-pre-wrap text-text ${
          isUser
            ? isCodingVariant
              ? 'bg-coding-blue/15 border border-coding-blue/35 rounded-tr-sm'
              : 'bg-accent/10 border border-accent/30 rounded-tr-sm'
            : 'bg-panel2 border border-border rounded-tl-sm'
        } ${!isUser ? 'italic text-text/95 font-light' : ''}`}
      >
        {text}
      </div>
    </div>
  );
}
