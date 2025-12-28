# Socket.IO Setup Guide

## Overview
This backend uses Socket.IO for real-time communication (messaging, notifications, typing indicators, etc.).

## Local Development Setup

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update `.env` with your values:
```
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/neriva
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

### 2. Start the Server
```bash
npm start       # Production mode
npm run dev     # Development with auto-reload
```

You should see:
```
🚀 Server running on port 3000
🔌 WebSocket server ready
📝 Environment: development
```

## Production Deployment (Render, Heroku, etc.)

### 1. Environment Variables on Render
Set these in your deployment dashboard:

| Variable | Value | Example |
|----------|-------|---------|
| `PORT` | Port number | `3000` |
| `NODE_ENV` | `production` | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Random secret string | (use strong random value) |
| `SESSION_SECRET` | Random secret string | (use strong random value) |
| `FRONTEND_URL` | Your frontend URL(s) | `https://yourfrontend.com` |
| `BACKEND_URL` | Your backend URL | `https://yourbackend.onrender.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | (from Google Cloud Console) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | (from Google Cloud Console) |

### 2. Multiple Frontend URLs
If you need to support multiple frontend URLs (e.g., www and non-www versions):
```
FRONTEND_URL=https://your-frontend.com,https://www.your-frontend.com,https://staging.your-frontend.com
```

### 3. Common Issues & Solutions

#### Issue: "404 GET /socket.io/?EIO=4&transport=polling"
**Cause:** CORS is blocking the Socket.IO connection
**Solution:** 
- Ensure `FRONTEND_URL` is set correctly in environment variables
- Check that `NODE_ENV=production` is set
- Verify the frontend URL matches exactly (including `https://`)

#### Issue: "xhr poll error"
**Cause:** Socket.IO polling transport failing
**Solution:**
- Check network connectivity between frontend and backend
- Verify both websocket and polling transports are enabled
- Ensure backend is actually running

#### Issue: WebSocket connection but messages don't sync
**Cause:** Socket.IO rooms not joined properly
**Solution:**
- On frontend, ensure you emit 'join_user' after connecting
- Check browser console for Socket.IO debug messages

## Frontend Integration

### Connect to Socket.IO (React Example)
```javascript
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('join_user', userId);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

### Frontend .env Configuration
```
VITE_API_URL=http://localhost:3000              # Local dev
VITE_API_URL=https://yourbackend.onrender.com   # Production
```

## Socket.IO Events

### Available Events

#### User Events
- `join_user` - Join personal notification room
- `disconnect` - User disconnects

#### Messaging Events
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `typing` - Send typing indicator
- `stop_typing` - Stop typing indicator

#### Server Emits (Listen to these)
- `user_typing` - Someone is typing
- `user_stop_typing` - Someone stopped typing
- `new_message` - New message received
- `notification` - New notification

## Testing Socket.IO Connection

### Using Browser DevTools
1. Open Network tab in DevTools
2. Filter for "socket.io"
3. Look for successful WebSocket upgrade or polling connections

### Using curl (basic test)
```bash
# Check health endpoint
curl https://yourbackend.onrender.com/api/health

# Should return:
# {"status":"Server is running","database":"Connected","websocket":"Connected"}
```

## Debug Tips

### Enable Debug Logging
Set environment variable:
```
DEBUG=socket.io:*
```

### Check Server Logs
On Render dashboard, view recent logs for connection errors.

### Common Error Messages
- **"CORS policy"** - Frontend URL not in allowed origins
- **"ERR_INVALID_PROTOCOL"** - Using `http` when `https` required
- **"timeout"** - Backend not responding or firewall blocking

## Performance Optimization

### For Production
- Use `transports: ['websocket']` only (remove polling) after confirming WebSocket works
- Set appropriate `pingInterval` and `pingTimeout`
- Monitor connection count with `io.engine.clientsCount`

## Troubleshooting Checklist

- [ ] `FRONTEND_URL` environment variable is set correctly
- [ ] Frontend and backend URLs use same protocol (http/https)
- [ ] No firewall blocking WebSocket (port 443 for https)
- [ ] Backend is actually running (check Render logs)
- [ ] Database connection is working (check `/api/health`)
- [ ] Socket.IO is being imported correctly: `const { Server } = require('socket.io')`
- [ ] Server is listening on correct port

## References
- [Socket.IO Documentation](https://socket.io/docs/)
- [Socket.IO CORS Configuration](https://socket.io/docs/v4/handling-cors/)
- [Render Deployment Guide](https://render.com/docs)
