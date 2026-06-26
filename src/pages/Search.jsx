import React, { useState, useMemo } from 'react';
import { FLAGS } from '../config.js';

export default function Search({ topics }) {
  const [q, setQ] = useState('');

  const grouped = useMemo(() => {
    if (!q || q.length < 2) return null;
    const lq = q.toLowerCase();
    const map = new Map();

    for (const t of topics) {
      for (const n of (t.nodes || [])) {
        for (const co of (n.companies || [])) {
          if ((co.name || '').toLowerCase().includes(lq) ||
              (co.ticker || '').toLowerCase().includes(lq)) {
            const key = co.name;
            if (!map.has(key)) map.set(key, { co, apps: [] });
            map.get(key).apps.push({ t, n });
          }
        }
      }
    }
    return map;
  }, [topics, q]);

  return (
    <div className="page">
      <h2 className="page-h2">公司 / Ticker 搜尋</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="輸入公司名稱或 ticker（至少 2 字）..."
          value={q}
          onChange={e => setQ(e.target.value)}
          autoComplete="off"
          autoFocus
        />
        <svg className="search-bar-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
        </svg>
      </div>

      {grouped === null && (
        <p style={{ color: 'var(--text3)', textAlign: 'center', paddingTop: 16 }}>
          輸入至少 2 個字開始搜尋
        </p>
      )}

      {grouped && grouped.size === 0 && (
        <div className="empty">未找到「{q}」的公司</div>
      )}

      {grouped && grouped.size > 0 && (
        <>
          <p style={{ color: 'var(--text3)', marginBottom: 16, fontSize: 13 }}>
            共找到 <strong style={{ color: 'var(--text)' }}>{grouped.size}</strong> 家公司
          </p>
          {[...grouped.values()].map(({ co, apps }, i) => {
            const flag = FLAGS[co.country] || '';
            const hasTicker = co.ticker && co.ticker !== '—';
            return (
              <div key={i} className="co-card">
                <div className="co-card-hdr">
                  <span className="co-flag">{flag}</span>
                  <div className="co-card-info">
                    <span className="co-card-name">{co.name}</span>
                    {hasTicker && <span className="co-card-ticker">{co.ticker}</span>}
                    <div className="co-card-country">{co.country || ''}</div>
                  </div>
                </div>
                {co.products && (
                  <div className="co-card-products">{co.products}</div>
                )}
                {co.note && (
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>{co.note}</div>
                )}
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>
                  出現在 {apps.length} 個節點：
                </div>
                <div className="co-appearances">
                  {apps.map(({ t, n }, j) => (
                    <a key={j} className="co-appear-tag" href={`#topic/${t.id}`}>
                      {t.tab || t.id} › {n.name}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
