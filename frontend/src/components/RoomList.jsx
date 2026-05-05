import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Hash, Plus, Lock, Users } from 'lucide-react';
import CreateRoomModal from './CreateRoomModal';

const API_URL = 'http://localhost:5000/api';

export default function RoomList({ activeChat, setActiveChat }) {
  const { token, user: me } = useAuth();
  const { connected } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchRooms();
    const iv = setInterval(fetchRooms, 5000);
    return () => clearInterval(iv);
  }, [token]);

  const fetchRooms = async () => {
    const res = await fetch(`${API_URL}/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setRooms(data);
    }
  };

  const handleJoin = async (roomId) => {
    await fetch(`${API_URL}/rooms/${roomId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchRooms();
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)'
      }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-dim)', fontWeight: 700 }}>
          Channels
        </span>
        <button
          onClick={() => setShowCreate(true)}
          className="btn"
          style={{ padding: '3px 8px', fontSize: 10 }}
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Connection status */}
      <div style={{
        padding: '6px 16px',
        fontSize: 10,
        color: connected ? 'var(--accent)' : 'var(--error)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: connected ? 'var(--accent)' : 'var(--error)',
          display: 'inline-block',
          animation: connected ? 'pulse 2s infinite' : 'none'
        }} />
        {connected ? 'CONNECTED' : 'OFFLINE'}
      </div>

      {/* Room list */}
      <div style={{ padding: '4px 0' }}>
        {rooms.map(room => {
          const isActive = activeChat?.type === 'room' && activeChat?.id === room._id;
          const isMember = room.members?.some(m => m._id === me?._id) || room.type === 'public';
          return (
            <div
              key={room._id}
              onClick={() => {
                if (isMember) {
                  setActiveChat({ type: 'room', id: room._id, name: room.name });
                }
              }}
              style={{
                padding: '8px 16px',
                cursor: isMember ? 'pointer' : 'default',
                background: isActive ? 'var(--accent-bg)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.1s ease'
              }}
            >
              {room.type === 'private' ? (
                <Lock size={12} color="var(--text-dim)" />
              ) : (
                <Hash size={12} color="var(--text-dim)" />
              )}
              <span style={{
                flex: 1,
                fontSize: 12,
                color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                fontWeight: isActive ? 600 : 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {room.name}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Users size={10} />
                {room.members?.length || 0}
              </span>
            </div>
          );
        })}
        {rooms.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 11 }}>
            No channels found.
            <br />
            Create one to get started.
          </div>
        )}
      </div>

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchRooms}
        />
      )}
    </div>
  );
}
