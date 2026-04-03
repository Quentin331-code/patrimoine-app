'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { STOCKS_DB, METALS_DB, CATEGORIES } from '@/lib/data';

const AK = Object.keys(CATEGORIES).filter(k => k !== 'passif');

export function usePatrimoine() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [metals, setMetals] = useState([]);
  const [targets, setTargets] = useState({});
  const [history, setHistory] = useState([]);
  const [goals, setGoals] = useState([]);
  const [prices, setPrices] = useState({ stocks: {}, crypto: {}, metals: {} });
  const [apiMode, setApiMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get live stock data with real prices merged
  const getLiveStocks = useCallback(() => {
    return STOCKS_DB.map(s => {
      const livePrice = prices.stocks[s.ticker] || prices.crypto[s.ticker];
      return {
        ...s,
        price: livePrice?.price ?? 0,
        changePct: livePrice?.changePct ?? 0,
      };
    });
  }, [prices]);

  // Get live metal data
  const getLiveMetals = useCallback(() => {
    return METALS_DB.map(m => {
      const livePrice = prices.metals[m.id];
      return {
        ...m,
        pricePerGram: livePrice?.pricePerGram ?? 0,
        changePct: 0,
      };
    });
  }, [prices]);

  // Fetch user data from Supabase
  const fetchData = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) return;
    setUser(u);

    const [a, p, m, t, h, g] = await Promise.all([
      supabase.from('assets').select('*').eq('user_id', u.id),
      supabase.from('portfolio').select('*').eq('user_id', u.id),
      supabase.from('metals').select('*').eq('user_id', u.id),
      supabase.from('targets').select('*').eq('user_id', u.id),
      supabase.from('history').select('*').eq('user_id', u.id).order('created_at'),
      supabase.from('goals').select('*').eq('user_id', u.id),
    ]);

    setAssets(a.data || []);
    setPortfolio(p.data || []);
    setMetals(m.data || []);
    setHistory(h.data || []);
    setGoals(g.data || []);

    const tObj = {};
    AK.forEach(k => { tObj[k] = 0; });
    (t.data || []).forEach(row => { tObj[row.category] = row.percentage; });
    setTargets(tObj);

    setLoading(false);
  }, [supabase]);

  // Fetch live prices from our API route
  const fetchPrices = useCallback(async () => {
    try {
      const r = await fetch('/api/prices');
      if (r.ok) {
        const data = await r.json();
        setPrices({ stocks: data.stocks || {}, crypto: data.crypto || {}, metals: data.metals || {} });
        setApiMode(!!(data.sources?.crypto || data.sources?.stocks || data.sources?.metals));
      }
    } catch (e) {
      console.error('Price fetch error:', e);
    }
  }, []);

  // Init
  useEffect(() => {
    fetchData();
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchData, fetchPrices]);

  // ==================== CRUD OPERATIONS ====================

  // Assets
  async function addAsset(data) {
    const { data: row, error } = await supabase.from('assets').insert({ ...data, user_id: user.id }).select().single();
    if (!error && row) setAssets(prev => [...prev, row]);
    return { row, error };
  }
  async function updateAsset(id, data) {
    const { error } = await supabase.from('assets').update({ ...data, updated_at: new Date() }).eq('id', id);
    if (!error) setAssets(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    return { error };
  }
  async function deleteAsset(id) {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (!error) setAssets(prev => prev.filter(a => a.id !== id));
    return { error };
  }

  // Portfolio
  async function addPortfolio(data) {
    const { data: row, error } = await supabase.from('portfolio').insert({ ...data, user_id: user.id }).select().single();
    if (!error && row) setPortfolio(prev => [...prev, row]);
    return { row, error };
  }
  async function updatePortfolio(id, data) {
    const { error } = await supabase.from('portfolio').update({ ...data, updated_at: new Date() }).eq('id', id);
    if (!error) setPortfolio(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    return { error };
  }
  async function deletePortfolio(id) {
    const { error } = await supabase.from('portfolio').delete().eq('id', id);
    if (!error) setPortfolio(prev => prev.filter(p => p.id !== id));
    return { error };
  }

  // Metals
  async function addMetal(data) {
    const { data: row, error } = await supabase.from('metals').insert({ ...data, user_id: user.id }).select().single();
    if (!error && row) setMetals(prev => [...prev, row]);
    return { row, error };
  }
  async function updateMetal(id, data) {
    const { error } = await supabase.from('metals').update({ ...data, updated_at: new Date() }).eq('id', id);
    if (!error) setMetals(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    return { error };
  }
  async function deleteMetal(id) {
    const { error } = await supabase.from('metals').delete().eq('id', id);
    if (!error) setMetals(prev => prev.filter(m => m.id !== id));
    return { error };
  }

  // Targets
  async function setTarget(category, percentage) {
    const { error } = await supabase.from('targets').upsert(
      { user_id: user.id, category, percentage },
      { onConflict: 'user_id,category' }
    );
    if (!error) setTargets(prev => ({ ...prev, [category]: percentage }));
    return { error };
  }

  // History
  async function addSnapshot() {
    const nw = netWorth();
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
    const { data: row, error } = await supabase.from('history').insert({ user_id: user.id, date, value: nw }).select().single();
    if (!error && row) setHistory(prev => [...prev, row]);
    return { row, error };
  }
  async function deleteSnapshot(id) {
    const { error } = await supabase.from('history').delete().eq('id', id);
    if (!error) setHistory(prev => prev.filter(h => h.id !== id));
    return { error };
  }
  async function clearHistory() {
    const { error } = await supabase.from('history').delete().eq('user_id', user.id);
    if (!error) setHistory([]);
    return { error };
  }

  // Goals
  async function addGoal(data) {
    const { data: row, error } = await supabase.from('goals').insert({ ...data, user_id: user.id }).select().single();
    if (!error && row) setGoals(prev => [...prev, row]);
    return { row, error };
  }
  async function updateGoal(id, data) {
    const { error } = await supabase.from('goals').update(data).eq('id', id);
    if (!error) setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    return { error };
  }
  async function deleteGoal(id) {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (!error) setGoals(prev => prev.filter(g => g.id !== id));
    return { error };
  }

  // Logout
  async function logout() {
    await supabase.auth.signOut(); window.location.href = '/login';
    setUser(null);
  }

  // ==================== COMPUTED VALUES ====================
  const liveStocks = getLiveStocks();
  const liveMetals = getLiveMetals();

  function catTotal(k) {
    let t = assets.filter(a => a.category === k).reduce((s, a) => s + Number(a.value), 0);
    if (k === 'bourse') portfolio.filter(p => { const s = liveStocks.find(x => x.ticker === p.ticker); return s && s.type !== 'Crypto'; }).forEach(p => { const s = liveStocks.find(x => x.ticker === p.ticker); if (s) t += s.price * Number(p.qty); });
    if (k === 'crypto') portfolio.filter(p => { const s = liveStocks.find(x => x.ticker === p.ticker); return s && s.type === 'Crypto'; }).forEach(p => { const s = liveStocks.find(x => x.ticker === p.ticker); if (s) t += s.price * Number(p.qty); });
    if (k === 'or') metals.forEach(m => { const mt = liveMetals.find(x => x.id === m.metal_id); if (mt) t += mt.pricePerGram * Number(m.grams); });
    return t;
  }

  function totalActifs() { return AK.reduce((s, k) => s + catTotal(k), 0); }
  function totalPassif() { return assets.filter(a => a.category === 'passif').reduce((s, a) => s + Number(a.value), 0); }
  function netWorth() { return totalActifs() - totalPassif(); }
  function totalRev() { return assets.filter(a => a.category !== 'passif' && a.revenu).reduce((s, a) => s + Number(a.revenu) * 12, 0); }

  function liquidity() {
    let l = 0, se = 0, il = 0;
    AK.forEach(k => { const c = CATEGORIES[k], t = catTotal(k); if (c.liq === 'liquid') l += t; else if (c.liq === 'semi') se += t; else il += t; });
    return { l, se, il, t: l + se + il };
  }

  return {
    user, loading, apiMode, liveStocks, liveMetals,
    assets, portfolio, metals, targets, history, goals,
    addAsset, updateAsset, deleteAsset,
    addPortfolio, updatePortfolio, deletePortfolio,
    addMetal, updateMetal, deleteMetal,
    setTarget, addSnapshot, deleteSnapshot, clearHistory,
    addGoal, updateGoal, deleteGoal,
    logout, fetchPrices,
    catTotal, totalActifs, totalPassif, netWorth, totalRev, liquidity,
  };
}
