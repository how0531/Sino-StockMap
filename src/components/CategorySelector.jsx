import React from 'react';
import { CATEGORY_MAP } from './Header.jsx';

export const CategorySelector = ({ allTopics, selectedCategory, onSelectCategory }) => {
  // 計算各分類的主題數量
  const counts = { all: Object.keys(allTopics).length };
  Object.values(allTopics).forEach(topic => {
    const cat = topic.category;
    counts[cat] = (counts[cat] || 0) + 1;
  });

  const categories = Object.keys(CATEGORY_MAP);

  return (
    <div className="category-selector-wrapper">
      <div className="category-scroll-container">
        {categories.map(cat => {
          const isActive = selectedCategory === cat;
          const count = counts[cat] || 0;
          
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`category-tab glass-card ${isActive ? 'active' : ''}`}
            >
              <span className="category-label">{CATEGORY_MAP[cat]}</span>
              <span className={`category-count-badge ${isActive ? 'active-badge' : ''}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        .category-selector-wrapper {
          margin-bottom: 32px;
          position: relative;
        }
        .category-scroll-container {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 4px 4px 12px 4px;
          scrollbar-width: thin;
        }
        .category-tab {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          border-radius: 20px;
          transition: all var(--transition-fast);
        }
        .category-tab:hover {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-1px);
        }
        .category-tab.active {
          background: linear-gradient(135deg, hsla(200, 100%, 60%, 0.1) 0%, hsla(270, 95%, 68%, 0.1) 100%);
          border-color: var(--accent-blue);
          box-shadow: var(--neon-glow-blue);
        }
        .category-label {
          color: var(--text-primary);
        }
        .category-tab:not(.active) .category-label {
          color: var(--text-secondary);
        }
        .category-tab:hover .category-label {
          color: var(--text-primary);
        }
        .category-count-badge {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          transition: all var(--transition-fast);
        }
        .category-count-badge.active-badge {
          background: var(--accent-blue);
          color: var(--bg-deep);
        }
      `}</style>
    </div>
  );
};
