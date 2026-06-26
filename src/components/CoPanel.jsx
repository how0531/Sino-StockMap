import React from 'react';
import { COMP, FLAGS } from '../config.js';

export default function CoPanel({ node, onClose }) {
  if (!node) return null;
  const cp  = COMP[node.competition];
  const cos = node.companies || [];
  const hasSole = node.single && node.single !== 'null' && node.single.trim();
  const hasAnalysis = node.analysis && node.analysis !== 'null' && node.analysis.trim();

  return (
    <div className="co-panel">
      <div className="co-panel-hdr">
        <span className="co-panel-title">{node.name}</span>
        {cp && (
          <span className="badge" style={{ background: cp.bg, color: cp.c, marginLeft: 4 }}>{cp.zh}</span>
        )}
        <button className="co-close" onClick={onClose} title="關閉">✕</button>
      </div>

      {node.desc && node.desc !== 'null' && (
        <div className="co-desc">{node.desc}</div>
      )}
      {hasSole && (
        <div className="co-sole">⚠ {node.single}</div>
      )}
      {hasAnalysis && (
        <div className="co-analysis">{node.analysis}</div>
      )}

      {cos.length > 0 ? (
        <div className="table-wrap">
          <table className="co-table">
            <thead>
              <tr>
                <th>公司</th>
                <th>Ticker</th>
                <th>國別</th>
                <th>市佔 / 份額</th>
                <th>主要產品</th>
                <th>備註</th>
                <th>來源</th>
              </tr>
            </thead>
            <tbody>
              {cos.map((co, i) => {
                const flag = FLAGS[co.country] || '';
                const hasTicker = co.ticker && co.ticker !== '—';
                return (
                  <tr key={i}>
                    <td className="co-name-cell">{flag} {co.name}</td>
                    <td>{hasTicker ? <span className="ticker">{co.ticker}</span> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td>{co.country || '—'}</td>
                    <td>{co.share || '—'}</td>
                    <td>{co.products || '—'}</td>
                    <td><div className="co-note">{co.note || ''}</div></td>
                    <td>
                      {co.src
                        ? <a className="co-src" href={co.src} target="_blank" rel="noopener noreferrer">來源↗</a>
                        : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '16px 18px', color: 'var(--text3)' }}>無公司資料</div>
      )}

      {(node.sources || []).length > 0 && (
        <div className="co-srcs">
          {node.sources.map((s, i) => (
            <a key={i} className="ref-link" href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}↗
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
