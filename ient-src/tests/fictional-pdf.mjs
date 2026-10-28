// Small valid PDF fixture, with no real company or private information.
export function fictionalPdf(lines = ['Fictional QA startup', 'Industrial software for small factories.', 'Company reports ARR USD 100000 and 12 paying customers.', 'Retention, margins and customer concentration are not supplied.']) {
  const escaped = lines.map(s => s.replace(/[\\()]/g, '\\$&'));
  const stream = `BT /F1 12 Tf 40 240 Td ${escaped.map((line,i) => `${i?'0 -24 Td ':''}(${line}) Tj`).join('\n')} ET`;
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 300] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let content='%PDF-1.4\n';const offsets=[];
  objects.forEach((value,i)=>{offsets.push(content.length);content+=`${i+1} 0 obj\n${value}\nendobj\n`;});
  const xref=content.length;
  content+=`xref\n0 6\n0000000000 65535 f \n${offsets.map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(content);
}
