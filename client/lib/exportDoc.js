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
