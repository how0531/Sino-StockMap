// 處理 CSV 欄位中包含逗號、雙引號和換行的解析器
export function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    if (csvText && typeof csvText.default === 'string') {
      csvText = csvText.default;
    } else {
      return [];
    }
  }

  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    const next = csvText[i + 1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"'; // 處理雙引號轉義
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }

  if (lines.length === 0) return [];

  const headers = lines[0].map(h => h.trim());
  return lines.slice(1)
    .filter(r => r.length >= headers.length && r[headers.indexOf('company')])
    .map(r => {
      const item = {};
      headers.forEach((h, idx) => {
        item[h] = (r[idx] || '').trim();
      });
      return item;
    });
}
