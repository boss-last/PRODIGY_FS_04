import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, Paperclip, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function MessageInput({ activeChat }) {
  const { token } = useAuth();
  const { sendMessage, sendTyping, sendStopTyping } = useSocket();
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const handleTyping = useCallback(() => {
    if (activeChat?.type === 'room') {
      sendTyping({ roomId: activeChat.id });
    } else if (activeChat?.type === 'dm') {
      sendTyping({ recipientId: activeChat.id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (activeChat?.type === 'room') {
        sendStopTyping({ roomId: activeChat.id });
      } else if (activeChat?.type === 'dm') {
        sendStopTyping({ recipientId: activeChat.id });
      }
    }, 1500);
  }, [activeChat, sendTyping, sendStopTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file) return;
    if (!activeChat) return;

    let fileData = null;
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (res.ok) fileData = await res.json();
      } catch (err) {
        console.error('Upload failed', err);
      } finally {
        setUploading(false);
      }
    }

    const msgData = {
      content: content.trim() || (fileData ? `[${fileData.fileName}]` : ''),
      type: fileData?.mimetype?.startsWith('image/') ? 'image' : fileData ? 'file' : 'text'
    };

    if (activeChat.type === 'room') {
      msgData.roomId = activeChat.id;
    } else {
      msgData.recipientId = activeChat.id;
    }

    if (fileData) {
      msgData.fileUrl = fileData.url;
      msgData.fileName = fileData.fileName;
      msgData.fileSize = fileData.fileSize;
    }

    sendMessage(msgData);
    setContent('');
    setFile(null);
    inputRef.current?.focus();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (activeChat?.type === 'room') {
      sendStopTyping({ roomId: activeChat.id });
    } else if (activeChat?.type === 'dm') {
      sendStopTyping({ recipientId: activeChat.id });
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
    e.target.value = '';
  };

  if (!activeChat) return null;

  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
      flexShrink: 0
    }}>
      {file && (
        <div style={{
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-tertiary)'
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Attaching:</span>
          <span style={{ fontSize: 12, color: 'var(--accent)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.name}
          </span>
          <button
            onClick={() => setFile(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 2 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          height: 'var(--input-height)'
        }}
      >
        <label style={{ cursor: 'pointer', padding: 6, color: 'var(--text-dim)' }}>
          <Paperclip size={18} />
          <input type="file" hidden onChange={handleFileChange} />
        </label>

        <input
          ref={inputRef}
          type="text"
          className="input"
          value={content}
          onChange={e => { setContent(e.target.value); handleTyping(); }}
          placeholder={activeChat.type === 'room'
            ? `Message #${activeChat.name}...`
            : `Message @${activeChat.username}...`
          }
          disabled={uploading}
          style={{ flex: 1, borderRadius: 6 }}
        />

        <button
          type="submit"
          className="btn btn-primary"
          disabled={(!content.trim() && !file) || uploading}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            opacity: (!content.trim() && !file) || uploading ? 0.4 : 1
          }}
        >
          {uploading ? (
            <span style={{ animation: 'blink 1s infinite' }}>...</span>
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
    </div>
  );
}
