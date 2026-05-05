import React from 'react';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, X } from 'lucide-react';

export default function NotificationToast() {
  const { notifications, removeNotification } = useSocket();

  if (!notifications.length) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      {notifications.map((notif, i) => (
        <div
          key={notif.id}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--accent)',
            padding: '12px 16px',
            minWidth: 260,
            maxWidth: 360,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            animation: `slideIn 0.2s ease ${i * 0.05}s both`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}
        >
          <MessageSquare size={16} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {notif.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {notif.message}
            </div>
          </div>
          <button
            onClick={() => removeNotification(notif.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: 2,
              flexShrink: 0
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
