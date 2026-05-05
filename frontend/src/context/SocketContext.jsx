import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token) return;

    const socket = io('http://localhost:5000', {
      auth: { token }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[SOCKET] Connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[SOCKET] Disconnected');
      setConnected(false);
    });

    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('user_status_change', ({ userId, status }) => {
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.userId === userId);
        if (exists) {
          return prev.map(u => u.userId === userId ? { ...u, status } : u);
        }
        return [...prev, { userId, status }];
      });
    });

    socket.on('typing', ({ userId, username, roomId }) => {
      const key = roomId ? `room_${roomId}` : `dm_${userId}`;
      setTypingUsers(prev => ({
        ...prev,
        [key]: { username, timestamp: Date.now() }
      }));
      setTimeout(() => {
        setTypingUsers(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }, 3000);
    });

    socket.on('stop_typing', ({ userId, roomId }) => {
      const key = roomId ? `room_${roomId}` : `dm_${userId}`;
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    });

    socket.on('new_dm', (message) => {
      if (message.sender._id !== user?._id) {
        addNotification({
          type: 'dm',
          title: message.sender.displayName || message.sender.username,
          message: message.content.substring(0, 60),
          senderId: message.sender._id
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  const addNotification = (notif) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev.slice(-4), { ...notif, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const sendMessage = (data) => {
    socketRef.current?.emit('send_message', data);
  };

  const joinRoom = (roomId) => {
    socketRef.current?.emit('join_room', roomId);
  };

  const leaveRoom = (roomId) => {
    socketRef.current?.emit('leave_room', roomId);
  };

  const sendTyping = (data) => {
    socketRef.current?.emit('typing', data);
  };

  const sendStopTyping = (data) => {
    socketRef.current?.emit('stop_typing', data);
  };

  const markRead = (messageId) => {
    socketRef.current?.emit('mark_read', messageId);
  };

  const updateStatus = (status, statusMessage) => {
    socketRef.current?.emit('update_status', { status, statusMessage });
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      onlineUsers,
      typingUsers,
      notifications,
      sendMessage,
      joinRoom,
      leaveRoom,
      sendTyping,
      sendStopTyping,
      markRead,
      updateStatus,
      addNotification,
      removeNotification
    }}>
      {children}
    </SocketContext.Provider>
  );
}
