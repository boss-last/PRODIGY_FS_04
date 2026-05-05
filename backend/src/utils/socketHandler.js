import Message from '../models/Message.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

const onlineUsers = new Map();

export function handleSocketEvents(io) {
  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const username = socket.username;

    console.log(`[SOCKET] ${username} connected (${socket.id})`);
    onlineUsers.set(userId, { socketId: socket.id, username, status: 'online' });

    await User.findByIdAndUpdate(userId, {
      status: 'online',
      socketId: socket.id,
      lastSeen: new Date()
    });

    socket.join(`user:${userId}`);
    const rooms = await Room.find({ members: userId });
    rooms.forEach(room => socket.join(`room:${room._id}`));

    io.emit('user_status_change', { userId, status: 'online' });
    io.emit('online_users', Array.from(onlineUsers.entries()).map(([uid, data]) => ({
      userId: uid,
      ...data
    })));

    socket.on('join_room', async (roomId) => {
      socket.join(`room:${roomId}`);
      const room = await Room.findByIdAndUpdate(roomId,
        { $addToSet: { members: userId } },
        { new: true }
      );
      socket.to(`room:${roomId}`).emit('user_joined', { userId, username, roomId });

      const sysMsg = await Message.create({
        room: roomId,
        content: `${username} joined the room`,
        type: 'system',
        sender: userId
      });
      io.to(`room:${roomId}`).emit('new_message', sysMsg);
    });

    socket.on('leave_room', async (roomId) => {
      socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('user_left', { userId, username, roomId });
    });

    socket.on('send_message', async (data) => {
      try {
        const { roomId, recipientId, content, type, fileUrl, fileName, fileSize } = data;
        const messageData = {
          sender: userId,
          content,
          type: type || 'text',
          fileUrl: fileUrl || '',
          fileName: fileName || '',
          fileSize: fileSize || 0
        };
        if (roomId) messageData.room = roomId;
        if (recipientId) messageData.recipient = recipientId;

        const message = await Message.create(messageData);
        await message.populate('sender', 'username displayName avatar');

        if (roomId) {
          io.to(`room:${roomId}`).emit('new_message', message);
        } else if (recipientId) {
          io.to(`user:${recipientId}`).to(`user:${userId}`).emit('new_dm', message);
        }
      } catch (err) {
        console.error('[SOCKET] send_message error:', err);
      }
    });

    socket.on('typing', (data) => {
      const { roomId, recipientId } = data;
      if (roomId) {
        socket.to(`room:${roomId}`).emit('typing', { userId, username, roomId });
      } else if (recipientId) {
        socket.to(`user:${recipientId}`).emit('typing', { userId, username });
      }
    });

    socket.on('stop_typing', (data) => {
      const { roomId, recipientId } = data;
      if (roomId) {
        socket.to(`room:${roomId}`).emit('stop_typing', { userId, roomId });
      } else if (recipientId) {
        socket.to(`user:${recipientId}`).emit('stop_typing', { userId });
      }
    });

    socket.on('mark_read', async (messageId) => {
      await Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: userId } });
    });

    socket.on('update_status', async ({ status, statusMessage }) => {
      await User.findByIdAndUpdate(userId, { status, statusMessage, lastSeen: new Date() });
      onlineUsers.set(userId, { ...onlineUsers.get(userId), status });
      io.emit('user_status_change', { userId, status, statusMessage });
    });

    socket.on('disconnect', async () => {
      console.log(`[SOCKET] ${username} disconnected`);
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, {
        status: 'offline',
        socketId: '',
        lastSeen: new Date()
      });
      io.emit('user_status_change', { userId, status: 'offline' });
      io.emit('online_users', Array.from(onlineUsers.entries()).map(([uid, data]) => ({
        userId: uid,
        ...data
      })));
    });
  });
}
