'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 36, width: 420, maxWidth: '92vw' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
          Mon <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Patrimoine</span>
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-m)', fontSize: 14, marginBottom: 28 }}>Connectez-vous à votre espace</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 5 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="vous@email.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: 14, outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 5 }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: 14, outline: 'none' }}
            />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px 20px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? .6 : 1 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-m)' }}>
          Pas encore de compte ?{' '}
          <a href="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Créer un compte</a>
        </p>
      </div>
    </div>
  );
}
