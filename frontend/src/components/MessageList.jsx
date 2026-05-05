import React, { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FileText, Image, Download, Clock } from 'lucide-react';

export default function MessageList({ messages, loading, activeChat }) {
  const { user: me } = useAuth();
  const { typingUsers } = useSocket();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const typingKey = activeChat?.type === 'room'
    ? `room_${activeChat.id}`
    : `dm_${activeChat?.id}`;
  const typing = typingUsers[typingKey];

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return <Image size={14} />;
    return <FileText size={14} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  let lastDate = null;

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {loading && messages.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)', fontSize: 11 }}>
          <span style={{ animation: 'blink 1s infinite' }}>Loading messages...</span>
        </div>
      )}

      {messages.map((msg, i) => {
        const msgDate = new Date(msg.createdAt).toDateString();
        const showDate = msgDate !== lastDate;
        lastDate = msgDate;
        const isMe = msg.sender?._id === me?._id;
        const isSystem = msg.type === 'system';

        if (isSystem) {
          return (
            <div key={msg._id || i} style={{
              textAlign: 'center',
              padding: '6px 0',
              fontSize: 11,
              color: 'var(--text-dim)',
              fontStyle: 'italic'
            }}>
              <span style={{ color: 'var(--accent)', opacity: 0.6 }}>--</span> {msg.content} <span style={{ color: 'var(--accent)', opacity: 0.6 }}>--</span>
            </div>
          );
        }

        return (
          <React.Fragment key={msg._id || i}>
            {showDate && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                margin: '12px 0',
                color: 'var(--text-dim)',
                fontSize: 10
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <Clock size={10} />
                {formatDate(msg.createdAt)}
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
            )}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMe ? 'flex-end' : 'flex-start',
              marginBottom: 6,
              animation: 'fadeIn 0.15s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 8,
                flexDirection: isMe ? 'row-reverse' : 'row',
                maxWidth: '75%'
              }}>
                <div style={{
                  background: isMe ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                  border: `1px solid ${isMe ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '8px 12px',
                  minWidth: 0
                }}>
                  {!isMe && (
                    <div style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--accent)',
                      marginBottom: 3,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}>
                      {msg.sender?.displayName || msg.sender?.username || 'Unknown'}
                    </div>
                  )}

                  {msg.type === 'image' && msg.fileUrl ? (
                    <img
                      src={msg.fileUrl}
                      alt={msg.fileName || 'image'}
                      style={{
                        maxWidth: 280,
                        maxHeight: 200,
                        borderRadius: 4,
                        display: 'block',
                        marginBottom: 4,
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(msg.fileUrl, '_blank')}
                    />
                  ) : msg.type === 'file' && msg.fileUrl ? (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontSize: 12,
                        marginBottom: 4
                      }}
                    >
                      {getFileIcon(msg.fileName)}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {msg.fileName}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                          {formatFileSize(msg.fileSize)}
                        </div>
                      </div>
                      <Download size={14} color="var(--accent)" />
                    </a>
                  ) : null}

                  {msg.content && (
                    <div style={{
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      wordBreak: 'break-word',
                      lineHeight: 1.5
                    }}>
                      {msg.content}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 4,
                    justifyContent: isMe ? 'flex-end' : 'flex-start'
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                      {formatTime(msg.createdAt)}
                    </span>
                    {msg.edited && (
                      <span style={{ fontSize: 9, color: 'var(--text-dim)', fontStyle: 'italic' }}>edited</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {typing && (
        <div style={{
          padding: '4px 0',
          fontSize: 11,
          color: 'var(--text-dim)',
          fontStyle: 'italic',
          animation: 'fadeIn 0.2s ease'
        }}>
          <span style={{ color: 'var(--accent)' }}>{typing.username}</span> is typing
          <span style={{ animation: 'blink 1s infinite' }}>...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
