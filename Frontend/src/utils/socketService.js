import { API_BASE_URL } from '../config';
import { io } from 'socket.io-client';

const URL = API_BASE_URL;

class SocketService {
  socket = null;

  // 🧠 Queue to hold requests made BEFORE connection is ready
  pendingListeners = [];
  pendingEmits = [];

  connect() {
    if (this.socket) return; // Already connected or connecting

    this.socket = io(URL, {
      path: '/socket.io/',
      transports: ['polling', 'websocket'], // Polling first for stability
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      withCredentials: false,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.flushQueues(); // 🚀 Execute all queued requests now!
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ [WS Connection Error]:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      // Reconnect logic or silent fail
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // --- 🚀 The Fix: Process Queued Items ---
  flushQueues() {
    // 1. Re-attach listeners that failed earlier
    if (this.pendingListeners.length > 0) {
      this.pendingListeners.forEach(({ event, callback }) => {
        this.socket.on(event, callback);
      });
      this.pendingListeners = [];
    }

    // 2. Re-send emits (like join_conversation) that failed earlier
    if (this.pendingEmits.length > 0) {
      this.pendingEmits.forEach(({ event, data }) => {
        this.socket.emit(event, data);
      });
      this.pendingEmits = [];
    }
  }

  // --- Safe Emitters (With Queueing) ---

  joinUser(userId) {
    if (this.socket?.connected) {
      this.socket.emit('join_user', userId);
    } else {
      this.pendingEmits.push({ event: 'join_user', data: userId });
    }
  }

  joinConversation(id) {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', id);
    } else {
      this.pendingEmits.push({ event: 'join_conversation', data: id });
    }
  }

  leaveConversation(id) {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', id);
    }
  }

  emitTyping(cid, uid, name) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { conversationId: cid, userId: uid, userName: name });
    }
  }

  emitStopTyping(cid, uid) {
    if (this.socket?.connected) {
      this.socket.emit('stop_typing', { conversationId: cid, userId: uid });
    }
  }

  // --- Generic Listeners (With Queueing) ---
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      this.pendingListeners.push({ event, callback });
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    } else {
      // If we are unsubscribing before we even connected, remove from queue
      this.pendingListeners = this.pendingListeners.filter(l => l.event !== event);
    }
  }
}

const socketService = new SocketService();
export default socketService;