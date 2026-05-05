import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Hash } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function CreateRoomModal({ onClose, onCreated }) {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [roomType, setRoomType] = useState('public');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, type: roomType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9998
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
      }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
            <Hash size={14} color="var(--accent)" />
            New Channel
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 2 }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255, 51, 102, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              fontSize: 11
            }}>
              [ERR] {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-dim)', marginBottom: 6 }}>
              Channel Name
            </label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="general"
              required
              maxLength={50}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-dim)', marginBottom: 6 }}>
              Description
            </label>
            <input
              type="text"
              className="input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              maxLength={200}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-dim)', marginBottom: 6 }}>
              Type
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['public', 'private'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setRoomType(t)}
                  className="btn"
                  style={{
                    flex: 1,
                    background: roomType === t ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                    borderColor: roomType === t ? 'var(--accent)' : 'var(--border)',
                    color: roomType === t ? 'var(--accent)' : 'var(--text-secondary)'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Creating...' : 'Create Channel'}
          </button>
        </form>
      </div>
    </div>
  );
}
