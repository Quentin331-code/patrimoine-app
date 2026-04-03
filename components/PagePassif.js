'use client';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/data';
import { fmt, REV_TYPES } from '@/lib/format';
import Modal, { ModalTitle, FormGroup, FormRow, ModalActions, Btn, inputStyle } from '@/components/Modal';

export default function PagePassif({ P }) {
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const items = P.assets.filter(a => a.category === 'passif');
  const tot = P.totalPassif();

  async function handleAdd(data) { await P.addAsset(data); setModal(null); }
  async function handleEdit(id, data) { await P.updateAsset(id, data); setModal(null); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: '#f0605d18', color: '#f0605d' }}>📋</span>
            Passif (Dettes)
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 500, color: 'var(--red)' }}>{fmt(tot)}</span>
        </div>

        {items.length ? items.map(a => (
          <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto 26px 28px', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-input)', marginBottom: 5 }}>
            <div><div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div><div style={{ fontSize: 11, color: 'var(--text-m)' }}>{a.subcategory}{a.remaining ? ' · ' + a.remaining : ''}</div></div>
            <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: 'var(--red-bg)', color: 'var(--red)' }}>Dette</span>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500, textAlign: 'right', color: 'var(--red)' }}>{fmt(a.value)}</div>
            <button onClick={() => setModal({ type: 'edit', data: a })} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-d)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✎</button>
            <button onClick={() => setConfirm({ id: a.id, label: a.name })} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-d)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: 24, borderRadius: 10, border: '1px dashed var(--border)', background: 'var(--bg)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-m)' }}>Aucune dette</div>
            <div style={{ fontSize: 11, color: 'var(--text-d)', marginTop: 4 }}>Ajoutez vos crédits immobiliers, crédits conso, etc.</div>
          </div>
        )}

        <button onClick={() => setModal({ type: 'add' })}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 10, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-m)', fontSize: 12, fontFamily: "'Outfit', sans-serif", cursor: 'pointer', width: '100%', marginTop: 6 }}>
          + Ajouter une dette
        </button>
      </div>

      {/* Modal */}
      {modal && <PassifModal modal={modal} setModal={setModal} onAdd={handleAdd} onEdit={handleEdit} />}

      {/* Confirm */}
      {confirm && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid var(--red)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 12px 40px rgba(0,0,0,.5)', zIndex: 1100 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Supprimer <strong>{confirm.label}</strong> ?</span>
          <button onClick={() => setConfirm(null)} style={{ padding: '7px 16px', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-m)' }}>Annuler</button>
          <button onClick={async () => { await P.deleteAsset(confirm.id); setConfirm(null); }} style={{ padding: '7px 16px', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--red)', color: '#fff' }}>Supprimer</button>
        </div>
      )}
    </div>
  );
}

function PassifModal({ modal, setModal, onAdd, onEdit }) {
  const cat = CATEGORIES.passif;
  const a = modal.type === 'edit' ? modal.data : {};
  const [name, setName] = useState(a.name || '');
  const [sub, setSub] = useState(a.subcategory || cat.subs[0]);
  const [value, setValue] = useState(a.value || '');
  const [remaining, setRemaining] = useState(a.remaining || '');
  const [notes, setNotes] = useState(a.notes || '');

  function save() {
    if (!name || !value) return;
    const data = { category: 'passif', name, subcategory: sub, value: parseFloat(value) };
    if (remaining) data.remaining = remaining;
    if (notes) data.notes = notes;
    modal.type === 'edit' ? onEdit(a.id, data) : onAdd(data);
  }

  return (
    <Modal open={true} onClose={() => setModal(null)}>
      <ModalTitle>{modal.type === 'edit' ? 'Modifier' : 'Ajouter'} une dette</ModalTitle>
      <FormGroup label="Nom"><input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Crédit appart Paris" autoFocus style={inputStyle} /></FormGroup>
      <FormGroup label="Type"><select value={sub} onChange={e => setSub(e.target.value)} style={inputStyle}>{cat.subs.map(s => <option key={s}>{s}</option>)}</select></FormGroup>
      <FormRow>
        <FormGroup label="Montant (€)"><input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="280000" style={inputStyle} /></FormGroup>
        <FormGroup label="Durée restante"><input value={remaining} onChange={e => setRemaining(e.target.value)} placeholder="ex: 18 ans" style={inputStyle} /></FormGroup>
      </FormRow>
      <FormGroup label="Notes"><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optionnel…" style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} /></FormGroup>
      <ModalActions><Btn onClick={() => setModal(null)}>Annuler</Btn><Btn primary onClick={save}>{modal.type === 'edit' ? 'Enregistrer' : 'Ajouter'}</Btn></ModalActions>
    </Modal>
  );
}
