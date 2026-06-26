import { useState } from 'react';
import { CATEGORY_MAP } from './Header.jsx';

const INITIAL_COUNT = 8;

export const TopicGrid = ({ allTopics, selectedCategory, onSelectTopic, searchQuery }) => {
  const [showAll, setShowAll] = useState(false);

  const filteredTopics = Object.values(allTopics).filter(topic => {
    const matchCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchSearch = !searchQuery.trim() ||
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (topic.subtitle && topic.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const visibleTopics = showAll ? filteredTopics : filteredTopics.slice(0, INITIAL_COUNT);

  const getCategoryClass = (cat) => {
    switch (cat) {
      case 'hw': return 'badge-blue';
      case 'sw': return 'badge-purple';
      case 'energy': return 'badge-green';
      case 'health': return 'badge-red';
      case 'fin': return 'badge-yellow';
      default: return '';
    }
  };

  return (
    <div className="topic-grid-wrapper">
      {filteredTopics.length === 0 ? (
        <div className="no-results glass-card">
          <p>找不到符合條件的產業主題，請嘗試其他關鍵字。</p>
        </div>
      ) : (
        <>
        <div className="topic-grid">
          {visibleTopics.map(topic => {
            const nodes = topic.nodes || [];
            const lockpointCount = nodes.filter(n => n.single && n.single !== 'null' && n.single !== '').length;
            const twCount = nodes.flatMap(n => n.companies || []).filter(c => c.country?.toUpperCase() === 'TW').length;

            return (
              <div
                key={topic.id}
                className="topic-card glass-card"
                onClick={() => onSelectTopic(topic.id)}
              >
                <div className="card-header">
                  <span className={`badge ${getCategoryClass(topic.category)}`}>
                    {CATEGORY_MAP[topic.category] || topic.category}
                  </span>
                  <span className="last-update">
                    {topic.last_update ? `更新: ${topic.last_update}` : ''}
                  </span>
                </div>

                <div className="card-body">
                  <h3 className="topic-title">{topic.title}</h3>
                  <p className="topic-subtitle">{topic.subtitle}</p>
                </div>

                <div className="card-footer">
                  <div className="meta-item signal-red">
                    <span className="signal-dot red-dot">⚠</span>
                    <span>鎖喉點 {lockpointCount} 個</span>
                  </div>
                  <div className="meta-item signal-blue">
                    <span>🇹🇼</span>
                    <span>台廠 {twCount} 家</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredTopics.length > INITIAL_COUNT && (
          <div className="show-more-row">
            <button className="btn btn-show-more" onClick={() => setShowAll(v => !v)}>
              {showAll ? `▲ 收合` : `▼ 展開全部 ${filteredTopics.length} 個主題`}
            </button>
          </div>
        )}
        </>
      )}

      <style>{`
        .topic-grid-wrapper { width: 100%; }
        .topic-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .topic-card {
          padding: 22px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 210px;
        }
        .topic-card:hover { border-color: rgba(255,255,255,0.18); box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .last-update { font-size: 0.72rem; color: var(--text-muted); }
        .topic-title {
          font-size: 1.1rem; font-weight: 600; margin-bottom: 6px;
          line-height: 1.4; color: var(--text-primary); transition: color var(--transition-fast);
        }
        .topic-card:hover .topic-title { color: var(--accent-blue); }
        .topic-subtitle {
          font-size: 0.82rem; color: var(--text-secondary); line-height: 1.55;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; text-overflow: ellipsis;
        }
        .card-body { flex-grow: 1; margin-bottom: 14px; }
        .card-footer {
          display: flex; gap: 16px;
          border-top: 1px solid rgba(255,255,255,0.04);
          padding-top: 14px; font-size: 0.78rem;
        }
        .meta-item { display: flex; align-items: center; gap: 5px; }
        .signal-red { color: var(--accent-red); }
        .signal-blue { color: var(--accent-blue); }
        .red-dot { font-size: 0.7rem; }
        .show-more-row { display: flex; justify-content: center; margin-top: 24px; }
        .btn-show-more {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-secondary); padding: 10px 32px; border-radius: 8px;
          cursor: pointer; font-size: 0.85rem; transition: all var(--transition-fast);
        }
        .btn-show-more:hover { border-color: var(--accent-blue); color: var(--accent-blue); box-shadow: var(--neon-glow-blue); }
        .no-results { padding: 60px; text-align: center; color: var(--text-secondary); }
      `}</style>
    </div>
  );
};
