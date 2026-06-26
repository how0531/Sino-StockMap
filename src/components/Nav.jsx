import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CAT } from '../config.js';

function searchAll(topics, q) {
  if (!q || q.length < 1) return { ts: [], cs: [] };
  const lq = q.toLowerCase();
  const ts = topics.filter(t =>
    t.title.toLowerCase().includes(lq) ||
    (t.tab || '').toLowerCase().includes(lq) ||
    (t.subtitle || '').toLowerCase().includes(lq)
  ).slice(0, 6);

  const cs = [];
  for (const t of topics) {
    for (const n of (t.nodes || [])) {
      for (const co of (n.companies || [])) {
        if ((co.name || '').toLowerCase().includes(lq) ||
            (co.ticker || '').toLowerCase().includes(lq)) {
          cs.push({ t, n, co });
          if (cs.length >= 8) return { ts, cs };
        }
      }
    }
  }
  return { ts, cs };
}

export default function Nav({ route, topics }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const results = q.length >= 1 ? searchAll(topics, q) : { ts: [], cs: [] };
  const hasResults = results.ts.length > 0 || results.cs.length > 0;

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = useCallback((hash) => {
    location.hash = hash;
    setQ('');
    setOpen(false);
  }, []);

  return (
    <nav className="nav">
      <a href="#" className="nav-brand">EE Semi <span>產業地圖</span></a>
      <span className="nav-sep">|</span>
      <div className="nav-links">
        <a href="#topics" className={`nav-link${route.view==='topics'?' active':''}`}>所有主題</a>
        <a href="#search" className={`nav-link${route.view==='search'?' active':''}`}>公司搜尋</a>
      </div>

      <div className="nav-search" ref={ref}>
        <svg className="nav-search-icon" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
        </svg>
        <input
          className="nav-search-input"
          type="text"
          placeholder="快速搜尋..."
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === 'Escape') { setQ(''); setOpen(false); } }}
        />
        {open && hasResults && (
          <div className="nav-results">
            {results.ts.length > 0 && (
              <>
                <div className="sr-section-hdr">主題</div>
                {results.ts.map(t => {
                  const cfg = CAT[t.category] || {};
                  return (
                    <a key={t.id} className="sr-item" href={`#topic/${t.id}`} onClick={() => { setQ(''); setOpen(false); }}>
                      <div className="sr-item-title">{t.tab || t.title}</div>
                      <div className="sr-item-meta" style={{ color: cfg.c }}>{cfg.zh}</div>
                    </a>
                  );
                })}
              </>
            )}
            {results.cs.length > 0 && (
              <>
                <div className="sr-section-hdr">公司</div>
                {results.cs.map(({ t, n, co }, i) => (
                  <a key={i} className="sr-item" href={`#topic/${t.id}`} onClick={() => { setQ(''); setOpen(false); }}>
                    <div className="sr-item-title">{co.name}{co.ticker && co.ticker !== '—' ? ` · ${co.ticker}` : ''}</div>
                    <div className="sr-item-meta">{t.tab || t.id} › {n.name}</div>
                  </a>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
