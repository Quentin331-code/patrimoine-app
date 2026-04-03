'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 36, width: 420, maxWidth: '92vw', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Vérifiez vos emails</h2>
          <p style={{ color: 'var(--text-m)', fontSize: 14 }}>Un lien de confirmation a été envoyé à <strong>{email}</strong>. Cliquez dessus puis connectez-vous.</p>
          <a href="/login" style={{ display: 'inline-block', marginTop: 20, padding: '10px 24px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Aller au login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 36, width: 420, maxWidth: '92vw' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
          Mon <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Patrimoine</span>
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-m)', fontSize: 14, marginBottom: 28 }}>Créez votre compte gratuitement</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 5 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="vous@email.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: 14, outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 5 }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="Min. 6 caractères"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: 14, outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 5 }}>Confirmer le mot de passe</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: 14, outline: 'none' }}
            />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px 20px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? .6 : 1 }}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-m)' }}>
          Déjà un compte ?{' '}
          <a href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Se connecter</a>
        </p>
      </div>
    </div>
  );
}
