import React, { useMemo } from 'react';
import { COMP } from '../config.js';

function NodeCard({ node, isActive, isDown, isUp, onClick }) {
  const cp      = COMP[node.competition];
  const cc      = (node.companies || []).length;
  const hasSole = node.single && node.single !== 'null' && node.single.trim();
  const mkt     = node.marketSize && node.marketSize !== 'null' ? node.marketSize : '';

  let cls = 'sc-node';
  if (isActive) cls += ' active';
  else if (isDown) cls += ' hl-down';
  else if (isUp)   cls += ' hl-up';

  return (
    <div
      className={cls}
      style={{ gridColumn: `${node.col || 1}/span ${node.span || 1}` }}
      onClick={onClick}
    >
      {hasSole && <div className="sole-badge">獨佔</div>}
      {cp && (
        <div className="node-comp" style={{ background: cp.bg, color: cp.c }}>{cp.zh}</div>
      )}
      <div className="node-name">{node.name}</div>
      <div className="node-meta">
        {mkt && <span>{mkt}</span>}
        {mkt && cc > 0 && <span> · </span>}
        {cc > 0 && <span>{cc} 家公司</span>}
      </div>
    </div>
  );
}

export default function SupplyChain({ topic, activeNodeId, onNodeClick }) {
  const { nodes = [], rows = [], edges = [] } = topic;

  const maxCol = useMemo(
    () => Math.max(...nodes.map(n => (n.col || 1) + (n.span || 1) - 1), 1),
    [nodes]
  );

  const byRow = useMemo(() => {
    const map = {};
    nodes.forEach(n => { (map[n.row] = map[n.row] || []).push(n); });
    return map;
  }, [nodes]);

  const { downSet, upSet } = useMemo(() => {
    const d = new Set(edges.filter(e => e[0] === activeNodeId).map(e => e[1]));
    const u = new Set(edges.filter(e => e[1] === activeNodeId).map(e => e[0]));
    return { downSet: d, upSet: u };
  }, [edges, activeNodeId]);

  if (!nodes.length) return <p className="empty">無節點資料</p>;

  return (
    <div className="sc-section">
      <div className="sc-header">
        <span className="sc-title">📊 供應鏈結構</span>
        <span className="sc-hint">點擊節點查看廠商詳情&nbsp;·&nbsp;橘框=下游&nbsp;·&nbsp;紫框=上游</span>
      </div>

      <div className="sc-legend">
        {Object.entries(COMP).map(([k, v]) => (
          <div key={k} className="sc-legend-item">
            <div className="sc-legend-dot" style={{ background: v.c }} />
            {v.zh}
          </div>
        ))}
      </div>

      {rows.map(row => {
        const rn = (byRow[row.id] || []).slice().sort((a, b) => (a.col || 1) - (b.col || 1));
        if (!rn.length) return null;
        return (
          <div key={row.id} className={`sc-band${row.main ? ' main-row' : ''}`}>
            <div className="sc-band-lbl">{row.label}</div>
            <div className="sc-nodes" style={{ gridTemplateColumns: `repeat(${maxCol}, 1fr)` }}>
              {rn.map(n => (
                <NodeCard
                  key={n.id}
                  node={n}
                  isActive={n.id === activeNodeId}
                  isDown={downSet.has(n.id)}
                  isUp={upSet.has(n.id)}
                  onClick={() => onNodeClick(n)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
