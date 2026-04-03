'use client';
import { useState } from 'react';
import { usePatrimoine } from '@/lib/usePatrimoine';
import { fmt } from '@/lib/format';
import PageActifs from '@/components/PageActifs';
import PagePassif from '@/components/PagePassif';
import { PageDashboard, PageRevenus, PageHistorique, PageAllocation, PageObjectifs } from '@/components/Pages';

export default function Dashboard() {
  const P = usePatrimoine();
  const [page, setPage] = useState('actifs');

  if (P.loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>💰</div>
        <div style={{ color: 'var(--text-m)', fontSize: 14 }}>Chargement de votre patrimoine...</div>
      </div>
    </div>
  );

  const net = P.netWorth();
  const act = P.totalActifs();
  const pas = P.totalPassif();
  const liq = P.liquidity();
  const rev = P.totalRev();
  const nb = P.assets.length + P.portfolio.length + P.metals.length;

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto', padding: '20px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600 }}>
          Mon <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Patrimoine</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: P.apiMode ? 'var(--green)' : 'var(--gold)' }}>
            {P.apiMode ? <><span className="live-dot"></span>Live</> : '⚠️ Prix hors-ligne'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-m)', fontFamily: "'JetBrains Mono', monospace" }}>
            {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <button onClick={P.logout} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-m)', fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Patrimoine net', value: fmt(net), color: 'var(--green)', sub: `${nb} actifs` },
          { label: 'Total actifs', value: fmt(act), sub: 'Brut' },
          { label: 'Total passif', value: fmt(pas), color: 'var(--red)', sub: `Ratio ${act > 0 ? Math.round(pas / act * 100) : 0}%` },
          { label: 'Liquidité dispo', value: fmt(liq.l), color: '#36c5dc', sub: `${liq.t > 0 ? Math.round(liq.l / liq.t * 100) : 0}% du patrimoine` },
          { label: 'Revenus passifs', value: fmt(rev) + '/an', color: 'var(--gold)', sub: `${fmt(Math.round(rev / 12))}/mois` },
        ].map((c, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 5 }}>{c.label}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 500, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-m)', marginTop: 4 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', flexWrap: 'wrap' }}>
        {[['actifs', 'Actifs'], ['passif', 'Passif'], ['dashboard', "Vue d'ensemble"], ['revenus', 'Revenus'], ['historique', 'Historique'], ['allocation', 'Allocation'], ['objectifs', '🎯 Objectifs']].map(([k, l]) => (
          <button key={k} onClick={() => setPage(k)}
            style={{ padding: '8px 18px', borderRadius: 24, border: `1px solid ${page === k ? 'var(--accent)' : 'var(--border)'}`, background: page === k ? 'var(--accent)' : 'transparent', color: page === k ? '#fff' : 'var(--text-m)', fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Pages */}
      {page === 'actifs' && <PageActifs P={P} />}
      {page === 'passif' && <PagePassif P={P} />}
      {page === 'dashboard' && <PageDashboard P={P} />}
      {page === 'revenus' && <PageRevenus P={P} />}
      {page === 'historique' && <PageHistorique P={P} />}
      {page === 'allocation' && <PageAllocation P={P} />}
      {page === 'objectifs' && <PageObjectifs P={P} />}
    </div>
  );
}
