'use client';
import { useState, useRef } from 'react';
import { CATEGORIES, STOCKS_DB } from '@/lib/data';
import { fmt, fmtP, REV_TYPES } from '@/lib/format';
import Modal, { ModalTitle, FormGroup, FormRow, ModalActions, Btn, inputStyle } from '@/components/Modal';

const AK = Object.keys(CATEGORIES).filter(k => k !== 'passif');

export default function PageActifs({ P }) {
  const act = P.totalActifs();
  const [modal, setModal] = useState(null); // {type, data}
  const [confirm, setConfirm] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [globalSearch, setGlobalSearch] = useState('');
  const [catSearch, setCatSearch] = useState({});
  const [catResults, setCatResults] = useState({});
  const gsRef = useRef(null);

  function toggleCat(k) {
    setCollapsed(prev => ({ ...prev, [k]: prev[k] !== undefined ? !prev[k] : true }));
  }

  // Category search for stocks/crypto
  function onCatSearch(k, val) {
    setCatSearch(prev => ({ ...prev, [k]: val }));
    const q = val.toLowerCase().trim();
    if (!q) { setCatResults(prev => ({ ...prev, [k]: [] })); return; }
    const types = k === 'bourse' ? ['Action', 'ETF'] : ['Crypto'];
    const matches = P.liveStocks.filter(s => {
      if (!types.includes(s.type)) return false;
      return s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.isin.toLowerCase().includes(q);
    }).slice(0, 8);
    setCatResults(prev => ({ ...prev, [k]: matches }));
  }

  function selectStock(st) {
    setCatSearch({}); setCatResults({});
    setModal({ type: 'addStock', data: { stock: st } });
  }

  // Add stock/crypto
  async function handleAddStock(qty) {
    if (!qty || qty <= 0) return;
    await P.addPortfolio({ ticker: modal.data.stock.ticker, qty });
    setModal(null);
  }

  // Add metal
  async function handleAddMetal(grams) {
    if (!grams || grams <= 0) return;
    await P.addMetal({ metal_id: modal.data.metalId, grams });
    setModal(null);
  }

  // Add manual asset
  async function handleAddAsset(data) {
    await P.addAsset(data);
    setModal(null);
  }

  // Edit
  async function handleEditStock(id, qty) {
    if (!qty || qty <= 0) return;
    await P.updatePortfolio(id, { qty });
    setModal(null);
  }
  async function handleEditMetal(id, grams) {
    if (!grams || grams <= 0) return;
    await P.updateMetal(id, { grams });
    setModal(null);
  }
  async function handleEditAsset(id, data) {
    await P.updateAsset(id, data);
    setModal(null);
  }

  // Delete with confirm
  function askDelete(type, id, label, cat) { setConfirm({ type, id, label, cat }); }
  async function execDelete() {
    if (!confirm) return;
    if (confirm.type === 'portfolio') await P.deletePortfolio(confirm.id);
    else if (confirm.type === 'metal') await P.deleteMetal(confirm.id);
    else if (confirm.type === 'asset') await P.deleteAsset(confirm.id);
    setConfirm(null);
  }

  // Global search results
  function getGlobalResults() {
    const q = globalSearch.toLowerCase().trim();
    if (!q) return null;
    let all = [];
    AK.forEach(k => P.assets.filter(a => a.category === k).forEach(a => all.push({ name: a.name, sub: a.subcategory, cat: k, value: Number(a.value) })));
    P.portfolio.forEach(p => { const s = P.liveStocks.find(x => x.ticker === p.ticker); if (s) all.push({ name: s.name, sub: s.ticker, cat: s.type === 'Crypto' ? 'crypto' : 'bourse', value: s.price * Number(p.qty), isin: s.isin, changePct: s.changePct }); });
    P.metals.forEach(m => { const mt = P.liveMetals.find(x => x.id === m.metal_id); if (mt) all.push({ name: mt.name, sub: m.grams + 'g', cat: 'or', value: mt.pricePerGram * Number(m.grams) }); });
    return all.filter(a => a.name.toLowerCase().includes(q) || a.sub?.toLowerCase().includes(q) || (a.isin || '').toLowerCase().includes(q)).sort((a, b) => b.value - a.value);
  }

  const gResults = getGlobalResults();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Global search */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-d)', fontSize: 13, pointerEvents: 'none' }}>🔍</span>
        <input ref={gsRef} placeholder="Rechercher dans tous vos actifs…" value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 36, borderRadius: 12 }} />
        {globalSearch && <button onClick={() => { setGlobalSearch(''); gsRef.current?.focus(); }}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-d)', fontSize: 16, cursor: 'pointer' }}>×</button>}
      </div>

      {/* Global search results */}
      {gResults && (
        <div className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{gResults.length} résultat{gResults.length > 1 ? 's' : ''} pour "{globalSearch}"</div>
          {gResults.length ? gResults.map((a, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'var(--bg-input)', marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: CATEGORIES[a.cat]?.color }}></span>
              <div><div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div><div style={{ fontSize: 11, color: 'var(--text-m)' }}>{CATEGORIES[a.cat]?.label} · {a.sub}{a.changePct !== undefined ? <span style={{ color: a.changePct >= 0 ? 'var(--green)' : 'var(--red)', marginLeft: 6 }}>{fmtP(a.changePct)}</span> : ''}</div></div>
              <div style={{ fontSize: 11, color: 'var(--text-m)' }}>{act > 0 ? (a.value / act * 100).toFixed(1) + '%' : ''}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500 }}>{fmt(a.value)}</div>
            </div>
          )) : <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-d)', fontSize: 12 }}>Aucun résultat</div>}
        </div>
      )}

      {/* Categories */}
      {!gResults && AK.map(k => {
        const cat = CATEGORIES[k], tot = P.catTotal(k);
        const isLive = k === 'bourse' || k === 'crypto';
        const isMetal = k === 'or';
        const catAssets = P.assets.filter(a => a.category === k);
        const catPort = k === 'bourse' ? P.portfolio.filter(p => { const s = P.liveStocks.find(x => x.ticker === p.ticker); return s && s.type !== 'Crypto'; })
          : k === 'crypto' ? P.portfolio.filter(p => { const s = P.liveStocks.find(x => x.ticker === p.ticker); return s && s.type === 'Crypto'; }) : [];
        const catMet = isMetal ? P.metals : [];
        const hasItems = catAssets.length || catPort.length || catMet.length;
        const isCol = collapsed[k] !== undefined ? collapsed[k] : !hasItems;

        return (
          <div key={k} className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, opacity: !hasItems && isCol ? .7 : 1, transition: 'opacity .3s' }}>
            {/* Header */}
            <div onClick={() => toggleCat(k)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isCol ? 0 : 16, cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: cat.color + '18', color: cat.color }}>{cat.icon}</span>
                {cat.label}
                <span style={{ fontSize: 12, color: 'var(--text-d)', transition: 'transform .3s', transform: isCol ? 'rotate(0deg)' : 'rotate(90deg)' }}>▶</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} onClick={e => e.stopPropagation()}>
                {(isLive || isMetal) && <span style={{ fontSize: 11, fontWeight: 500, color: P.apiMode ? 'var(--green)' : 'var(--gold)' }}>{P.apiMode ? <><span className="live-dot"></span>Live</> : '⏸ Hors-ligne'}</span>}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 500 }}>{fmt(tot)}</span>
              </div>
            </div>

            {/* Body */}
            {!isCol && (<div>
              {/* Stock/Crypto search */}
              {isLive && (
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-d)', fontSize: 13, pointerEvents: 'none' }}>🔍</span>
                  <input placeholder={k === 'bourse' ? 'Rechercher par nom, ticker ou ISIN…' : 'Rechercher une crypto…'}
                    value={catSearch[k] || ''} onChange={e => onCatSearch(k, e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 38, borderRadius: 12 }} />
                  {(catResults[k]?.length > 0) && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, maxHeight: 300, overflowY: 'auto', zIndex: 100, boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>
                      {catResults[k].map(s => (
                        <div key={s.ticker} onClick={() => selectStock(s)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', background: s.color }}>{s.ticker.slice(0, 2)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.ticker} <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: 'var(--bg-input)', color: 'var(--text-m)', marginLeft: 4 }}>{s.type}</span></div>
                            <div style={{ fontSize: 10, color: 'var(--text-m)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-d)', fontFamily: "'JetBrains Mono', monospace" }}>{s.isin}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500 }}>{s.price > 0 ? fmt(s.price) : '—'}</div>
                            <div style={{ fontSize: 10, color: s.changePct >= 0 ? 'var(--green)' : 'var(--red)' }}>{s.price > 0 ? fmtP(s.changePct) : ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Metal picker buttons */}
              {isMetal && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {P.liveMetals.map(m => {
                    const arrow = m.pricePerGram > 0 ? (m.changePct >= 0 ? '▲' : '▼') : '';
                    return (
                      <button key={m.id} onClick={() => setModal({ type: 'addMetal', data: { metalId: m.id, metal: m } })}
                        style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-m)', fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700 }}>{m.symbol}</span> {m.name}{m.id !== "gold" ? " (≈ approx.)" : ""}
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: m.changePct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                          {arrow} {m.pricePerGram > 0 ? fmt(m.pricePerGram) + '/g' : '—'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Portfolio live items */}
              {catPort.map(p => {
                const st = P.liveStocks.find(x => x.ticker === p.ticker); if (!st) return null;
                const val = st.price * Number(p.qty);
                const qtyStr = Number(p.qty) % 1 === 0 ? p.qty : Number(p.qty).toFixed(4);
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto auto 26px 28px', alignItems: 'center', gap: 8, padding: '11px 12px', borderRadius: 10, background: 'var(--bg-input)', marginBottom: 5 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', background: st.color }}>{st.ticker.slice(0, 2)}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{st.name}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--text-d)' }}>{st.isin}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-m)' }}>{st.ticker}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>×{qtyStr}</span>
                        <span style={{ color: 'var(--text-d)' }}>:</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700 }}>{fmt(val)}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500, color: 'var(--text-m)' }}>{st.price > 0 ? fmt(st.price) : '—'}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: st.changePct >= 0 ? 'var(--green)' : 'var(--red)' }}>{st.price > 0 ? fmtP(st.changePct) : ''}</div>
                    </div>
                    <div></div>
                    <button onClick={() => setModal({ type: 'editStock', data: { id: p.id, stock: st, qty: p.qty } })} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-d)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✎</button>
                    <button onClick={() => askDelete('portfolio', p.id, st.name)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-d)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                  </div>
                );
              })}

              {/* Metal items */}
              {catMet.map(m => {
                const mt = P.liveMetals.find(x => x.id === m.metal_id); if (!mt) return null;
                const val = mt.pricePerGram * Number(m.grams);
                return (
                  <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto 26px 28px', alignItems: 'center', gap: 8, padding: '11px 12px', borderRadius: 10, background: 'var(--bg-input)', marginBottom: 5 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, background: mt.color + '30', color: mt.color }}>{mt.symbol}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{mt.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                        <span style={{ color: 'var(--text-m)' }}>Métal précieux</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{m.grams}g</span>
                        <span style={{ color: 'var(--text-d)' }}>:</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700 }}>{fmt(val)}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-m)' }}>{mt.pricePerGram > 0 ? fmt(mt.pricePerGram) + '/g' : '—'}</div>
                    </div>
                    <button onClick={() => setModal({ type: 'editMetal', data: { id: m.id, metal: mt, grams: m.grams } })} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-d)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✎</button>
                    <button onClick={() => askDelete('metal', m.id, mt.name)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-d)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                  </div>
                );
              })}

              {/* Manual assets */}
              {catAssets.map(a => (
                <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto 26px 28px', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-input)', marginBottom: 5 }}>
                  <div><div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div><div style={{ fontSize: 11, color: 'var(--text-m)' }}>{a.subcategory}{a.revenu ? ' · ' + fmt(a.revenu) + '/m' : ''}{a.notes ? <span onClick={(e) => { e.stopPropagation(); alert(a.notes); }} style={{ cursor: 'pointer' }} title={a.notes}> 📝</span> : ''}</div></div>
                  <div style={{ fontSize: 11, color: 'var(--text-m)' }}>{act > 0 ? (Number(a.value) / act * 100).toFixed(1) + '%' : ''}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{fmt(a.value)}</div>
                  <button onClick={() => setModal({ type: 'editAsset', data: { ...a, catKey: k } })} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-d)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✎</button>
                  <button onClick={() => askDelete('asset', a.id, a.name)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-d)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                </div>
              ))}

              {/* Empty state */}
              {!hasItems && (
                <div style={{ textAlign: 'center', padding: 24, borderRadius: 10, border: '1px dashed var(--border)', background: 'var(--bg)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8, opacity: .7 }}>{cat.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-m)' }}>{cat.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-d)', marginTop: 4 }}>Aucun actif enregistré</div>
                </div>
              )}

              {/* Add button */}
              <button onClick={() => setModal({ type: 'addAsset', data: { catKey: k } })}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 10, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-m)', fontSize: 12, fontFamily: "'Outfit', sans-serif", cursor: 'pointer', width: '100%', marginTop: 6 }}>
                + Ajouter manuellement
              </button>
            </div>)}
          </div>
        );
      })}

      {/* ===== MODALS ===== */}
      <StockModal modal={modal} setModal={setModal} onAdd={handleAddStock} onEdit={handleEditStock} />
      <MetalModal modal={modal} setModal={setModal} onAdd={handleAddMetal} onEdit={handleEditMetal} />
      <AssetModal modal={modal} setModal={setModal} onAdd={handleAddAsset} onEdit={handleEditAsset} />

      {/* Confirm delete toast */}
      {confirm && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid var(--red)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 12px 40px rgba(0,0,0,.5)', zIndex: 1100 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Supprimer <strong>{confirm.label}</strong> ?</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirm(null)} style={{ padding: '7px 16px', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-m)' }}>Annuler</button>
            <button onClick={execDelete} style={{ padding: '7px 16px', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--red)', color: '#fff' }}>Supprimer</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Sub-modals =====
function StockModal({ modal, setModal, onAdd, onEdit }) {
  const [qty, setQty] = useState('');
  const isAdd = modal?.type === 'addStock';
  const isEdit = modal?.type === 'editStock';
  if (!isAdd && !isEdit) return null;
  const st = modal.data.stock;
  const initQty = isEdit ? modal.data.qty : '';

  return (
    <Modal open={true} onClose={() => setModal(null)}>
      <ModalTitle>
        <div style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', background: st.color }}>{st.ticker.slice(0, 2)}</div>
        <div><div>{st.ticker} — {st.name}</div><div style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-m)', fontFamily: "'JetBrains Mono', monospace" }}>{st.isin}</div></div>
      </ModalTitle>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, marginBottom: 18 }}>
        {st.price > 0 ? fmt(st.price) : '—'} <span style={{ fontSize: 13, color: st.changePct >= 0 ? 'var(--green)' : 'var(--red)' }}>{st.price > 0 ? fmtP(st.changePct) : ''}</span>
      </div>
      <FormGroup label="Quantité détenue">
        <input type="number" step="any" placeholder="ex: 15" min="0" defaultValue={initQty}
          onChange={e => setQty(e.target.value)} autoFocus style={inputStyle} />
      </FormGroup>
      <div style={{ fontSize: 12, color: 'var(--text-m)', marginBottom: 8 }}>
        Valeur estimée : <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text)' }}>{fmt((parseFloat(qty) || parseFloat(initQty) || 0) * st.price)}</span>
      </div>
      <ModalActions>
        <Btn onClick={() => setModal(null)}>Annuler</Btn>
        <Btn primary onClick={() => isEdit ? onEdit(modal.data.id, parseFloat(qty) || parseFloat(initQty)) : onAdd(parseFloat(qty))}>{isEdit ? 'Enregistrer' : 'Ajouter'}</Btn>
      </ModalActions>
    </Modal>
  );
}

