import React from 'react';
import RoomList from './RoomList';
import UserList from './UserList';

export default function Sidebar({ activeChat, setActiveChat, view, setView }) {
  return (
    <div style={{
      width: 'var(--sidebar-width)',
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)'
      }}>
        {['rooms', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            style={{
              flex: 1,
              padding: '10px 0',
              background: view === tab ? 'var(--bg-tertiary)' : 'transparent',
              border: 'none',
              borderBottom: view === tab ? '2px solid var(--accent)' : '2px solid transparent',
              color: view === tab ? 'var(--accent)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {view === 'rooms' ? (
          <RoomList activeChat={activeChat} setActiveChat={setActiveChat} />
        ) : (
          <UserList activeChat={activeChat} setActiveChat={setActiveChat} />
        )}
      </div>
    </div>
  );
}
