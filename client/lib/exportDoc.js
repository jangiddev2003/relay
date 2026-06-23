// Client-side document export — turns a conversation into a real downloadable
// PDF (via jsPDF) or Word-compatible .doc file (via an HTML/Blob trick).

export async function exportAsPdf(botName, messages) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const margin = 16;
  let y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${botName} Bot — Conversation`, margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(new Date().toLocaleString(), margin, y);
  doc.setTextColor(20);
  y += 10;

  messages.forEach(m => {
    const who = m.role === 'user' ? 'You' : `${botName} Bot`;
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(who + ':', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    const wrapped = doc.splitTextToSize(m.text, 180);
    wrapped.forEach(line => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += 6;
    });
    y += 4;
  });

  doc.save(`${botName.toLowerCase()}-conversation.pdf`);
}

export function exportAsWord(botName, messages) {
  let html = `<html><head><meta charset="utf-8"><title>${botName} Bot Conversation</title></head><body style="font-family:Calibri,Arial,sans-serif;">`;
  html += `<h1 style="font-size:20pt;">${botName} Bot — Conversation</h1>`;
  html += `<p style="color:#555;font-size:9pt;">${new Date().toLocaleString()}</p><hr>`;
  messages.forEach(m => {
    const who = m.role === 'user' ? 'You' : `${botName} Bot`;
    html += `<p><strong>${who}:</strong><br>${m.text.replace(/</g, '&lt;')}</p>`;
  });
  html += `</body></html>`;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${botName.toLowerCase()}-conversation.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAsZip(botName, messages) {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  let fileCount = 0;
  messages.forEach((m, msgIndex) => {
    const text = m.text;
    const regex = /```(\w*)\n([\s\S]*?)\n```/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      fileCount++;
      const lang = match[1] ? match[1].toLowerCase() : 'txt';
      const code = match[2];
      
      let ext = lang;
      if (lang === 'js' || lang === 'javascript') ext = 'js';
      else if (lang === 'jsx' || lang === 'react') ext = 'jsx';
      else if (lang === 'ts' || lang === 'typescript') ext = 'ts';
      else if (lang === 'tsx') ext = 'tsx';
      else if (lang === 'py' || lang === 'python') ext = 'py';
      else if (lang === 'html' || lang === 'htm') ext = 'html';
      else if (lang === 'css') ext = 'css';
      else if (lang === 'sh' || lang === 'bash' || lang === 'shell') ext = 'sh';
      else if (lang === 'json') ext = 'json';
      else if (lang === 'md' || lang === 'markdown') ext = 'md';
      else if (lang === 'go' || lang === 'golang') ext = 'go';
      else if (lang === 'rs' || lang === 'rust') ext = 'rs';
      else if (lang === 'cs' || lang === 'csharp') ext = 'cs';
      else if (lang === 'cpp' || lang === 'c++') ext = 'cpp';
      else if (lang === 'c') ext = 'c';
      else if (lang === 'rb' || lang === 'ruby') ext = 'rb';
      else if (lang === 'php') ext = 'php';
      else if (lang === 'sql') ext = 'sql';
      else if (lang === 'yaml' || lang === 'yml') ext = 'yml';
      else if (lang === 'xml') ext = 'xml';
      
      const precedingText = text.substring(0, match.index);
      const lines = precedingText.split('\n');
      const lastFewLines = lines.slice(-3).join(' ');
      
      const fileMatch = /`([^`\s]+\.[a-zA-Z0-9]+)`/.exec(lastFewLines) || 
                        /(\b[\w-]+\.[a-zA-Z0-9]+\b)/.exec(lastFewLines);
                        
      let filename = '';
      if (fileMatch) {
        filename = fileMatch[1].trim();
        filename = filename.replace(/[\\/:*?"<>|]/g, '_');
      } else {
        filename = `code_block_${msgIndex + 1}_${fileCount}.${ext}`;
      }
      
      zip.file(filename, code);
    }
  });

  if (fileCount === 0) {
    alert("No code blocks found in this conversation to export.");
    return;
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${botName.toLowerCase()}-code-export.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
