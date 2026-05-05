import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Server } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsRegister(v => !v);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.username, form.email, form.password, form.displayName || form.username);
      } else {
        await login(form.username, form.password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 24
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        border: '1px solid var(--border)',
        background: 'var(--bg-secondary)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <Terminal size={20} color="var(--accent)" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', letterSpacing: 1 }}>
              PRODIGY_FS_04
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
              Chat terminal en temps réel
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div style={{
          padding: '6px 24px',
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          color: 'var(--text-dim)'
        }}>
          <Server size={12} />
          <span>ws://localhost:5000</span>
          <div style={{ marginLeft: 'auto', color: 'var(--accent)' }}>PRÊT</div>
        </div>

        {/* Form */}
        <div style={{ padding: 24 }}>
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(255, 51, 102, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              fontSize: 12,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontWeight: 700 }}>[ERR]</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: 'var(--text-dim)',
                marginBottom: 6
              }}>
                nom d'utilisateur
              </label>
              <input
                type="text"
                className="input"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="entrer_pseudo"
                required
                style={{ textTransform: 'lowercase' }}
              />
            </div>

            {isRegister && (
              <>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: 'var(--text-dim)',
                    marginBottom: 6
                  }}>
                    nom affiché
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={form.displayName}
                    onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                    placeholder="nom_affiché (optionnel)"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: 'var(--text-dim)',
                    marginBottom: 6
                  }}>
                    email
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="utilisateur@domaine.com"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label style={{
                display: 'block',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: 'var(--text-dim)',
                marginBottom: 6
              }}>
                mot de passe
              </label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: 8, padding: '12px', fontSize: 13 }}
            >
              {loading ? (
                <span style={{ animation: 'blink 1s infinite' }}>_</span>
              ) : isRegister ? (
                <span>+ S'INSCRIRE</span>
              ) : (
                <span>→ CONNEXION</span>
              )}
            </button>
          </form>

          <div style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            textAlign: 'center'
          }}>
            <button
              onClick={toggleMode}
              className="btn"
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 11,
                color: 'var(--text-secondary)'
              }}
            >
              <span>{isRegister ? 'Déjà inscrit ?' : 'Nouvel utilisateur ?'} ›</span>
              <span style={{ color: 'var(--accent)' }}>{isRegister ? 'Se connecter' : 'S\'inscrire'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 24px',
          borderTop: '1px solid var(--border)',
          fontSize: 10,
          color: 'var(--text-dim)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>v1.0.0</span>
          <span>WebSocket / Socket.io</span>
        </div>
      </div>
    </div>
  );
}
