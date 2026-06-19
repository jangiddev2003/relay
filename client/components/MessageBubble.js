export default function MessageBubble({ role, text, botCode }) {
  const isUser = role === 'user';
  return (
    <div className={`flex flex-col gap-1 max-w-[72%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
      <div className="text-[10px] uppercase tracking-wide text-muted font-mono">
        {isUser ? 'You' : `Bot · ${botCode}`}
      </div>
      <div
        className={`px-4 py-2.5 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-accent/10 border border-accent/30 rounded-tr-sm'
            : 'bg-panel2 border border-border rounded-tl-sm'
        }`}
      >
        {text}
      </div>
    </div>
  );
}
