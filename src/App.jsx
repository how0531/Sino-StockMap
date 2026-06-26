import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { CategorySelector } from './components/CategorySelector.jsx';
import { TopicGrid } from './components/TopicGrid.jsx';
import { SupplyChainMap } from './components/SupplyChainMap.jsx';
import { parseCSV } from './utils/csvParser.js';

// 靜態導入 JSON 與 CSV (利用 Vite 的 raw loader 讀取 CSV 內容)
import allTopics from '../outputs/all_topics.json';
import companiesCSV from '../outputs/companies.csv?raw';

export const App = () => {
  // normalize: JSON 匯入為陣列，轉成以 id 為 key 的 map
  const topicsArr = Array.isArray(allTopics) ? allTopics : Object.values(allTopics || {});
  const topics = Object.fromEntries(topicsArr.map(t => [t.id, t]));

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 閃爍高亮定位的節點 ID
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);

  // 解析後的公司陣列
  const [companies, setCompanies] = useState([]);

  // 在組件載入時，直接在前端解析 CSV
  useEffect(() => {
    if (companiesCSV) {
      const parsed = parseCSV(companiesCSV);
      setCompanies(parsed);
    }
  }, []);

  // 當選擇了某個主題時，取得該主題的完整資料
  const currentTopicData = selectedTopicId ? topics[selectedTopicId] : null;

  // 取得目前選擇節點的完整資料
  const currentNodeData = (currentTopicData && selectedNodeId && currentTopicData.nodes)
    ? currentTopicData.nodes.find(n => n.id === selectedNodeId)
    : null;

  // 返回主頁大盤
  const handleBackToMain = () => {
    setSelectedTopicId(null);
    setSelectedNodeId(null);
    setHighlightedNodeId(null);
    setSearchQuery('');
  };

  // 全域搜尋跳轉到特定主題的特定節點
  const handleNavigateToTopicNode = (topicId, nodeId) => {
    setSelectedTopicId(topicId);
    if (nodeId) {
      setSelectedNodeId(nodeId);
      setHighlightedNodeId(nodeId);
      
      // 3 秒後移除高亮閃爍動畫，保留選取狀態
      setTimeout(() => {
        setHighlightedNodeId(null);
      }, 3000);
    } else {
      setSelectedNodeId(null);
      setHighlightedNodeId(null);
    }
  };

  return (
    <div className="app-container">
      {/* 導覽列與數據面板 */}
      <Header 
        allTopics={topics} 
        companies={companies}
        selectedTopic={currentTopicData}
        onBack={handleBackToMain}
        onNavigateToTopicNode={handleNavigateToTopicNode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 主要內容區 */}
      <main className="main-content-layout">
        {!currentTopicData ? (
          /* 1. 主頁面：類別篩選器 + 主題卡片網格 */
          <div className="main-dashboard-view">
            <CategorySelector 
              allTopics={topics}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            <TopicGrid 
              allTopics={topics}
              selectedCategory={selectedCategory}
              onSelectTopic={(id) => handleNavigateToTopicNode(id, null)}
              searchQuery={searchQuery}
            />
          </div>
        ) : (
          /* 2. 供應鏈地圖模式 */
          <div className="main-map-view">
            <SupplyChainMap 
              topicData={currentTopicData}
              highlightedNodeId={highlightedNodeId}
            />
          </div>
        )}
      </main>

      <style>{`
        .app-container {
          max-width: 1600px;
          width: 95%;
          margin: 0 auto;
          padding: 0 24px 60px 24px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .main-content-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .main-dashboard-view, .main-map-view {
          width: 100%;
          animation: fadeIn var(--transition-normal) forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
