import React, { useState, useCallback } from 'react';
import { CAT, COMP } from '../config.js';
import SupplyChain from '../components/SupplyChain.jsx';
import CoPanel from '../components/CoPanel.jsx';

export default function Topic({ topic }) {
  const [activeNode, setActiveNode] = useState(null);

  const handleNodeClick = useCallback((node) => {
    setActiveNode(prev => prev?.id === node.id ? null : node);
  }, []);

  const handleClose = useCallback(() => setActiveNode(null), []);

  if (!topic) {
    return <div className="page"><p className="empty">找不到此主題</p></div>;
  }

  const cfg = CAT[topic.category] || { zh: topic.category, c: '#6b7280', bg: 'rgba(107,114,128,0.1)' };

  return (
    <div className="page-wide">
      <div className="breadcrumb">
        <a href="#">首頁</a>
        {' › '}
        <a href={`#category/${topic.category}`}>{cfg.zh}</a>
        {' › '}
        {topic.tab || topic.id}
      </div>

      <span className="badge" style={{ background: cfg.bg, color: cfg.c, marginBottom: 12, display: 'inline-flex' }}>
        {cfg.zh}
      </span>
      <div className="page-title">{topic.title}</div>
      {topic.subtitle && <div className="page-sub">{topic.subtitle}</div>}

      <div className="stat-cards">
        {(topic.stats || []).map((s, i) => (
          <div key={i} className={`stat-card${s.hot ? ' hot' : ''}`}>
            <div className="stat-k">{s.k}</div>
            <div className={`stat-v${s.hot ? ' hot' : ''}`}>{s.v}</div>
            {s.sub && <div className="stat-sub">{s.sub}</div>}
          </div>
        ))}
      </div>

      <SupplyChain
        topic={topic}
        activeNodeId={activeNode?.id || null}
        onNodeClick={handleNodeClick}
      />

      {activeNode && (
        <CoPanel node={activeNode} onClose={handleClose} />
      )}

      <div style={{ height: 48 }} />
    </div>
  );
}
