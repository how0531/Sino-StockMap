import React from 'react';
import { CAT } from '../config.js';

export default function TopicCard({ t }) {
  const cfg = CAT[t.category] || { zh: t.category, c: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
  const nodeCount = (t.nodes || []).length;
  const coCount   = (t.nodes || []).reduce((s, n) => s + (n.companies || []).length, 0);
  const hasMono   = (t.nodes || []).some(n => n.competition === 'monopoly');

  return (
    <a href={`#topic/${t.id}`} className="topic-card">
      <span className="topic-badge" style={{ background: cfg.bg, color: cfg.c }}>{cfg.zh}</span>
      <div className="topic-name">{t.tab || t.title}</div>
      <div className="topic-sub">{t.subtitle || ''}</div>
      <div className="topic-footer">
        <span className="topic-stat"><strong>{nodeCount}</strong> 節點</span>
        <span className="topic-stat"><strong>{coCount}</strong> 公司</span>
        {hasMono && <span className="mono-tag">⚠ 含獨佔節點</span>}
      </div>
    </a>
  );
}
