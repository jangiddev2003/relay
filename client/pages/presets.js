import Link from 'next/link';
import { useRouter } from 'next/router';
import { PRESETS } from '../lib/presets';

export default function PresetsGallery() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg px-6 py-12 relative overflow-hidden text-text">
      {/* Decorative Glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-coding-glow/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Built-in Bots Gallery</h1>
            <p className="text-muted text-sm mt-2">Download a pre-compiled bot qualification PDF or use it directly to configure your bot.</p>
          </div>
          <Link href="/create-bot">
            <span className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl bg-panel hover:bg-panel2 cursor-pointer transition-colors text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Creator
            </span>
          </Link>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRESETS.map((bot) => (
            <div 
              key={bot.id} 
              className="bg-panel/80 backdrop-blur-sm border border-border hover:border-coding-glow/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] group"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-coding-blue/20 border border-coding-blue/40 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(37,99,235,0.2)]">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text group-hover:text-coding-glow transition-colors">{bot.name}</h3>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-muted font-bold">Preset Specification</span>
                  </div>
                </div>

                <p className="text-sm text-text/85 leading-relaxed mb-4">{bot.description}</p>

                <div className="text-xs border-t border-border/60 pt-4 flex flex-col gap-2">
                  <div>
                    <span className="text-muted font-semibold block mb-0.5">Personality:</span>
                    <span className="text-text/90 italic">"{bot.personality}"</span>
                  </div>
                  <div>
                    <span className="text-muted font-semibold block mb-0.5">Core rules:</span>
                    <span className="text-text/90 line-clamp-2" title={bot.rules}>{bot.rules}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 border-t border-border/60 pt-4">
                <a 
                  href={bot.pdfPath}
                  download
                  className="flex-1 text-center bg-panel2 hover:bg-[#111827] text-text border border-border text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download PDF
                </a>
                <button
                  onClick={() => router.push(`/create-bot?preset=${bot.id}`)}
                  className="flex-1 bg-accent text-[#0F1320] font-bold text-xs py-2.5 rounded-xl hover:bg-opacity-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(242,169,59,0.15)]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Use Bot
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
