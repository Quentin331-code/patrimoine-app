'use client';

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(10px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
        padding: 26, width: 480, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,.5)',
      }}>
        {children}
      </div>
    </div>
  );
}

export function ModalTitle({ children }) {
  return <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>{children}</h3>;
}

export function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

export function FormRow({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>;
}

export const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: '1px solid var(--border)', background: 'var(--bg-input)',
  color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: 13,
  outline: 'none',
};

export function ModalActions({ children }) {
  return <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>{children}</div>;
}

export function Btn({ children, primary, danger, small, onClick, disabled, style: s }) {
  const base = {
    flex: 1, padding: small ? '7px 14px' : '10px 18px', borderRadius: 10,
    fontFamily: "'Outfit', sans-serif", fontSize: small ? 12 : 13, fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer', border: 'none', opacity: disabled ? .6 : 1,
    transition: 'all .2s', ...s,
  };
  if (primary) Object.assign(base, { background: 'var(--accent)', color: '#fff' });
  else if (danger) Object.assign(base, { background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid transparent' });
  else Object.assign(base, { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-m)' });
  return <button style={base} onClick={onClick} disabled={disabled}>{children}</button>;
}
