import { io } from 'socket.io-client';

const URL = 'https://itecony-neriva-backend.onrender.com';

class SocketService {
  socket = null;

  connect() {
    if (this.socket && this.socket.connected) return;

    console.log(`🔌 [WS] Connecting to ${URL}...`);

    this.socket = io(URL, {
      path: '/socket.io/', // Explicitly set path
      transports: ['websocket', 'polling'], // WebSocket first, polling fallback
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      withCredentials: true, // Required for CORS handshake
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ [WS Connected] ID:', this.socket.id);
      this.setupDebugListeners();
    });

    this.socket.on('connect_error', (err) => {
      // If this logs "xhr poll error" with 404 in network tab, Backend is the issue.
      console.error('❌ [WS Connection Error]:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ [WS Disconnected]:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Debug: Log ANY event received
  setupDebugListeners() {
    if (!this.socket) return;
    this.socket.onAny((event, ...args) => {
      console.log(`📥 [WS Event Recv]: ${event}`, args);
    });
  }

  // --- Safe Emitters (Check connection first) ---
  
  joinUser(userId) {
    if (this.socket?.connected) {
        console.log(`📤 [WS] Joining User Room: ${userId}`);
        this.socket.emit('join_user', userId);
    }
  }

  joinConversation(id) {
    if (this.socket?.connected) {
        console.log(`📤 [WS] Joining Chat: ${id}`);
        this.socket.emit('join_conversation', id);
    }
  }

  leaveConversation(id) {
    if (this.socket?.connected) this.socket.emit('leave_conversation', id);
  }

  emitTyping(cid, uid, name) {
    if (this.socket?.connected) this.socket.emit('typing', { conversationId: cid, userId: uid, userName: name });
  }

  emitStopTyping(cid, uid) {
    if (this.socket?.connected) this.socket.emit('stop_typing', { conversationId: cid, userId: uid });
  }

  // --- Generic Listeners ---
  on(event, callback) {
    if (this.socket) this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.socket) this.socket.off(event, callback);
  }
}

const socketService = new SocketService();
export default socketService;
