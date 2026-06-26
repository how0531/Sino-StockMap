# EE-Semi 產業地圖知識館 & 供應鏈大盤

這個專案包含全站 96 個科技產業主題的完整供應鏈資料，並附帶一個極緻美觀、具備霓虹流光動畫的 **React 互動式供應鏈地圖網站**。

來源網站：https://ee-semi-supply-chain.stingtao.info/ （資料抓取日：2026-06-26）

---

## 🌐 網站使用與啟動指南

本網站基於 **Vite + React + Vanilla CSS** 開發，採用深色太空科技風（Sleek Space Dark Mode）設計。所有的供應鏈 JSON 與 CSV 公司資料皆已被打包至前端 bundle 中，**100% 支援離線直接開啟，無 CORS 限制**。

### 🚀 本地開發啟動
請在專案根目錄執行以下指令：
```bash
# 1. 安裝套件
npm install

# 2. 啟動開發伺服器
npm run dev
```
啟動後在瀏覽器開啟：`http://localhost:5173`。

### 📦 靜態編譯打包 (免伺服器綠色版)
若您需要將網站發佈或離線傳輸，請執行：
```bash
npm run build
```
編譯後的成品將自動輸出至：`outputs/dist/`。
- **無 CORS 限制**：您只需直接以瀏覽器開啟 `outputs/dist/index.html` 即可流暢體驗完整功能，無需部署至伺服器。

---

## 📊 數據總覽 (Data Overview)

- **96 個產業主題**：涵蓋 Hardware (49)、Software & AI (19)、Energy (14)、Healthcare (5)、Fintech (2)、Industrial (7)。
- **838 個供應鏈節點**：標註「鎖喉點/獨占/寡占」競爭格局，含市場規模與成長性分析。
- **4178 筆公司鏈結**：去重後約 3147 家全球企業，含 Ticker、國別、市占、產品及一手來源連結。

---

## 📂 專案目錄結構

```text
├── outputs/                 # 原始數據與編譯成品 (定稿)
│   ├── all_topics.json      # 96個主題的完整原始資料
│   ├── companies.csv        # 攤平的 4178 筆公司明細 (搜尋索引來源)
│   ├── topics/              # 各主題單獨的 JSON 檔案
│   ├── topics_index.csv     # 主題索引清單
│   └── dist/                # [NEW] 網站打包後的靜態成品 (綠色免安裝版)
├── src/                     # [NEW] 網站前端原始碼
│   ├── components/          # Named Export UI 組件
│   │   ├── Header.jsx       # 導覽列與數據看板 (含全域搜尋定位)
│   │   ├── CategorySelector.jsx # 類別篩選器
│   │   ├── TopicGrid.jsx    # 3D 懸停傾斜主題卡片網格
│   │   ├── SupplyChainMap.jsx   # 互動式供應鏈地圖 (CSS Grid & SVG 流光)
│   │   └── DetailPanel.jsx  # 右側滑出廠商詳情抽屜
│   ├── utils/
│   │   └── csvParser.js     # 前端高相容性 CSV 解析器
│   ├── App.jsx              # 全域狀態管理與資料加載
│   ├── main.jsx             # React 入口檔
│   └── index.css            # 科技感深色樣式與霓虹動畫系統
├── package.json             # [NEW] 專案依賴與腳本配置
├── vite.config.js           # [NEW] Vite 打包配置 (輸出至 outputs/dist)
└── README.md                # 本說明文件
```

---

## 🎨 網站亮點特色

1. **互動式供應鏈拓撲**：
   - 地圖以 `rows` 切分上中下游（例如：設備 -> 材料 -> 製造 -> 封測 -> 應用），使用 CSS Grid 網格系統完美還原。
   - 節點間使用 **SVG 霓虹流光導線**（類似電子訊號流動動畫）連接，直覺指引物流與資金流方向。
2. **鎖喉點 (Lockpoint) 視覺警示**：
   - 針對壟斷/獨占（如 ASML、Hanmi、Disco）的關鍵卡脖子節點，採用**紅色呼吸發光環**進行強烈視覺警示。
3. **全域公司搜尋與定位**：
   - 在任何頁面搜尋公司（如 TSMC, BESI, CATL），下拉選單會顯示其所屬主題與節點。
   - 點擊結果後，網站會**自動切換主題，平滑滾動並定位到該節點，進行高亮閃爍**。
4. **極致微交互**：
   - 滑鼠 Hover 節點時，該節點的上下游關聯連線會加粗發光，其餘無關連線和節點淡出，聚焦供應鏈鏈條。
   - 詳情面板以流暢的 Spring 曲線從右側滑入。
