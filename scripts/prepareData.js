import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.resolve(__dirname, '../outputs/companies.csv');
const ALL_TOPICS_PATH = path.resolve(__dirname, '../outputs/all_topics.json');
const OUT_DIR = path.resolve(__dirname, '../src/data');

// 確保輸出目錄存在
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// 完美的 CSV Parser，處理引號與換行
function parseCSV(csvText) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    const next = csvText[i + 1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"'; // 雙引號轉義
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
  return lines;
}

function process() {
  console.log('正在處理供應鏈資料...');

  // 1. 處理 companies.csv
  if (fs.existsSync(CSV_PATH)) {
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const parsed = parseCSV(csvContent);
    const headers = parsed[0];
    
    const companyList = parsed.slice(1)
      .filter(row => row.length >= headers.length && row[headers.indexOf('company')])
      .map(row => {
        const item = {};
        headers.forEach((h, idx) => {
          item[h.trim()] = (row[idx] || '').trim();
        });
        return item;
      });

    const jsContent = `// 自動產生的公司清單，共 ${companyList.length} 筆\nexport const companies = ${JSON.stringify(companyList, null, 2)};\n`;
    fs.writeFileSync(path.join(OUT_DIR, 'companies.js'), jsContent, 'utf-8');
    console.log(`✓ 成功轉換 ${companyList.length} 筆公司資料至 src/data/companies.js`);
  } else {
    console.error(`✗ 找不到 companies.csv：${CSV_PATH}`);
  }

  // 2. 處理 all_topics.json
  if (fs.existsSync(ALL_TOPICS_PATH)) {
    const rawTopics = fs.readFileSync(ALL_TOPICS_PATH, 'utf-8');
    // 直接將 JSON 封裝為 ES Module
    const jsContent = `// 自動產生的主題供應鏈資料\nexport const allTopics = ${rawTopics};\n`;
    fs.writeFileSync(path.join(OUT_DIR, 'topics.js'), jsContent, 'utf-8');
    console.log('✓ 成功轉換主題資料至 src/data/topics.js');
  } else {
    console.error(`✗ 找不到 all_topics.json：${ALL_TOPICS_PATH}`);
  }

  console.log('資料預處理完成！');
}

process();