function MetalModal({ modal, setModal, onAdd, onEdit }) {
  const [grams, setGrams] = useState('');
  const isAdd = modal?.type === 'addMetal';
  const isEdit = modal?.type === 'editMetal';
  if (!isAdd && !isEdit) return null;
  const mt = modal.data.metal;
  const initGrams = isEdit ? modal.data.grams : '';

  return (
    <Modal open={true} onClose={() => setModal(null)}>
      <ModalTitle>🥇 {mt.name} ({mt.symbol})</ModalTitle>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, marginBottom: 18 }}>
        {mt.pricePerGram > 0 ? fmt(mt.pricePerGram) + '/g' : '—'}
      </div>
      <FormGroup label="Quantité (grammes)">
        <input type="number" step="any" placeholder="ex: 100" min="0" defaultValue={initGrams}
          onChange={e => setGrams(e.target.value)} autoFocus style={inputStyle} />
      </FormGroup>
      <div style={{ fontSize: 12, color: 'var(--text-m)', marginBottom: 8 }}>
        Valeur estimée : <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text)' }}>{fmt((parseFloat(grams) || parseFloat(initGrams) || 0) * mt.pricePerGram)}</span>
      </div>
      <ModalActions>
        <Btn onClick={() => setModal(null)}>Annuler</Btn>
        <Btn primary onClick={() => isEdit ? onEdit(modal.data.id, parseFloat(grams) || parseFloat(initGrams)) : onAdd(parseFloat(grams))}>{isEdit ? 'Enregistrer' : 'Ajouter'}</Btn>
      </ModalActions>
    </Modal>
  );
}

