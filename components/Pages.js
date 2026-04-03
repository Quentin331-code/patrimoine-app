'use client';
import { useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '@/lib/data';
import { fmt, fmtK, fmtP } from '@/lib/format';
import Modal, { ModalTitle, FormGroup, FormRow, ModalActions, Btn, inputStyle } from '@/components/Modal';

const AK = Object.keys(CATEGORIES).filter(k => k !== 'passif');

// ==================== DONUT SVG ====================
function DonutChart({ data, size = 200 }) {
  const cx = size / 2, cy = size / 2, r = 75, sw = 20, C = 2 * Math.PI * r;
  const tot = data.reduce((s, d) => s + d.value, 0);
  if (!tot) return <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}><circle cx={cx} cy={cy} r={r} fill="none" stroke="#252840" strokeWidth={sw} /></svg>;
  let cum = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {data.map((d, i) => { const p = d.value / tot, dl = p * C, off = -cum * C + C * .25; cum += p; return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={sw} strokeDasharray={`${dl} ${C - dl}`} strokeDashoffset={off} style={{ transition: 'all .5s' }} />; })}
    </svg>
  );
}

// ==================== DASHBOARD ====================
export function PageDashboard({ P }) {
  const catData = AK.map(k => ({ key: k, label: CATEGORIES[k].label, icon: CATEGORIES[k].icon, color: CATEGORIES[k].color, value: P.catTotal(k) })).filter(d => d.value > 0);
  const act = P.totalActifs(), liq = P.liquidity();

  let movers = [];
  P.portfolio.forEach(p => { const s = P.liveStocks.find(x => x.ticker === p.ticker); if (s && s.price > 0) movers.push({ name: s.name, ticker: s.ticker, color: s.color, pct: s.changePct, val: s.price * Number(p.qty) }); });
  P.metals.forEach(m => { const mt = P.liveMetals.find(x => x.id === m.metal_id); if (mt && mt.pricePerGram > 0) movers.push({ name: mt.name, ticker: mt.symbol, color: mt.color, pct: mt.changePct, val: mt.pricePerGram * Number(m.grams) }); });
  movers.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  const totalLV = movers.reduce((s, m) => s + m.val, 0);
  const gVar = totalLV > 0 ? movers.reduce((s, m) => s + m.pct * (m.val / totalLV), 0) : 0;

  function getAllSorted() {
    let all = [];
    AK.forEach(k => P.assets.filter(a => a.category === k).forEach(a => all.push({ name: a.name, cat: CATEGORIES[k].label, color: CATEGORIES[k].color, value: Number(a.value) })));
    P.portfolio.forEach(p => { const s = P.liveStocks.find(x => x.ticker === p.ticker); if (s) all.push({ name: s.name, cat: s.type === 'Crypto' ? 'Crypto' : 'Bourse', color: s.color, value: s.price * Number(p.qty), changePct: s.changePct }); });
    P.metals.forEach(m => { const mt = P.liveMetals.find(x => x.id === m.metal_id); if (mt) all.push({ name: mt.name + ' ' + m.grams + 'g', cat: 'Métaux', color: mt.color, value: mt.pricePerGram * Number(m.grams) }); });
    return all.sort((a, b) => b.value - a.value);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Performance du jour */}
      {movers.length > 0 && (
        <div className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{P.apiMode ? <span className="live-dot"></span> : '⏸ '} Performance du jour</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: gVar >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmtP(gVar)}</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-m)', marginBottom: 14 }}>Variation pondérée de vos actifs cotés{!P.apiMode && <span style={{ color: 'var(--gold)' }}> · Prix hors-ligne</span>}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {movers.slice(0, 6).map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'var(--bg-input)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', background: m.color }}>{m.ticker.slice(0, 2)}</div>
                <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>{m.name}</div>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: m.pct >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmtP(m.pct)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Donut */}
        <div className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Répartition par catégorie</div>
          <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 14px' }}>
            <DonutChart data={catData} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: 1 }}>Net</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 600 }}>{fmtK(P.netWorth())}</div>
            </div>
          </div>
          {catData.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: d.color }}></span>
                <span style={{ fontSize: 12 }}>{d.icon} {d.label}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{fmtK(d.value)}</div>
                <div style={{ fontSize: 10, color: 'var(--text-m)' }}>{act > 0 ? (d.value / act * 100).toFixed(1) + '%' : ''}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Liquidité */}
          <div className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Liquidité</div>
            <div style={{ width: '100%', height: 26, background: 'var(--bg-input)', borderRadius: 8, overflow: 'hidden', display: 'flex', marginBottom: 10 }}>
              <div style={{ width: liq.t ? liq.l / liq.t * 100 + '%' : 0, height: '100%', background: 'var(--green)', borderRadius: '8px 0 0 8px' }}></div>
              <div style={{ width: liq.t ? liq.se / liq.t * 100 + '%' : 0, height: '100%', background: 'var(--gold)' }}></div>
              <div style={{ width: liq.t ? liq.il / liq.t * 100 + '%' : 0, height: '100%', background: 'var(--accent2)', borderRadius: '0 8px 8px 0' }}></div>
            </div>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['var(--green)', 'Liquide', liq.l], ['var(--gold)', 'Semi', liq.se], ['var(--accent2)', 'Illiquide', liq.il]].map(([c, n, v], i) => (
                <span key={i} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: c }}></span>{n} {fmtK(v)}
                </span>
              ))}
            </div>
          </div>

          {/* Top actifs */}
          <div className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Top actifs</div>
            {getAllSorted().slice(0, 6).map((a, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'var(--bg-input)', marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: a.color }}></span>
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div><div style={{ fontSize: 11, color: 'var(--text-m)' }}>{a.cat}{a.changePct !== undefined ? <span style={{ color: a.changePct >= 0 ? 'var(--green)' : 'var(--red)', marginLeft: 6 }}>{fmtP(a.changePct)}</span> : ''}</div></div>
                <div style={{ fontSize: 11, color: 'var(--text-m)' }}>{act > 0 ? (a.value / act * 100).toFixed(1) + '%' : ''}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500 }}>{fmt(a.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== REVENUS ====================
export function PageRevenus({ P }) {
  const rows = P.assets.filter(a => a.category !== 'passif' && a.revenu && Number(a.revenu) > 0).sort((a, b) => Number(b.revenu) - Number(a.revenu));
  const tot = rows.reduce((s, a) => s + Number(a.revenu) * 12, 0);
  const act = P.totalActifs();
  return (
    <div className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Revenus passifs</div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 500, color: 'var(--green)' }}>{fmt(tot)}/an</span>
      </div>
      {rows.length ? (<>
        {rows.map(a => (
          <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-input)', marginBottom: 5 }}>
            <div><div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div><div style={{ fontSize: 11, color: 'var(--text-m)' }}>{CATEGORIES[a.category]?.label}</div></div>
            <span style={{ fontSize: 11, color: 'var(--text-m)', padding: '2px 8px', borderRadius: 4, background: 'var(--bg-card)' }}>{a.rev_type || 'Revenu'}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--green)' }}>{fmt(a.revenu)}/mois</span>
          </div>
        ))}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text-m)' }}>Rendement moyen</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: 'var(--green)' }}>{act > 0 ? (tot / act * 100).toFixed(2) : 0}%/an</span>
        </div>
      </>) : <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-d)', fontSize: 12, fontStyle: 'italic' }}>Ajoutez des revenus lors de la création d'un actif</div>}
    </div>
  );
}

