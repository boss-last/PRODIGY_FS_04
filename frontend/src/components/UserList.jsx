import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MessageCircle, Search } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function UserList({ activeChat, setActiveChat }) {
  const { token, user: me } = useAuth();
  const { onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchUsers();
    const iv = setInterval(fetchUsers, 10000);
    return () => clearInterval(iv);
  }, [token]);

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  const getOnlineStatus = (userId) => {
    const online = onlineUsers.find(u => u.userId === userId);
    return online?.status || 'offline';
  };

  const filtered = users.filter(u =>
    (u.username?.toLowerCase().includes(search.toLowerCase()) ||
     u.displayName?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-dim)', fontWeight: 700 }}>
          Users
        </span>
      </div>

      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="input"
            placeholder="search_users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 30, fontSize: 12 }}
          />
        </div>
      </div>

      <div style={{ padding: '4px 0' }}>
        {filtered.map(user => {
          const isActive = activeChat?.type === 'dm' && activeChat?.id === user._id;
          const status = getOnlineStatus(user._id);
          return (
            <div
              key={user._id}
              onClick={() => setActiveChat({
                type: 'dm',
                id: user._id,
                name: user.displayName || user.username,
                username: user.username
              })}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                background: isActive ? 'var(--accent-bg)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.1s ease'
              }}
            >
              <span className={`status-dot ${status}`} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12,
                  color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.displayName || user.username}
                </div>
                {user.statusMessage && (
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.statusMessage}
                  </div>
                )}
              </div>
              <MessageCircle size={12} color="var(--text-dim)" />
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 11 }}>
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
