import React, { useState, useMemo } from 'react';
import { CAT } from '../config.js';
import TopicCard from '../components/TopicCard.jsx';

export default function Topics({ topics, cat }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    let list = cat ? topics.filter(t => t.category === cat) : topics;
    if (q) {
      const lq = q.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(lq) ||
        (t.tab || '').toLowerCase().includes(lq) ||
        (t.subtitle || '').toLowerCase().includes(lq)
      );
    }
    return list;
  }, [topics, cat, q]);

  const catCounts = useMemo(() => {
    const m = {};
    topics.forEach(t => { m[t.category] = (m[t.category] || 0) + 1; });
    return m;
  }, [topics]);

  const title = cat ? (CAT[cat]?.zh || cat) : '所有主題';

  return (
    <div className="page">
      <h2 className="page-h2">
        {title}
        <span className="text-count">{filtered.length} 個主題</span>
      </h2>

      <div className="filter-row">
        <button
          className={`filter-btn${!cat ? ' active' : ''}`}
          style={!cat ? { background: '#1d4ed8', borderColor: '#3b82f6', color: '#fff' } : {}}
          onClick={() => { location.hash = 'topics'; }}
        >
          全部 ({topics.length})
        </button>
        {Object.entries(CAT).map(([id, cfg]) => (
          <button
            key={id}
            className={`filter-btn${cat === id ? ' active' : ''}`}
            style={cat === id
              ? { background: `${cfg.c}22`, borderColor: cfg.c, color: cfg.c }
              : {}}
            onClick={() => { location.hash = `category/${id}`; }}
          >
            {cfg.zh} ({catCounts[id] || 0})
          </button>
        ))}

        <div className="filter-search">
          <svg className="filter-search-icon" width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            type="text"
            placeholder="篩選主題名稱..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">無符合條件的主題</div>
      ) : (
        <div className="topics-grid">
          {filtered.map(t => <TopicCard key={t.id} t={t} />)}
        </div>
      )}
    </div>
  );
}
