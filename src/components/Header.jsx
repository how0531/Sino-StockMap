import React, { useState, useEffect, useRef } from 'react';
import { Search, Database, Layers, Users, Globe, ArrowLeft, Cpu } from 'lucide-react';

export const CATEGORY_MAP = {
  all: '全部主題',
  hw: '硬體與半導體',
  sw: '軟體與人工智慧',
  energy: '能源與電氣化',
  health: '生技醫療與腦機',
  fin: '金融科技',
  industrial: '航太工業與國防'
};

export const Header = ({ 
  allTopics, 
  companies, 
  selectedTopic, 
  onBack, 
  onNavigateToTopicNode,
  searchQuery,
  setSearchQuery
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 計算大盤統計數字
  const totalTopics = Object.keys(allTopics).length;
  let totalNodes = 0;
  Object.values(allTopics).forEach(topic => {
    totalNodes += (topic.nodes || []).length;
  });
  
  // 公司去重
  const uniqueCompanies = new Set(companies.map(c => c.company));
  const totalCompanies = uniqueCompanies.size;

  // 監聽點擊外部以關閉搜尋下拉選單
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 處理搜尋邏輯
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results = [];

    // 1. 搜尋主題標題
    Object.values(allTopics).forEach(topic => {
      if (
        topic.title.toLowerCase().includes(query) || 
        (topic.subtitle && topic.subtitle.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'topic',
          id: topic.id,
          title: topic.title,
          subtitle: CATEGORY_MAP[topic.category] || topic.category,
          topicId: topic.id
        });
      }
    });

    // 2. 搜尋公司名稱、股票代碼、產品
    companies.forEach(c => {
      if (
        c.company.toLowerCase().includes(query) || 
        c.ticker.toLowerCase().includes(query) ||
        (c.products && c.products.toLowerCase().includes(query))
      ) {
        // 避免在同一個節點重複加入相同公司
        const isDup = results.some(r => r.type === 'company' && r.name === c.company && r.topicId === c.topic && r.nodeId === c.node_id);
        if (!isDup) {
          results.push({
            type: 'company',
            name: c.company,
            ticker: c.ticker,
            topicId: c.topic,
            topicTitle: c.topic_title,
            nodeId: c.node_id,
            nodeName: c.node,
            country: c.country
          });
        }
      }
    });

    setSearchResults(results.slice(0, 8)); // 最多顯示 8 筆結果
  }, [searchQuery, allTopics, companies]);

  return (
    <header className="header-container">
      <div className="header-top">
        <div className="logo-section" onClick={selectedTopic ? onBack : undefined} style={{ cursor: selectedTopic ? 'pointer' : 'default' }}>
          <Cpu className="logo-icon animate-pulse" />
          <div>
            <h1>EE-Semi 產業地圖知識館</h1>
            <p className="subtitle">全方位科技產業供應鏈與喉點分析大盤</p>
          </div>
        </div>

        {/* 搜尋欄 */}
        <div className="search-section" ref={dropdownRef}>
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="搜尋主題、關鍵字或全球公司 (如 TSMC, ASML, 鋰電)..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>

          {/* 搜尋下拉選單 */}
          {showDropdown && searchResults.length > 0 && (
            <div className="search-dropdown glass-card">
              {searchResults.map((res, index) => (
                <div 
                  key={index} 
                  className="search-result-item"
                  onClick={() => {
                    if (res.type === 'topic') {
                      onNavigateToTopicNode(res.topicId, null);
                    } else {
                      onNavigateToTopicNode(res.topicId, res.nodeId);
                    }
                    setSearchQuery('');
                    setShowDropdown(false);
                  }}
                >
                  {res.type === 'topic' ? (
                    <div className="res-topic">
                      <Layers className="res-icon topic-color" />
                      <div className="res-details">
                        <span className="res-name">{res.title}</span>
                        <span className="res-meta">主題 • {res.subtitle}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="res-company">
                      <Users className="res-icon company-color" />
                      <div className="res-details">
                        <span className="res-name">
                          {res.name} <span className="ticker-badge">{res.ticker}</span>
                        </span>
                        <span className="res-meta">
                          {res.topicTitle} • {res.nodeName} ({res.country})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 導航按鈕 (地圖模式下顯示) */}
        {selectedTopic && (
          <button className="btn btn-primary back-btn" onClick={onBack}>
            <ArrowLeft size={16} /> 返回大盤
          </button>
        )}
      </div>

      {/* 數據看板 (主頁面顯示) */}
      {!selectedTopic && (
        <div className="dashboard-stats-grid">
          <div className="stat-card glass-card neon-border-blue">
            <Layers className="stat-icon text-blue" />
            <div className="stat-info">
              <span className="stat-value">{totalTopics}</span>
              <span className="stat-label">涵蓋產業主題</span>
            </div>
          </div>
          <div className="stat-card glass-card neon-border-purple">
            <Database className="stat-icon text-purple" />
            <div className="stat-info">
              <span className="stat-value">{totalNodes}</span>
              <span className="stat-label">供應鏈關鍵節點</span>
            </div>
          </div>
          <div className="stat-card glass-card neon-border-green">
            <Users className="stat-icon text-green" />
            <div className="stat-info">
              <span className="stat-value">{totalCompanies}</span>
              <span className="stat-label">全球鏈結廠商</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .header-container {
          padding: 24px 0 16px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 24px;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          color: var(--accent-blue);
        }
        .logo-section h1 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, var(--text-primary) 30%, var(--accent-blue) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .logo-section .subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .search-section {
          position: relative;
          flex: 1;
          max-width: 500px;
          min-width: 280px;
        }
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          width: 18px;
          height: 18px;
        }
        .search-section input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 12px 16px 12px 42px;
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: all var(--transition-fast);
        }
        .search-section input:focus {
          border-color: var(--accent-blue);
          box-shadow: var(--neon-glow-blue);
          background: rgba(255, 255, 255, 0.07);
          outline: none;
        }
        .clear-btn {
          position: absolute;
          right: 14px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.2rem;
          cursor: pointer;
        }
        .clear-btn:hover {
          color: var(--text-primary);
        }
        .search-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          max-height: 380px;
          overflow-y: auto;
          z-index: 1000;
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .search-result-item {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .search-result-item:last-child {
          border-bottom: none;
        }
        .search-result-item:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .res-topic, .res-company {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .res-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
        .res-icon.topic-color { color: var(--accent-blue); }
        .res-icon.company-color { color: var(--accent-purple); }
        .res-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .res-name {
          font-weight: 500;
          font-size: 0.9rem;
        }
        .ticker-badge {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.08);
          padding: 1px 5px;
          border-radius: 3px;
          color: var(--text-secondary);
        }
        .res-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-top: 8px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px 24px;
        }
        .stat-icon {
          width: 32px;
          height: 32px;
        }
        .text-blue { color: var(--accent-blue); }
        .text-purple { color: var(--accent-purple); }
        .text-green { color: var(--accent-green); }
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1.2;
          font-family: 'Outfit', sans-serif;
        }
        .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
      `}</style>
    </header>
  );
};
