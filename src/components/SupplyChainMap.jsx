import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export const SupplyChainMap = ({ topicData, highlightedNodeId }) => {
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  const [onlyChokepoints, setOnlyChokepoints] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const detailRefs = useRef({});

  useEffect(() => {
    if (topicData) {
      setActiveNodeId(null);
      setFocusedNodeId(null);
      setOnlyChokepoints(false);
      setSelectedCountry(null);
    }
  }, [topicData]);

  useEffect(() => {
    if (!highlightedNodeId) return;
    setActiveNodeId(highlightedNodeId);
    setTimeout(() => {
      const el = detailRefs.current[highlightedNodeId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setFocusedNodeId(highlightedNodeId);
        setTimeout(() => setFocusedNodeId(null), 3000);
      }
    }, 200);
  }, [highlightedNodeId]);

  if (!topicData) return null;
  const { title = '', subtitle = '', rows = [], nodes = [] } = topicData;

  // ── Competition config ─────────────────────────────────
  const COMP = {
    monopoly:    { color: '#ef4444', label: '👑 獨佔',   badge: 'badge-red' },
    duopoly:     { color: '#f97316', label: '🔥 雙雄',   badge: 'badge-yellow' },
    oligopoly:   { color: '#eab308', label: '⚔️ 寡佔',  badge: 'badge-yellow' },
    highgrowth:  { color: '#22c55e', label: '🚀 高成長', badge: 'badge-green' },
    emerging:    { color: '#8b5cf6', label: '✨ 新興',   badge: 'badge-purple' },
    competitive: { color: '#64748b', label: '⚙️ 競爭',  badge: '' },
    redocean:    { color: '#4b5563', label: '🌊 紅海',   badge: '' },
    fragmented:  { color: '#6b7280', label: '📊 分散',   badge: '' },
  };
  const getComp = (c) => COMP[c] || { color: '#6b7280', label: c || '', badge: '' };

  // ── Country labels ─────────────────────────────────────
  const COUNTRY_LABELS = {
    TW: '台灣 🇹🇼', US: '美國 🇺🇸', CN: '中國 🇨🇳', JP: '日本 🇯🇵', KR: '韓國 🇰🇷',
    EU: '歐洲 🇪🇺', NL: '荷蘭 🇳🇱', DE: '德國 🇩🇪', CH: '瑞士 🇨🇭', UK: '英國 🇬🇧',
    SG: '新加坡 🇸🇬', FR: '法國 🇫🇷', AT: '奧地利 🇦🇹',
  };
  const getCountryLabel = (c = '') => COUNTRY_LABELS[c.toUpperCase().trim()] || c;

  // ── Helpers ────────────────────────────────────────────
  const isLockpoint = (node) => !!(node.single && node.single !== 'null' && node.single !== '');
  const isTW = (c) => c.country?.toUpperCase() === 'TW' || !!(c.ticker?.includes('.TW'));

  const rowLabel = (row) => {
    let l = row.label || '';
    l = l.split(/[a-zA-Z]/)[0].trim().replace(/[-——\s()]+$/, '');
    return l || row.label || row.id;
  };

  // ── Derived data ───────────────────────────────────────
  const allTwCompanies = nodes.flatMap(n =>
    (n.companies || [])
      .filter(isTW)
      .map(c => ({ ...c, nodeId: n.id }))
  ).filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i);

  const countryStats = (() => {
    const counts = {};
    let total = 0;
    nodes.forEach(n => (n.companies || []).forEach(c => {
      const code = c.country?.toUpperCase().trim() || 'OTHER';
      counts[code] = (counts[code] || 0) + 1;
      total++;
    }));
    if (!total) return [];
    const COLORS = { TW: '#38bdf8', US: '#a78bfa', CN: '#f87171', JP: '#fbbf24', KR: '#a855f7', EU: '#10b981', OTHER: '#6b7280' };
    const NAMES = { TW: '台灣', US: '美國', CN: '中國', JP: '日本', KR: '韓國', EU: '歐洲', OTHER: '其他' };
    return Object.entries(counts)
      .map(([code, count]) => ({
        code, count,
        name: NAMES[code] || code,
        pct: Math.max(2, Math.round(count / total * 100)),
        color: COLORS[code] || '#6b7280',
      }))
      .sort((a, b) => b.count - a.count);
  })();

  const chokepointsCount = nodes.filter(isLockpoint).length;

  const monopolyNodes = nodes.filter(n => n.competition === 'monopoly');
  const tldrWhy = subtitle?.includes('—') ? subtitle.split('—')[1]?.trim() : subtitle;
  const tldrOpportunity = monopolyNodes.length > 0
    ? `核心機會在「${monopolyNodes.slice(0, 2).map(n => n.name).join('、')}」等獨占環節，定價權在廠商手中。`
    : nodes.filter(n => n.competition === 'oligopoly').length > 0
    ? `少數大廠主導，定價秩序穩定，台廠多為直接供應鏈受惠者。`
    : `市場持續擴張，先進者具規模優勢，值得追蹤布局時機。`;

  // ── Filter ─────────────────────────────────────────────
  const filterNode = (node) => {
    if (onlyChokepoints && !isLockpoint(node)) return false;
    if (selectedCountry && !(node.companies || []).some(c => c.country?.toUpperCase() === selectedCountry)) return false;
    return true;
  };

  // ── Navigate (from TW stocks list or search) ───────────
  const gotoNode = (nodeId) => {
    setActiveNodeId(nodeId);
    setTimeout(() => {
      const el = detailRefs.current[nodeId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setFocusedNodeId(nodeId);
        setTimeout(() => setFocusedNodeId(null), 3000);
      }
    }, 180);
  };

  return (
    <div className="sc-page">

      {/* ══ HEADER ══════════════════════════════════════════ */}
      <header className="sc-header glass-card">
        <div className="sc-header-left">
          <span className="sc-tag">RETAIL INSIGHT</span>
          <h2 className="sc-title">{title}</h2>
          <p className="sc-subtitle">{subtitle}</p>
        </div>
        <div className="sc-header-stats">
          <div className="sc-stat">
            <span className="sc-stat-num">{nodes.length}</span>
            <span className="sc-stat-label">製程環節</span>
          </div>
          <div className="sc-stat">
            <span className="sc-stat-num">{nodes.reduce((s, n) => s + (n.companies?.length || 0), 0)}</span>
            <span className="sc-stat-label">全球廠商</span>
          </div>
          <button
            className={`sc-stat sc-stat-choke${onlyChokepoints ? ' active' : ''}`}
            onClick={() => setOnlyChokepoints(v => !v)}
          >
            <span className="sc-stat-num red">{chokepointsCount}</span>
            <span className="sc-stat-label sc-choke-label">
              <ShieldAlert size={11} />
              鎖喉點{onlyChokepoints ? '（篩選中）' : '（點選篩選）'}
            </span>
          </button>
          <div className="sc-stat">
            <span className="sc-stat-num blue">{allTwCompanies.length}</span>
            <span className="sc-stat-label">台灣概念股</span>
          </div>
        </div>
      </header>

      {/* ══ BODY (3-col) ════════════════════════════════════ */}
      <div className="sc-body">

        {/* LEFT: step jumps + filter status */}
        <aside className="sc-left-rail glass-card">
          <div className="sc-rail-title">產業鏈流程</div>
          {rows.map((row, idx) => {
            const rowNodes = nodes.filter(n => n.row === row.id);
            const chokes = rowNodes.filter(isLockpoint).length;
            return (
              <button
                key={row.id}
                className="sc-step-jump"
                onClick={() => document.getElementById(`sc-row-${row.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                <span className="sc-step-num">0{idx + 1}</span>
                <span className="sc-step-name">{rowLabel(row)}</span>
                {chokes > 0 && <span className="sc-step-choke">⚠{chokes}</span>}
              </button>
            );
          })}

          {(onlyChokepoints || selectedCountry) && (
            <button
              className="sc-clear-filter"
              onClick={() => { setOnlyChokepoints(false); setSelectedCountry(null); }}
            >
              ✕ 清除篩選
            </button>
          )}
        </aside>

        {/* CENTER: vertical waterfall flow ─────────────────── */}
        <main className="sc-flow-main">
          {rows.map((row, rowIdx) => {
            const allRowNodes = nodes.filter(n => n.row === row.id);
            const visibleNodes = allRowNodes.filter(filterNode);
            const selectedInRow = allRowNodes.find(n => n.id === activeNodeId);
            const isLast = rowIdx === rows.length - 1;

            return (
              <div key={row.id} id={`sc-row-${row.id}`} className="sc-row">

                {/* Row header */}
                <div className="sc-row-header">
                  <span className="sc-row-step">STEP 0{rowIdx + 1}</span>
                  <span className="sc-row-label">{rowLabel(row)}</span>
                  <span className="sc-row-meta">
                    {allRowNodes.length} 環節
                    {allRowNodes.filter(isLockpoint).length > 0 && (
                      <span className="sc-row-choke">·  ⚠ {allRowNodes.filter(isLockpoint).length} 鎖喉</span>
                    )}
                  </span>
                </div>

                {/* Node cards */}
                <div className="sc-nodes-wrap">
                  {visibleNodes.length === 0 && (
                    <p className="sc-row-empty">此步驟無符合篩選條件的環節</p>
                  )}
                  {visibleNodes.map((node, ni) => {
                    const comp = getComp(node.competition);
                    const lock = isLockpoint(node);
                    const isActive = activeNodeId === node.id;
                    const cos = node.companies || [];
                    return (
                      <button
                        key={node.id}
                        className={`sc-node${isActive ? ' active' : ''}${lock ? ' lock' : ''}`}
                        style={{ '--cc': comp.color }}
                        onClick={() => setActiveNodeId(isActive ? null : node.id)}
                        ref={el => { if (isActive) detailRefs.current[node.id] = el; }}
                      >
                        <div className="sc-node-head">
                          <span className="sc-node-idx">{ni + 1}</span>
                          <span className="sc-node-name">{node.name}</span>
                          {lock && <span className="sc-node-lock">⚠ 鎖喉</span>}
                        </div>
                        {cos.length > 0 && (
                          <div className="sc-node-cos">
                            {cos.slice(0, 6).map((c, i) => (
                              <span key={i} className={`sc-co-tag${isTW(c) ? ' tw' : ''}`}>{c.name}</span>
                            ))}
                            {cos.length > 6 && <span className="sc-co-more">+{cos.length - 6}</span>}
                          </div>
                        )}
                        <div className="sc-node-foot">
                          <span className="sc-node-comp" style={{ color: comp.color }}>{comp.label}</span>
                          <span className="sc-node-hint">點擊看明細</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Inline detail — expands right below this row */}
                {selectedInRow && (() => {
                  const n = selectedInRow;
                  const comp = getComp(n.competition);
                  const lock = isLockpoint(n);
                  const isFocused = focusedNodeId === n.id;
                  return (
                    <div
                      key={`detail-${n.id}`}
                      className={`sc-detail glass-card${isFocused ? ' focused' : ''}`}
                      ref={el => detailRefs.current[n.id] = el}
                    >
                      <div className="sc-detail-head">
                        <div>
                          <h3>{n.name}</h3>
                          {n.nameEn && <span className="sc-detail-en">{n.nameEn}</span>}
                        </div>
                        <span className={`badge ${comp.badge}`}>{comp.label}</span>
                      </div>

                      {lock && n.single !== 'null' && (
                        <div className="sc-choke-box">
                          <ShieldAlert size={13} className="sc-choke-icon" />
                          <span><strong>鎖喉技術：</strong>{n.single}</span>
                        </div>
                      )}

                      {n.analysis && n.analysis !== 'null' && (
                        <div className="sc-analysis">
                          <span className="sc-analysis-tag">💡 散戶秒懂</span>
                          <p>{n.analysis}</p>
                        </div>
                      )}

                      <div className="sc-companies">
                        <div className="sc-companies-title">🏭 關鍵廠商（{n.companies?.length || 0}）</div>
                        <div className="sc-companies-grid">
                          {(n.companies || []).map((c, ci) => (
                            <div key={ci} className={`sc-co glass-card${isTW(c) ? ' tw' : ''}`}>
                              <div className="sc-co-top">
                                <span className="sc-co-name">{c.name}</span>
                                {c.ticker && c.ticker !== '—' && (
                                  <div className="sc-tickers">
                                    {c.ticker.split('/').map(t => t.trim())
                                      .filter(t => /^[a-zA-Z0-9.\-_:]+$/.test(t))
                                      .map((t, ti) => (
                                        <a key={ti} className="sc-ticker"
                                          href={`https://tw.stock.yahoo.com/quote/${t}`}
                                          target="_blank" rel="noopener noreferrer">
                                          📈 {t.split('.')[0]}
                                        </a>
                                      ))}
                                  </div>
                                )}
                              </div>
                              <div className="sc-co-bottom">
                                <span>{getCountryLabel(c.country)}</span>
                                {c.share && <span className="sc-co-share">{c.share}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Flow arrow between rows */}
                {!isLast && (
                  <div className="sc-divider">
                    <div className="sc-div-line" />
                    <span className="sc-div-text">↓ 下游流向</span>
                    <div className="sc-div-line" />
                  </div>
                )}
              </div>
            );
          })}
        </main>

        {/* RIGHT: TW stocks + TL;DR + Geo ──────────────────── */}
        <aside className="sc-right-rail">

          {/* TW stocks */}
          <div className="sc-panel glass-card">
            <div className="sc-panel-hd">🇹🇼 台股概念股速查</div>
            {allTwCompanies.length === 0 ? (
              <p className="sc-empty">暫無直接相關台股</p>
            ) : (
              <div className="sc-tw-list">
                {allTwCompanies.map((c, i) => (
                  <button
                    key={i}
                    className={`sc-tw-item${activeNodeId === c.nodeId ? ' active' : ''}`}
                    onClick={() => gotoNode(c.nodeId)}
                  >
                    <span className="sc-tw-name">{c.name}</span>
                    {c.ticker && <span className="sc-tw-tick">{c.ticker.split('.')[0]}</span>}
                    <ArrowRight size={11} className="sc-tw-arr" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TL;DR */}
          <div className="sc-panel glass-card">
            <div className="sc-panel-hd">⚡ 3 秒投資結論</div>
            <div className="sc-tldr-item">
              <span className="sc-tldr-tag blue">🎯 這在紅什麼</span>
              <p>{tldrWhy || subtitle}</p>
            </div>
            <div className="sc-tldr-item" style={{ marginTop: 10 }}>
              <span className="sc-tldr-tag purple">💰 機會點</span>
              <p>{tldrOpportunity}</p>
            </div>
          </div>

          {/* Geo */}
          {countryStats.length > 0 && (
            <div className="sc-panel glass-card">
              <div className="sc-panel-hd">🌍 地緣勢力分佈</div>
              <div className="sc-geo-bar">
                {countryStats.map((s, i) => (
                  <button
                    key={i}
                    className={`sc-geo-seg${selectedCountry === s.code ? ' sel' : ''}`}
                    style={{ width: `${s.pct}%`, background: s.color }}
                    title={`${s.name}: ${s.count} 家 (${s.pct}%)`}
                    onClick={() => setSelectedCountry(selectedCountry === s.code ? null : s.code)}
                  />
                ))}
              </div>
              <div className="sc-geo-tags">
                {countryStats.slice(0, 7).map((s, i) => (
                  <button
                    key={i}
                    className={`sc-geo-tag${selectedCountry === s.code ? ' sel' : ''}`}
                    onClick={() => setSelectedCountry(selectedCountry === s.code ? null : s.code)}
                  >
                    <span className="sc-geo-dot" style={{ background: s.color }} />
                    {s.name} {s.pct}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <style>{`
        .sc-page { display: flex; flex-direction: column; gap: 16px; animation: fadeIn .3s forwards; }

        /* HEADER */
        .sc-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-left: 3px solid var(--accent-blue); }
        .sc-header-left { flex: 1; min-width: 0; }
        .sc-tag { font-size: 0.65rem; font-weight: 700; letter-spacing: .08em; color: var(--accent-blue); background: rgba(0,191,255,.1); padding: 2px 8px; border-radius: 3px; display: inline-block; margin-bottom: 6px; }
        .sc-title { font-size: 1.35rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; line-height: 1.3; }
        .sc-subtitle { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .sc-header-stats { display: flex; flex-shrink: 0; border-left: 1px solid rgba(255,255,255,.06); }
        .sc-stat { padding: 6px 18px; text-align: center; display: flex; flex-direction: column; gap: 3px; border-right: 1px solid rgba(255,255,255,.06); background: none; border-top: none; border-bottom: none; cursor: default; }
        .sc-stat-choke { cursor: pointer; transition: background var(--transition-fast); }
        .sc-stat-choke:hover { background: rgba(239,68,68,.06); }
        .sc-stat-choke.active { background: rgba(239,68,68,.1); }
        .sc-stat-num { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); font-family: 'Outfit', sans-serif; line-height: 1; }
        .sc-stat-num.red { color: var(--accent-red); }
        .sc-stat-num.blue { color: var(--accent-blue); }
        .sc-stat-label { font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; }
        .sc-choke-label { display: flex; align-items: center; gap: 3px; justify-content: center; }

        /* BODY */
        .sc-body { display: grid; grid-template-columns: 172px 1fr 252px; gap: 14px; align-items: start; }

        /* LEFT RAIL */
        .sc-left-rail { padding: 14px; position: sticky; top: 14px; max-height: calc(100vh - 150px); overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
        .sc-rail-title { font-size: 0.68rem; font-weight: 700; color: var(--text-muted); letter-spacing: .06em; text-transform: uppercase; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,.05); margin-bottom: 4px; }
        .sc-step-jump { display: flex; align-items: center; gap: 7px; padding: 6px 8px; border-radius: 6px; background: none; border: none; width: 100%; text-align: left; cursor: pointer; color: var(--text-secondary); font-size: 0.78rem; transition: background var(--transition-fast); }
        .sc-step-jump:hover { background: rgba(255,255,255,.04); color: var(--text-primary); }
        .sc-step-num { font-size: 0.62rem; font-weight: 700; color: var(--accent-blue); font-family: 'Outfit', sans-serif; flex-shrink: 0; }
        .sc-step-name { flex: 1; line-height: 1.3; }
        .sc-step-choke { font-size: 0.65rem; color: var(--accent-red); flex-shrink: 0; }
        .sc-clear-filter { margin-top: 10px; padding: 5px 8px; font-size: 0.72rem; border-radius: 6px; border: 1px solid rgba(239,68,68,.3); color: var(--accent-red); background: rgba(239,68,68,.06); cursor: pointer; width: 100%; transition: all var(--transition-fast); }
        .sc-clear-filter:hover { background: rgba(239,68,68,.12); }

        /* MAIN FLOW */
        .sc-flow-main { display: flex; flex-direction: column; }
        .sc-row { scroll-margin-top: 14px; }
        .sc-row-header { display: flex; align-items: center; gap: 10px; padding: 14px 0 10px; }
        .sc-row-step { font-size: 0.62rem; font-weight: 700; font-family: 'Outfit', sans-serif; color: var(--accent-blue); background: rgba(0,191,255,.1); border: 1px solid rgba(0,191,255,.2); padding: 2px 6px; border-radius: 4px; flex-shrink: 0; }
        .sc-row-label { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); flex: 1; }
        .sc-row-meta { font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; }
        .sc-row-choke { color: var(--accent-red); }
        .sc-row-empty { font-size: 0.78rem; color: var(--text-muted); padding: 6px 0; font-style: italic; }

        /* NODE CARDS — 色塊編號流程卡片 */
        .sc-nodes-wrap { display: flex; flex-wrap: wrap; gap: 10px; padding-bottom: 2px; }
        .sc-node {
          min-width: 210px; flex: 1 1 250px; max-width: 360px;
          border: 1px solid color-mix(in srgb, var(--cc) 32%, transparent);
          border-left: 4px solid var(--cc);
          border-radius: 10px;
          background: color-mix(in srgb, var(--cc) 9%, #141821);
          padding: 13px 15px; cursor: pointer; text-align: left;
          display: flex; flex-direction: column; gap: 10px;
          transition: all var(--transition-fast);
        }
        .sc-node:hover { background: color-mix(in srgb, var(--cc) 16%, #141821); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.3); }
        .sc-node.active { background: color-mix(in srgb, var(--cc) 18%, #141821); box-shadow: 0 0 0 2px var(--cc), 0 6px 16px rgba(0,0,0,.3); }
        .sc-node.lock { box-shadow: 0 0 10px color-mix(in srgb, var(--cc) 25%, transparent); }

        /* 標頭：編號 + 環節名（小、輔助） */
        .sc-node-head { display: flex; align-items: center; gap: 8px; }
        .sc-node-idx {
          width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
          background: var(--cc); color: #0b0e14;
          font-size: 0.72rem; font-weight: 800; font-family: 'Outfit', sans-serif;
          display: flex; align-items: center; justify-content: center;
        }
        .sc-node-name { font-size: 0.78rem; font-weight: 500; color: var(--text-secondary); flex: 1; line-height: 1.3; }
        .sc-node-lock { font-size: 0.58rem; background: rgba(239,68,68,.92); color: #fff; padding: 2px 6px; border-radius: 4px; animation: pulse 2s infinite; white-space: nowrap; font-weight: 700; }

        /* 公司名 — 主角，大字 */
        .sc-node-cos { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; }
        .sc-co-tag { font-size: 1.02rem; font-weight: 700; color: var(--text-primary); line-height: 1.25; letter-spacing: -0.01em; }
        .sc-co-tag.tw { color: var(--accent-blue); }
        .sc-co-more { font-size: 0.72rem; color: var(--text-muted); align-self: center; }

        /* 卡腳：格局標籤 + 提示（小、淡） */
        .sc-node-foot { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
        .sc-node-comp { font-size: 0.68rem; font-weight: 700; }
        .sc-node-hint { font-size: 0.62rem; color: var(--text-muted); opacity: 0; transition: opacity var(--transition-fast); }
        .sc-node:hover .sc-node-hint { opacity: 1; }

        /* INLINE DETAIL */
        .sc-detail {
          margin: 10px 0 0;
          padding: 18px 20px;
          display: flex; flex-direction: column; gap: 12px;
          animation: slideDown .2s ease forwards;
        }
        .sc-detail.focused { animation: focusPulse 1.5s 3 ease-in-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes focusPulse { 0%,100% { box-shadow: none; } 50% { box-shadow: var(--neon-glow-blue); } }
        .sc-detail-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; }
        .sc-detail-head h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
        .sc-detail-en { font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 2px; }
        .sc-choke-box { display: flex; align-items: flex-start; gap: 8px; background: rgba(239,68,68,.05); border: 1px solid rgba(239,68,68,.15); border-radius: 6px; padding: 9px 12px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; }
        .sc-choke-icon { color: var(--accent-red); flex-shrink: 0; margin-top: 1px; }
        .sc-analysis { display: flex; flex-direction: column; gap: 4px; }
        .sc-analysis-tag { font-size: 0.74rem; font-weight: 600; color: var(--text-muted); }
        .sc-analysis p { font-size: 0.83rem; color: var(--text-secondary); line-height: 1.55; }
        .sc-companies-title { font-size: 0.74rem; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
        .sc-companies-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(192px, 1fr)); gap: 7px; }
        .sc-co { padding: 9px 11px; display: flex; flex-direction: column; gap: 5px; }
        .sc-co.tw { border-color: rgba(0,191,255,.18); background: rgba(0,191,255,.04); }
        .sc-co-top { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
        .sc-co-name { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
        .sc-tickers { display: flex; gap: 3px; flex-wrap: wrap; }
        .sc-ticker { font-size: 0.64rem; background: rgba(0,191,255,.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 1px 5px; border-radius: 3px; text-decoration: none; font-weight: 600; transition: all var(--transition-fast); }
        .sc-ticker:hover { background: var(--accent-blue); color: var(--bg-deep); }
        .sc-co-bottom { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); }
        .sc-co-share { font-style: italic; }

        /* FLOW DIVIDER — 置中向下箭頭 */
        .sc-divider { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 0; }
        .sc-div-line { width: 2px; height: 12px; background: linear-gradient(to bottom, rgba(255,255,255,.04), rgba(255,255,255,.14)); }
        .sc-div-text { font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); padding: 3px 14px; border-radius: 20px; }

        /* RIGHT RAIL */
        .sc-right-rail { display: flex; flex-direction: column; gap: 10px; position: sticky; top: 14px; max-height: calc(100vh - 110px); overflow-y: auto; }
        .sc-panel { padding: 14px 15px; }
        .sc-panel-hd { font-size: 0.8rem; font-weight: 700; color: var(--text-primary); border-left: 3px solid var(--accent-blue); padding-left: 8px; margin-bottom: 10px; }
        .sc-empty { font-size: 0.76rem; color: var(--text-muted); font-style: italic; }
        .sc-tw-list { display: flex; flex-direction: column; gap: 3px; max-height: 240px; overflow-y: auto; }
        .sc-tw-item { display: flex; align-items: center; gap: 6px; padding: 6px 9px; border-radius: 6px; background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.04); cursor: pointer; transition: all var(--transition-fast); }
        .sc-tw-item:hover { background: rgba(0,191,255,.06); border-color: var(--accent-blue); transform: translateX(2px); }
        .sc-tw-item.active { background: rgba(0,191,255,.1); border-color: var(--accent-blue); }
        .sc-tw-name { font-size: 0.78rem; color: var(--text-secondary); flex: 1; text-align: left; }
        .sc-tw-item:hover .sc-tw-name { color: var(--text-primary); }
        .sc-tw-tick { font-size: 0.65rem; background: rgba(255,255,255,.06); padding: 1px 4px; border-radius: 3px; color: var(--text-muted); font-family: 'Outfit', sans-serif; }
        .sc-tw-arr { color: var(--text-muted); flex-shrink: 0; }
        .sc-tw-item:hover .sc-tw-arr { color: var(--accent-blue); }
        .sc-tldr-item { display: flex; flex-direction: column; gap: 3px; }
        .sc-tldr-tag { font-size: 0.63rem; font-weight: 700; padding: 1px 6px; border-radius: 3px; width: fit-content; margin-bottom: 2px; }
        .sc-tldr-tag.blue { background: rgba(0,191,255,.1); color: var(--accent-blue); }
        .sc-tldr-tag.purple { background: rgba(139,92,246,.1); color: var(--accent-purple); }
        .sc-tldr-item p { font-size: 0.76rem; color: var(--text-secondary); line-height: 1.5; }
        .sc-geo-bar { display: flex; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 9px; }
        .sc-geo-seg { height: 100%; border: none; padding: 0; cursor: pointer; transition: opacity var(--transition-fast); }
        .sc-geo-seg:hover { opacity: .75; }
        .sc-geo-seg.sel { outline: 2px solid #fff; outline-offset: 1px; }
        .sc-geo-tags { display: flex; flex-wrap: wrap; gap: 4px 6px; }
        .sc-geo-tag { display: flex; align-items: center; gap: 4px; font-size: 0.68rem; color: var(--text-muted); background: none; border: 1px solid rgba(255,255,255,.06); border-radius: 4px; padding: 2px 6px; cursor: pointer; transition: all var(--transition-fast); }
        .sc-geo-tag:hover { color: var(--text-primary); border-color: rgba(255,255,255,.15); }
        .sc-geo-tag.sel { color: var(--text-primary); background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.2); }
        .sc-geo-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
      `}</style>
    </div>
  );
};