function AssetModal({ modal, setModal, onAdd, onEdit }) {
  const isAdd = modal?.type === 'addAsset';
  const isEdit = modal?.type === 'editAsset';
  if (!isAdd && !isEdit) return null;
  const catKey = modal.data.catKey || modal.data.category;
  const cat = CATEGORIES[catKey];
  if (!cat) return null;
  const a = isEdit ? modal.data : {};

  const [name, setName] = useState(a.name || '');
  const [sub, setSub] = useState(a.subcategory || cat.subs[0]);
  const [value, setValue] = useState(a.value || '');
  const [revenu, setRevenu] = useState(a.revenu || '');
  const [revType, setRevType] = useState(a.rev_type || REV_TYPES[0]);
  const [remaining, setRemaining] = useState(a.remaining || '');
  const [notes, setNotes] = useState(a.notes || '');
  const isP = catKey === 'passif';

  function handleSave() {
    if (!name || !value) return;
    const data = { category: catKey, name, subcategory: sub, value: parseFloat(value) };
    if (!isP && revenu) { data.revenu = parseFloat(revenu); data.rev_type = revType; }
    if (isP && remaining) data.remaining = remaining;
    if (notes) data.notes = notes;
    isEdit ? onEdit(modal.data.id, data) : onAdd(data);
  }

  return (
    <Modal open={true} onClose={() => setModal(null)}>
      <ModalTitle>{isEdit ? 'Modifier' : 'Ajouter'} — {cat.label}</ModalTitle>
      <FormGroup label="Nom"><input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Appartement Paris 15e" autoFocus style={inputStyle} /></FormGroup>
      <FormGroup label="Sous-catégorie">
        <select value={sub} onChange={e => setSub(e.target.value)} style={inputStyle}>
          {cat.subs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </FormGroup>
      <FormRow>
        <FormGroup label="Valeur (€)"><input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="150000" style={inputStyle} /></FormGroup>
        {isP ? <FormGroup label="Durée restante"><input value={remaining} onChange={e => setRemaining(e.target.value)} placeholder="ex: 18 ans" style={inputStyle} /></FormGroup>
          : <FormGroup label="Revenu mensuel (€)"><input type="number" value={revenu} onChange={e => setRevenu(e.target.value)} placeholder="0" style={inputStyle} /></FormGroup>}
      </FormRow>
      {!isP && <FormGroup label="Type de revenu"><select value={revType} onChange={e => setRevType(e.target.value)} style={inputStyle}>{REV_TYPES.map(r => <option key={r}>{r}</option>)}</select></FormGroup>}
      <FormGroup label="Notes (optionnel)"><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Bail, numéro de compte…" style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} /></FormGroup>
      <ModalActions>
        <Btn onClick={() => setModal(null)}>Annuler</Btn>
        <Btn primary onClick={handleSave}>{isEdit ? 'Enregistrer' : 'Ajouter'}</Btn>
      </ModalActions>
    </Modal>
  );
}