// ==================== HISTORIQUE ====================
export function PageHistorique({ P }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || P.history.length < 2) return;
    const c = canvasRef.current, ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1, rect = c.getBoundingClientRect();
    c.width = rect.width * dpr; c.height = rect.height * dpr; ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height, pts = P.history;
    const vals = pts.map(p => Number(p.value)), mn = Math.min(...vals) * .92, mx = Math.max(...vals) * 1.08 || 1;
    const pad = { t: 20, r: 20, b: 30, l: 65 }, gw = W - pad.l - pad.r, gh = H - pad.t - pad.b;
    const x = i => pad.l + i / (pts.length - 1) * gw, y = v => pad.t + (1 - (v - mn) / (mx - mn || 1)) * gh;
    ctx.strokeStyle = '#252840'; ctx.lineWidth = .5;
    for (let i = 0; i < 5; i++) { const yy = pad.t + i / 4 * gh; ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(W - pad.r, yy); ctx.stroke(); ctx.fillStyle = '#7578a0'; ctx.font = '11px JetBrains Mono'; ctx.textAlign = 'right'; ctx.fillText(fmtK(mx - i / 4 * (mx - mn)), pad.l - 8, yy + 4); }
    ctx.fillStyle = '#7578a0'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center';
    pts.forEach((p, i) => { if (pts.length <= 12 || i % Math.ceil(pts.length / 10) === 0) ctx.fillText(p.date, x(i), H - 6); });
    const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b); grad.addColorStop(0, 'rgba(88,101,242,.2)'); grad.addColorStop(1, 'rgba(88,101,242,0)');
    ctx.beginPath(); ctx.moveTo(x(0), y(vals[0])); vals.forEach((_, i) => { if (i > 0) ctx.lineTo(x(i), y(vals[i])); }); ctx.lineTo(x(pts.length - 1), H - pad.b); ctx.lineTo(x(0), H - pad.b); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x(0), y(vals[0])); vals.forEach((_, i) => { if (i > 0) ctx.lineTo(x(i), y(vals[i])); }); ctx.strokeStyle = '#5865f2'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
    vals.forEach((v, i) => { ctx.beginPath(); ctx.arc(x(i), y(v), 4, 0, Math.PI * 2); ctx.fillStyle = '#5865f2'; ctx.fill(); ctx.beginPath(); ctx.arc(x(i), y(v), 2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); });
  }, [P.history]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Évolution patrimoine net</div>
          <button onClick={P.addSnapshot} style={{ padding: '7px 14px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>📸 Snapshot</button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-m)', marginBottom: 8 }}>{P.history.length} point{P.history.length > 1 ? 's' : ''}</div>
        <canvas ref={canvasRef} style={{ width: '100%', height: 260 }}></canvas>
      </div>

      {P.history.length > 0 && (
        <div className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Snapshots</div>
            <button onClick={P.clearHistory} style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-m)', fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Effacer</button>
          </div>
          {[...P.history].reverse().map((h, i) => {
            const ri = P.history.length - 1 - i;
            return (
              <div key={h.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto 28px', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-input)', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{h.date}</div>
                <div style={{ fontSize: 11 }}>{ri > 0 ? (() => { const prev = P.history[ri - 1]; const d = Number(h.value) - Number(prev.value); return <span style={{ color: d >= 0 ? 'var(--green)' : 'var(--red)' }}>{d >= 0 ? '+' : ''}{(d / (Number(prev.value) || 1) * 100).toFixed(1)}%</span>; })() : ''}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500 }}>{fmt(h.value)}</div>
                <button onClick={() => P.deleteSnapshot(h.id)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-d)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== ALLOCATION ====================
export function PageAllocation({ P }) {
  const act = P.totalActifs();
  const totalTarget = AK.reduce((s, k) => s + (P.targets[k] || 0), 0);
  return (
    <div className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Allocation cible vs réelle</div>
      <p style={{ fontSize: 12, color: 'var(--text-m)', marginBottom: 16 }}>Définissez votre allocation cible (%) et comparez avec votre répartition actuelle.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 55px 85px', gap: '6px 12px', fontSize: 10, color: 'var(--text-d)', paddingBottom: 6, borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
        <span>Catégorie</span><span></span><span style={{ textAlign: 'center' }}>Cible</span><span style={{ textAlign: 'right' }}>Réel</span>
      </div>
      {AK.map(k => {
        const c = CATEGORIES[k], tot = P.catTotal(k), rp = act > 0 ? tot / act * 100 : 0, tp = P.targets[k] || 0;
        return (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 55px 85px', gap: '6px 12px', alignItems: 'center', padding: '5px 0' }}>
            <span style={{ fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: c.color, display: 'inline-block' }}></span>{c.label}
            </span>
            <div style={{ flex: 1, position: 'relative', height: 20, borderRadius: 4, overflow: 'hidden', background: 'var(--bg-input)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '50%', width: Math.min(rp, 100) + '%', borderRadius: '4px 4px 0 0', background: c.color, transition: 'width .4s' }}></div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, height: '50%', width: Math.min(tp, 100) + '%', borderRadius: '0 0 4px 4px', background: c.color, opacity: .35, transition: 'width .4s' }}></div>
            </div>
            <input type="number" min="0" max="100" value={tp} onChange={e => P.setTarget(k, Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
              style={{ width: 50, padding: '4px 6px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, textAlign: 'center', outline: 'none' }} />
            <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
              <span style={{ fontWeight: 600 }}>{rp.toFixed(1)}%</span> <span style={{ color: 'var(--text-m)' }}>/ {tp}%</span>
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-m)' }}>Total cible</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: totalTarget === 100 ? 'var(--green)' : 'var(--red)' }}>{totalTarget}%</span>
      </div>
    </div>
  );
}

// ==================== OBJECTIFS ====================
export function PageObjectifs({ P }) {
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const nw = P.netWorth();
  const allocTotal = AK.reduce((s, k) => s + (P.targets[k] || 0), 0);
  const hasAlloc = allocTotal === 100;
  const COLORS = ['#5865f2', '#43d9a0', '#f0c040', '#9b6dff', '#f5a623', '#36c5dc', '#f0605d'];

  async function handleAdd(data) { await P.addGoal(data); setModal(null); }
  async function handleEdit(id, data) { await P.updateGoal(id, data); setModal(null); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!hasAlloc && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--gold)', borderRadius: 16, padding: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold)' }}>Allocation cible non définie</div><div style={{ fontSize: 12, color: 'var(--text-m)', marginTop: 2 }}>Définissez votre allocation pour voir la ventilation par catégorie.</div></div>
        </div>
      )}

      <div className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>🎯 Mes objectifs</div>
          <button onClick={() => setModal({ type: 'add' })} style={{ padding: '7px 14px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Nouvel objectif</button>
        </div>

        {P.goals.length ? P.goals.map(g => {
          const pct = Math.min(100, Number(g.target) > 0 ? nw / Number(g.target) * 100 : 0);
          const remaining = Number(g.target) - nw;
          return (
            <div key={g.id} style={{ background: 'var(--bg)', border: `1px solid ${pct >= 100 ? 'var(--green)' : 'var(--border)'}`, borderRadius: 16, padding: 22, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div><div style={{ fontSize: 16, fontWeight: 700 }}>{g.name}</div>{g.deadline && <div style={{ fontSize: 11, color: 'var(--text-m)', marginTop: 2 }}>Échéance : {g.deadline}</div>}</div>
                <div style={{ textAlign: 'right' }}><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: pct >= 100 ? 'var(--green)' : 'var(--text)' }}>{pct.toFixed(1)}%</div><div style={{ fontSize: 11, color: 'var(--text-m)' }}>atteint</div></div>
              </div>
              <div style={{ width: '100%', height: 10, background: 'var(--bg-input)', borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ width: pct + '%', height: '100%', borderRadius: 5, background: g.color || 'var(--accent)', transition: 'width .5s' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-m)', marginBottom: 16 }}>
                <span>{fmt(nw)} actuels</span>
                <span>{remaining > 0 ? fmt(remaining) + ' restants' : '🎉 Atteint !'}</span>
                <span>Cible : {fmt(g.target)}</span>
              </div>

              {hasAlloc && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-m)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Ventilation par catégorie</div>
                  {AK.filter(k => P.targets[k] > 0).map(k => {
                    const cat = CATEGORIES[k], targetAmt = Number(g.target) * P.targets[k] / 100, currentAmt = P.catTotal(k);
                    const catPct = targetAmt > 0 ? Math.min(100, currentAmt / targetAmt * 100) : 0;
                    const gap = targetAmt - currentAmt, isOver = gap < 0;
                    return (
                      <div key={k} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-input)', marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 3, background: cat.color }}></span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{cat.icon} {cat.label}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-d)' }}>{P.targets[k]}%</span>
                          </div>
                          <div><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>{fmt(currentAmt)}</span><span style={{ fontSize: 11, color: 'var(--text-m)' }}> / {fmt(targetAmt)}</span></div>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                          <div style={{ width: catPct + '%', height: '100%', borderRadius: 3, background: isOver ? 'var(--gold)' : catPct >= 100 ? 'var(--green)' : cat.color }}></div>
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: isOver ? 'var(--gold)' : catPct >= 100 ? 'var(--green)' : 'var(--text-m)' }}>
                          {isOver ? '▲ Excès de ' + fmt(Math.abs(gap)) : catPct >= 100 ? '✓ Objectif atteint' : '▼ Il manque ' + fmt(gap)}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <button onClick={() => setModal({ type: 'edit', data: g })} style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-m)', fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✎ Modifier</button>
                <button onClick={() => setConfirm({ id: g.id, label: g.name })} style={{ padding: '7px 14px', borderRadius: 10, border: 'none', background: 'var(--red-bg)', color: 'var(--red)', fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Supprimer</button>
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: 24, borderRadius: 10, border: '1px dashed var(--border)', background: 'var(--bg)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-m)' }}>Définissez vos objectifs</div>
            <div style={{ fontSize: 11, color: 'var(--text-d)', marginTop: 4 }}>Créez un objectif patrimonial et suivez votre progression.</div>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {modal && <GoalModal modal={modal} setModal={setModal} onAdd={handleAdd} onEdit={handleEdit} colors={COLORS} />}

      {confirm && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid var(--red)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 12px 40px rgba(0,0,0,.5)', zIndex: 1100 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Supprimer <strong>{confirm.label}</strong> ?</span>
          <button onClick={() => setConfirm(null)} style={{ padding: '7px 16px', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-m)' }}>Annuler</button>
          <button onClick={async () => { await P.deleteGoal(confirm.id); setConfirm(null); }} style={{ padding: '7px 16px', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--red)', color: '#fff' }}>Supprimer</button>
        </div>
      )}
    </div>
  );
}

function GoalModal({ modal, setModal, onAdd, onEdit, colors }) {
  const g = modal.type === 'edit' ? modal.data : {};
  const [name, setName] = useState(g.name || '');
  const [target, setTarget] = useState(g.target || '');
  const [deadline, setDeadline] = useState(g.deadline || '');
  const [color, setColor] = useState(g.color || '#5865f2');

  function save() {
    if (!name || !target) return;
    const data = { name, target: parseFloat(target), deadline, color };
    modal.type === 'edit' ? onEdit(g.id, data) : onAdd(data);
  }

  return (
    <Modal open={true} onClose={() => setModal(null)}>
      <ModalTitle>{modal.type === 'edit' ? "Modifier l'objectif" : 'Nouvel objectif'}</ModalTitle>
      <FormGroup label="Nom"><input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Patrimoine 1M€" autoFocus style={inputStyle} /></FormGroup>
      <FormRow>
        <FormGroup label="Montant cible (€)"><input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="1000000" style={inputStyle} /></FormGroup>
        <FormGroup label="Échéance"><input value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="ex: Décembre 2035" style={inputStyle} /></FormGroup>
      </FormRow>
      <FormGroup label="Couleur">
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {colors.map(c => <div key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: 'pointer', outline: color === c ? '2px solid white' : 'none' }}></div>)}
        </div>
      </FormGroup>
      <ModalActions><Btn onClick={() => setModal(null)}>Annuler</Btn><Btn primary onClick={save}>{modal.type === 'edit' ? 'Enregistrer' : 'Créer'}</Btn></ModalActions>
    </Modal>
  );
}
