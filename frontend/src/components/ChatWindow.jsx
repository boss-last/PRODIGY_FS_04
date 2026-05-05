import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Hash, MessageSquare, Users } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function ChatWindow({ activeChat, view }) {
  const { token, user: me } = useAuth();
  const { joinRoom, leaveRoom, socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      setRoomInfo(null);
      setUserInfo(null);
      return;
    }

    setMessages([]);
    if (activeChat.type === 'room') {
      joinRoom(activeChat.id);
      fetchRoomMessages();
      fetchRoomInfo();
    } else {
      fetchDMMessages();
      fetchUserInfo();
    }

    return () => {
      if (activeChat.type === 'room') {
        leaveRoom(activeChat.id);
      }
    };
  }, [activeChat]);

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg) => {
      if (activeChat?.type === 'room' && msg.room === activeChat.id) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const onNewDM = (msg) => {
      if (activeChat?.type === 'dm') {
        const myId = me?._id;
        const otherId = activeChat.id;
        const isRelevant =
          (msg.sender._id === otherId && msg.recipient === myId) ||
          (msg.sender._id === myId && msg.recipient === otherId);
        if (isRelevant) {
          setMessages(prev => [...prev, msg]);
        }
      }
    };

    socket.on('new_message', onNewMessage);
    socket.on('new_dm', onNewDM);

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('new_dm', onNewDM);
    };
  }, [socket, activeChat]);

  const fetchRoomMessages = async () => {
    if (!activeChat) return;
    setLoading(true);
    const res = await fetch(`${API_URL}/messages/room/${activeChat.id}?limit=50`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setMessages(await res.json());
    setLoading(false);
  };

  const fetchDMMessages = async () => {
    if (!activeChat) return;
    setLoading(true);
    const res = await fetch(`${API_URL}/messages/dm/${activeChat.id}?limit=50`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setMessages(await res.json());
    setLoading(false);
  };

  const fetchRoomInfo = async () => {
    if (!activeChat) return;
    const res = await fetch(`${API_URL}/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const rooms = await res.json();
      const room = rooms.find(r => r._id === activeChat.id);
      setRoomInfo(room);
    }
  };

  const fetchUserInfo = async () => {
    if (!activeChat) return;
    const res = await fetch(`${API_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const users = await res.json();
      const u = users.find(x => x._id === activeChat.id);
      setUserInfo(u);
    }
  };

  if (!activeChat) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        color: 'var(--text-dim)'
      }}>
        <Hash size={48} strokeWidth={1} />
        <div style={{ fontSize: 14, fontWeight: 600 }}>Select a channel or user to start chatting</div>
        <div style={{ fontSize: 11 }}>Real-time messaging powered by Socket.io</div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      background: 'var(--bg-primary)'
    }}>
      {/* Chat Header */}
      <div style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
        gap: 10
      }}>
        {activeChat.type === 'room' ? (
          <Hash size={16} color="var(--accent)" />
        ) : (
          <MessageSquare size={16} color="var(--accent)" />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeChat.name}
          </div>
          {roomInfo?.description && (
            <div style={{ fontSize: 10, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {roomInfo.description}
            </div>
          )}
          {userInfo && (
            <div style={{ fontSize: 10, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className={`status-dot ${userInfo.status}`} />
              {userInfo.status}
            </div>
          )}
        </div>
        {activeChat.type === 'room' && roomInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-dim)' }}>
            <Users size={12} />
            {roomInfo.members?.length || 0}
          </div>
        )}
      </div>

      <MessageList messages={messages} loading={loading} activeChat={activeChat} />
      <MessageInput activeChat={activeChat} />
    </div>
  );
}
