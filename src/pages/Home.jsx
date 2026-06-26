import React, { useState, useMemo } from 'react';
import { CAT } from '../config.js';
import TopicCard from '../components/TopicCard.jsx';

function buildCatStats(topics) {
  const s = {};
  topics.forEach(t => {
    if (!s[t.category]) s[t.category] = { n: 0, nodes: 0, cos: 0 };
    s[t.category].n++;
    (t.nodes || []).forEach(n => {
      s[t.category].nodes++;
      s[t.category].cos += (n.companies || []).length;
    });
  });
  return s;
}

function searchAll(topics, q) {
  const lq = q.toLowerCase();
  const ts = topics.filter(t =>
    t.title.toLowerCase().includes(lq) ||
    (t.tab || '').toLowerCase().includes(lq) ||
    (t.subtitle || '').toLowerCase().includes(lq)
  ).slice(0, 8);

  const cs = [];
  outer: for (const t of topics) {
    for (const n of (t.nodes || [])) {
      for (const co of (n.companies || [])) {
        if ((co.name || '').toLowerCase().includes(lq) ||
            (co.ticker || '').toLowerCase().includes(lq)) {
          cs.push({ t, n, co });
          if (cs.length >= 12) break outer;
        }
      }
    }
  }
  return { ts, cs };
}

export default function Home({ topics }) {
  const [q, setQ] = useState('');

  const catStats = useMemo(() => buildCatStats(topics), [topics]);

  const totals = useMemo(() => ({
    topics: topics.length,
    nodes: topics.reduce((s, t) => s + (t.nodes || []).length, 0),
    cos: topics.reduce((s, t) => s + (t.nodes || []).reduce((ss, n) => ss + (n.companies || []).length, 0), 0),
  }), [topics]);

  const results = useMemo(() => q.length >= 1 ? searchAll(topics, q) : null, [topics, q]);

  // Featured: mix of hw + sw + energy
  const featured = useMemo(() => [
    ...topics.filter(t => t.category === 'hw').slice(0, 3),
    ...topics.filter(t => t.category === 'sw').slice(0, 2),
    ...topics.filter(t => t.category === 'energy').slice(0, 1),
  ], [topics]);

  return (
    <div className="page">
      <div className="hero">
        <h1 className="hero-title">
          EE Semi <span className="accent">產業地圖知識館</span>
        </h1>
        <p className="hero-sub">
          涵蓋半導體、AI、能源、生技等 {totals.topics} 條供應鏈<br />
          追蹤獨佔節點與 {totals.cos.toLocaleString()} 筆關鍵廠商資料
        </p>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">{totals.topics}</div>
            <div className="hero-stat-lbl">產業主題</div>
          </div>
          <div>
            <div className="hero-stat-num">{totals.nodes}</div>
            <div className="hero-stat-lbl">供應鏈節點</div>
          </div>
          <div>
            <div className="hero-stat-num">{totals.cos.toLocaleString()}</div>
            <div className="hero-stat-lbl">公司紀錄</div>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="搜尋主題、公司名稱或 ticker..."
          value={q}
          onChange={e => setQ(e.target.value)}
          autoComplete="off"
        />
        <svg className="search-bar-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
        </svg>
      </div>

      {results && (results.ts.length > 0 || results.cs.length > 0) && (
        <div className="search-results" style={{ maxWidth: 580, margin: '0 auto 32px' }}>
          {results.ts.length > 0 && (
            <>
              <div className="sr-section-hdr">主題 ({results.ts.length})</div>
              {results.ts.map(t => {
                const cfg = CAT[t.category] || {};
                return (
                  <a key={t.id} className="sr-item" href={`#topic/${t.id}`} onClick={() => setQ('')}>
                    <div className="sr-item-title">{t.tab || t.title}</div>
                    <div className="sr-item-meta" style={{ color: cfg.c }}>{cfg.zh}</div>
                  </a>
                );
              })}
            </>
          )}
          {results.cs.length > 0 && (
            <>
              <div className="sr-section-hdr">公司 ({results.cs.length})</div>
              {results.cs.map(({ t, n, co }, i) => (
                <a key={i} className="sr-item" href={`#topic/${t.id}`} onClick={() => setQ('')}>
                  <div className="sr-item-title">
                    {co.name}
                    {co.ticker && co.ticker !== '—' && (
                      <span className="ticker" style={{ marginLeft: 6 }}>{co.ticker}</span>
                    )}
                  </div>
                  <div className="sr-item-meta">{t.tab || t.id} › {n.name}</div>
                </a>
              ))}
            </>
          )}
        </div>
      )}

      {results && results.ts.length === 0 && results.cs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '16px 0 32px', color: 'var(--text3)' }}>
          未找到「{q}」的相關結果
        </div>
      )}

      <div className="section-hdr">按產業分類</div>
      <div className="cat-grid">
        {Object.entries(CAT).map(([id, cfg]) => {
          const s = catStats[id] || {};
          return (
            <a key={id} href={`#category/${id}`} className="cat-card" style={{ borderLeftColor: cfg.c }}>
              <div className="cat-name" style={{ color: cfg.c }}>{cfg.zh}</div>
              <div className="cat-en">{cfg.en}</div>
              <div className="cat-counts">
                <span className="cat-count"><strong>{s.n || 0}</strong> 主題</span>
                <span className="cat-count"><strong>{s.nodes || 0}</strong> 節點</span>
                <span className="cat-count"><strong>{(s.cos || 0).toLocaleString()}</strong> 公司</span>
              </div>
            </a>
          );
        })}
      </div>

      <div className="section-hdr" style={{ marginTop: 8 }}>精選主題</div>
      <div className="topics-grid">
        {featured.map(t => <TopicCard key={t.id} t={t} />)}
      </div>
    </div>
  );
}
