import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import apiFetch from '../lib/api';

export default function CreateBot() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [rules, setRules] = useState('');
  
  // PDF Parsing states
  const [parsingPdf, setParsingPdf] = useState(false);
  const [knowledgePdfBase64, setKnowledgePdfBase64] = useState('');
  const [knowledgePdfName, setKnowledgePdfName] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load preset bot if specified in URL query params
  useEffect(() => {
    if (router.query.preset) {
      const presetId = router.query.preset;
      // Load preset config
      import('../lib/presets').then(({ PRESETS }) => {
        const preset = PRESETS.find(p => p.id === presetId);
        if (preset) {
          setName(preset.name);
          setDescription(preset.description);
          setPersonality(preset.personality);
          setRules(preset.rules);
          setKnowledgePdfName(`${preset.name.replace(/\s+/g, '_')}_Knowledge.pdf`);
          
          // Auto-fetch preset PDF and convert to base64
          setParsingPdf(true);
          fetch(preset.pdfPath)
            .then(res => {
              if (!res.ok) throw new Error('Preset PDF file has not been uploaded yet on the server.');
              return res.blob();
            })
            .then(blob => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                setKnowledgePdfBase64(base64);
              };
              reader.readAsDataURL(blob);
            })
            .catch(err => {
              console.warn("Preset PDF Fetch warning: " + err.message);
              // Fail silently or let them write fields normally
            })
            .finally(() => {
              setParsingPdf(false);
            });
        }
      });
    }
  }, [router.query.preset]);

  // Handle parsing an instruction PDF to fill the form automatically
  const handleInstructionPdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setParsingPdf(true);
    setError('');
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result.split(',')[1];
        const parsedData = await apiFetch('/api/custom-bot/parse-instruction-pdf', {
          method: 'POST',
          body: JSON.stringify({ pdfBase64: base64 })
        });
        
        setName(parsedData.name || '');
        setDescription(parsedData.description || '');
        setPersonality(parsedData.personality || '');
        setRules(parsedData.rules || '');
      } catch (err) {
        setError('Failed to extract form fields from PDF: ' + err.message);
      } finally {
        setParsingPdf(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle uploading a PDF knowledge base
  const handleKnowledgePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setKnowledgePdfBase64(base64);
      setKnowledgePdfName(file.name);
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Bot Name is required');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/api/custom-bot', {
        method: 'POST',
        body: JSON.stringify({ 
          name, 
          description, 
          personality, 
          rules,
          knowledgePdfBase64,
          knowledgePdfName
        })
      });
      // Redirect back to chat page with the newly created bot selected
      router.push(`/chat?selectBot=${data.bot._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6 py-12 relative overflow-hidden text-text">
      {/* Decorative Glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-coding-glow/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl w-full relative z-10 items-stretch">
        
        {/* Creation Form Card */}
        <form 
          onSubmit={handleSubmit} 
          className="flex-1 bg-panel/85 backdrop-blur-md border border-border rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-text">Create Custom Bot</h1>
              <p className="text-muted text-xs mt-1">Design your own specialized AI assistant</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/chat')}
              className="text-xs text-muted hover:text-white transition-colors border border-border px-3 py-1.5 rounded-lg hover:bg-panel2"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-lg mb-5 font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            
            {/* Autofill via PDF Instructions */}
            <div className="bg-[#111827]/40 border border-dashed border-border rounded-xl p-4">
              <label className="text-xs font-semibold text-muted block mb-1.5">Autofill Bot from Instruction PDF</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleInstructionPdfChange}
                  className="hidden"
                  id="instruction-pdf"
                  disabled={parsingPdf}
                />
                <label
                  htmlFor="instruction-pdf"
                  className={`bg-panel2 border border-border hover:bg-[#111827] text-text text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors font-semibold flex items-center gap-1.5 ${
                    parsingPdf ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {parsingPdf ? 'Parsing PDF...' : 'Attach Instruction PDF'}
                </label>
                <span className="text-[11px] text-muted truncate max-w-[200px]">
                  {parsingPdf ? 'Reading text & extracting fields...' : 'Upload instructions to fill fields automatically'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1.5">Bot Name <span className="text-accent">*</span></label>
              <input
                className="w-full bg-[#111827] border border-border focus:border-accent/60 rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none transition-colors"
                type="text"
                placeholder="e.g. Marketing Expert, Fitness Coach..."
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1.5">Description / Specialty</label>
              <textarea
                className="w-full bg-[#111827] border border-border focus:border-accent/60 rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none transition-colors"
                rows={2}
                placeholder="What does this bot specialize in? (e.g. Helps with marketing strategies, copywriting, and customer acquisition)"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1.5">Personality</label>
              <input
                className="w-full bg-[#111827] border border-border focus:border-accent/60 rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none transition-colors"
                type="text"
                placeholder="e.g. Professional and analytical, friendly and motivational..."
                value={personality}
                onChange={e => setPersonality(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1.5">Rules / Instructions</label>
              <textarea
                className="w-full bg-[#111827] border border-border focus:border-accent/60 rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none transition-colors"
                rows={3}
                placeholder="Always answer from a marketing perspective. Avoid simple bullet points."
                value={rules}
                onChange={e => setRules(e.target.value)}
              />
            </div>

            {/* Knowledge Base PDF Upload */}
            <div className="bg-[#111827]/40 border border-dashed border-border rounded-xl p-4 mt-2">
              <label className="text-xs font-semibold text-muted block mb-1.5">Attach Bot Knowledge Base (PDF)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleKnowledgePdfChange}
                  className="hidden"
                  id="knowledge-pdf"
                />
                <label
                  htmlFor="knowledge-pdf"
                  className="bg-panel2 border border-border hover:bg-[#111827] text-text text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors font-semibold flex items-center gap-1.5"
                >
                  Attach Knowledge PDF
                </label>
                <span className="text-[11px] text-muted truncate max-w-[200px]">
                  {knowledgePdfName || 'Upload a PDF containing facts about your bot'}
                </span>
              </div>
            </div>

          </div>

          <button
            className="w-full mt-6 bg-accent text-[#0F1320] font-bold rounded-xl py-3 hover:bg-opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(242,169,59,0.3)]"
            type="submit"
            disabled={loading || parsingPdf}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-[#0F1320]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Bot…
              </>
            ) : (
              'Create Bot'
            )}
          </button>
        </form>

        {/* Creation Guide Card */}
        <div className="w-full lg:w-80 bg-panel/85 backdrop-blur-md border border-border rounded-2xl p-6 text-sm flex flex-col justify-between text-muted shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          <div>
            <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-4">
              💡 Bot Creator Guide
            </h2>
            <p className="leading-relaxed mb-6 text-xs text-text/80">
              Customize an AI agent by filling identity details, uploading instruction guidelines, and providing custom knowledge references.
            </p>
            <div className="flex flex-col gap-5">
              <div className="flex gap-3">
                <span className="text-accent font-mono font-bold text-base leading-none">1.</span>
                <div>
                  <span className="font-semibold text-text block mb-1 text-xs">Define Identity</span>
                  <span className="text-[11px] leading-relaxed block">Provide a bot Name (e.g. <i>Copywriter</i>), define its specialty focus, and describe its communication persona.</span>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-accent font-mono font-bold text-base leading-none">2.</span>
                <div>
                  <span className="font-semibold text-text block mb-1 text-xs">Autofill via PDF</span>
                  <span className="text-[11px] leading-relaxed block">Upload a PDF containing rules to have the AI automatically parse and autofill all text fields.</span>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-accent font-mono font-bold text-base leading-none">3.</span>
                <div>
                  <span className="font-semibold text-text block mb-1 text-xs">Embed Knowledge Base</span>
                  <span className="text-[11px] leading-relaxed block">Attach a PDF containing detailed data (product specs, FAQs, documents) that the bot can access when chatting.</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/60 pt-5 mt-6">
            <span className="text-text font-semibold block mb-2 text-xs">Built-in Bot Gallery</span>
            <p className="mb-4 text-[11px] leading-relaxed">
              Don't have a PDF ready? Browse our gallery of 15 built-in bots. Download their specifications or import one with a single tap.
            </p>
            <button
              type="button"
              onClick={() => router.push('/presets')}
              className="w-full bg-coding-blue/20 hover:bg-coding-blue/30 text-coding-glow border border-coding-blue/40 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.1)]"
            >
              Browse Built-in Bots Gallery
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
