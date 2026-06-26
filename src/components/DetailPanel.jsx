import React from 'react';
import { X, ExternalLink, ShieldAlert, Award, TrendingUp, DollarSign, Activity } from 'lucide-react';

export const DetailPanel = ({ nodeData, onClose }) => {
  if (!nodeData) return null;

  const { 
    name, 
    nameEn, 
    competition, 
    single, 
    desc, 
    marketSize, 
    growth, 
    analysis, 
    companies = [] 
  } = nodeData;

  // 取得國別中文對照與樣式
  const getCountryBadge = (country = '') => {
    const code = country.toUpperCase().trim();
    const map = {
      TW: { name: '台灣 🇹🇼', class: 'badge-blue' },
      US: { name: '美國 🇺🇸', class: 'badge-purple' },
      CN: { name: '中國 🇨🇳', class: 'badge-red' },
      JP: { name: '日本 🇯🇵', class: 'badge-yellow' },
      KR: { name: '韓國 🇰🇷', class: 'badge-purple' },
      EU: { name: '歐洲 🇪🇺', class: 'badge-blue' },
      SG: { name: '新加坡 🇸🇬', class: 'badge-green' },
      NL: { name: '荷蘭 🇳🇱', class: 'badge-blue' },
      DE: { name: '德國 🇩🇪', class: 'badge-blue' },
      CH: { name: '瑞士 🇨🇭', class: 'badge-blue' },
      AS: { name: '澳洲 🇦🇺', class: 'badge-yellow' },
      UK: { name: '英國 🇬🇧', class: 'badge-purple' },
      FR: { name: '法國 🇫🇷', class: 'badge-blue' },
    };
    
    const item = map[code] || { name: country, class: '' };
    return <span className={`badge ${item.class}`}>{item.name}</span>;
  };

  // 渲染可點擊的個股 Ticker
  const renderTickerBadges = (tickerStr) => {
    if (!tickerStr || tickerStr === '—') return null;
    
    const tickers = tickerStr.split('/').map(t => t.trim()).filter(Boolean);
    
    return (
      <div className="ticker-badge-group">
        {tickers.map((ticker, idx) => {
          // 過濾非實際個股 ticker 內容（如 Capture/未上市等中文字眼，Ticker 通常只包含字母、數字、點與減號）
          const isActualTicker = /^[a-zA-Z0-9.\-_:]+$/.test(ticker);
          if (!isActualTicker) {
            return <span key={idx} className="ticker-badge text-muted">{ticker}</span>;
          }
          
          return (
            <a 
              key={idx}
              href={`https://tw.stock.yahoo.com/quote/${ticker}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ticker-badge-link"
              title={`前往 Yahoo 奇摩股市查看 ${ticker}`}
              onClick={(e) => e.stopPropagation()} // 防止觸發行選取
            >
              {ticker}
            </a>
          );
        })}
      </div>
    );
  };

  // 取得競爭格局中文
  const getCompetitionText = (comp) => {
    switch (comp) {
      case 'monopoly': return '獨占 / 壟斷';
      case 'duopoly': return '雙雄割據';
      case 'oligopoly': return '均勢寡占';
      case 'perfect': return '充分競爭';
      default: return comp || '未分類';
    }
  };
  return (
    <div className="detail-panel-overlay">
      <div className="detail-panel glass-card">
        {/* 面板頭部 */}
        <div className="panel-header">
          <div>
            <h3>{name}</h3>
            <span className="panel-subtitle">{nameEn}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 面板內容區 */}
        <div className="panel-content">
          
          {/* 鎖喉防禦點警示 */}
          {single && single !== 'null' && (
            <div className="alert-box glass-card neon-border-red">
              <ShieldAlert className="alert-icon text-red pulse-glow" />
              <div>
                <h5 className="text-red">關鍵卡脖子點 / 獨家技術分析</h5>
                <p className="alert-text">{single}</p>
              </div>
            </div>
          )}

          {/* 節點基本特徵指標 */}
          <div className="stats-row">
            <div className="small-stat-card glass-card">
              <Activity className="stat-card-icon text-blue" />
              <div>
                <span className="label">競爭格局</span>
                <span className="value">{getCompetitionText(competition)}</span>
              </div>
            </div>

            {marketSize && marketSize !== 'null' && (
              <div className="small-stat-card glass-card">
                <DollarSign className="stat-card-icon text-yellow" />
                <div>
                  <span className="label">市場規模</span>
                  <span className="value">{marketSize}</span>
                </div>
              </div>
            )}

            {growth && growth !== 'null' && (
              <div className="small-stat-card glass-card">
                <TrendingUp className="stat-card-icon text-green" />
                <div>
                  <span className="label">市場成長性</span>
                  <span className="value">{growth}</span>
                </div>
              </div>
            )}
          </div>

          {/* 深度分析說明 */}
          {desc && desc !== 'null' && (
            <div className="section-block">
              <h4>環節簡介</h4>
              <p className="section-desc">{desc}</p>
            </div>
          )}

          {analysis && analysis !== 'null' && (
            <div className="section-block">
              <h4>深度鏈路分析</h4>
              <p className="section-analysis">{analysis}</p>
            </div>
          )}

          {/* 廠商列表區塊 */}
          <div className="section-block">
            <h4>涵蓋廠商明細 <span className="item-count">({companies.length})</span></h4>
            {companies.length === 0 ? (
              <p className="no-companies">本節點尚無登錄的具體廠商。</p>
            ) : (
              <div className="company-table-container">
                <table className="company-table">
                  <thead>
                    <tr>
                      <th>公司名稱 / 代碼</th>
                      <th>國別</th>
                      <th>市佔 / 地位</th>
                      <th>主營產品 / 備註</th>
                      <th>第一手來源</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((comp, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="comp-name-cell">
                            <span className="comp-name-zh">{comp.name}</span>
                            {renderTickerBadges(comp.ticker)}
                          </div>
                        </td>
                        <td>{getCountryBadge(comp.country)}</td>
                        <td className="comp-share">{comp.share || '—'}</td>
                        <td className="comp-products-note">
                          <div className="products-text">{comp.products}</div>
                          {comp.note && <div className="note-text">{comp.note}</div>}
                        </td>
                        <td>
                          {comp.src && comp.src.startsWith('http') ? (
                            <a 
                              href={comp.src} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="src-link"
                            >
                              <ExternalLink size={14} /> 來源
                            </a>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .detail-panel-overlay {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 650px;
          background: transparent;
          z-index: 2000;
          pointer-events: none; /* 允許點擊穿透到遮罩底層 */
        }
        .detail-panel {
          position: absolute;
          top: 16px;
          right: 16px;
          bottom: 16px;
          left: 16px;
          border-radius: 16px;
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          pointer-events: auto; /* 面板內恢復滑鼠事件 */
          animation: slideIn var(--transition-normal) forwards;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(105%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .panel-header {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .panel-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--accent-blue);
        }
        .panel-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: block;
          margin-top: 2px;
        }
        .retail-tip-box {
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .retail-tip-box h5 {
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .retail-tip-text {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }
        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        /* 警示盒 */
        .alert-box {
          display: flex;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(255, 69, 0, 0.04);
        }
        .alert-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .alert-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-top: 4px;
        }
        .text-red {
          color: var(--accent-red);
        }
        
        /* 小統計卡 */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
        }
        .small-stat-card {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .stat-card-icon {
          width: 20px;
          height: 20px;
        }
        .small-stat-card .label {
          font-size: 0.72rem;
          color: var(--text-muted);
          display: block;
        }
        .small-stat-card .value {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        /* 區塊模組 */
        .section-block h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          border-left: 3px solid var(--accent-blue);
          padding-left: 10px;
          margin-bottom: 12px;
        }
        .section-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .section-analysis {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.6;
          white-space: pre-line; /* 保留換行 */
        }
        .item-count {
          color: var(--text-muted);
          font-weight: normal;
          font-size: 0.8rem;
        }
        
        /* 表格樣式 */
        .company-table-container {
          overflow-x: auto;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.1);
        }
        .company-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.85rem;
        }
        .company-table th {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-muted);
          font-weight: 500;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .company-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          vertical-align: top;
        }
        .company-table tr:last-child td {
          border-bottom: none;
        }
        .comp-name-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .comp-name-zh {
          font-weight: 600;
          color: var(--text-primary);
        }
        .comp-share {
          font-weight: 500;
          color: var(--accent-blue);
        }
        .comp-products-note {
          max-width: 250px;
        }
        .products-text {
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .note-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
          line-height: 1.4;
        }
        .ticker-badge-group {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 4px;
        }
        .ticker-badge-link {
          font-size: 0.7rem;
          background: rgba(0, 191, 255, 0.1);
          border: 1px solid var(--accent-blue);
          color: var(--accent-blue);
          padding: 2px 6px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          transition: all var(--transition-fast);
          display: inline-flex;
          align-items: center;
        }
        .ticker-badge-link:hover {
          background: var(--accent-blue);
          color: var(--bg-deep);
          box-shadow: var(--neon-glow-blue);
          transform: translateY(-1.5px);
        }
        .src-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--accent-blue);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .src-link:hover {
          color: var(--accent-purple);
          text-decoration: underline;
        }
        .no-companies {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
