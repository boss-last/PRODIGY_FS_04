import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { LogOut } from 'lucide-react';

export default function Chat() {
  const { user, logout } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [view, setView] = useState('rooms');

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)'
    }}>
      {/* Top Bar */}
      <div style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        background: 'var(--bg-secondary)',
        flexShrink: 0
      }}>
        <div style={{
          fontSize: 13,
          fontWeight: 800,
          color: 'var(--accent)',
          letterSpacing: 2,
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{ fontFamily: 'var(--font-term)', fontSize: 18 }}>></span>
          PRODIGY_FS_04
        </div>

        <div style={{ flex: 1 }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 12
        }}>
          <span style={{ color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--accent)' }}>@</span>{user?.username}
          </span>
          <button
            onClick={logout}
            className="btn"
            style={{
              padding: '4px 10px',
              fontSize: 11,
              background: 'transparent',
              border: '1px solid var(--border)'
            }}
          >
            <LogOut size={12} /> EXIT
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        <Sidebar
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          view={view}
          setView={setView}
        />
        <ChatWindow
          activeChat={activeChat}
          view={view}
        />
      </div>
    </div>
  );
}
