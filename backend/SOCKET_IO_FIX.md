# Fix for Socket.IO 404 Error on Render

## Your Error
```
GET https://itecony-neriva-backend.onrender.com/socket.io/?EIO=4&transport=polling 404 (Not Found)
❌ [WS Connection Error]: xhr poll error
```

## Root Cause
The backend is not serving Socket.IO correctly. This happens when:
1. `FRONTEND_URL` environment variable is missing or incorrect on Render
2. CORS is blocking the connection from your frontend
3. Backend is not running Socket.IO

## Immediate Fix Steps

### Step 1: Check Render Environment Variables
1. Go to your Render dashboard
2. Navigate to your backend service
3. Go to **Environment** section
4. Verify these variables are set:
   - `FRONTEND_URL` = Your actual frontend URL (e.g., `https://neriva.vercel.app`)
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `DATABASE_URL` = Your PostgreSQL connection string
   - All other required variables from `.env.example`

### Step 2: Restart Your Backend
1. In Render dashboard, go to your backend service
2. Click **Redeployment** or manually trigger a redeploy
3. Wait for deployment to complete
4. Check the logs for:
   ```
   🚀 Server running on port 3000
   🔌 WebSocket server ready
   ```

### Step 3: Test the Connection
1. Open your frontend in a browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Filter for "socket.io"
5. Refresh the page
6. You should see successful WebSocket or polling connections

## Configuration Applied

Your `server.js` has been updated with:
- ✅ Dynamic CORS origin handling
- ✅ Support for multiple frontend URLs
- ✅ Proper environment variable fallbacks
- ✅ Better WebSocket configuration

## What to Update on Render

### Add/Update This Environment Variable:
```
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**Important:** 
- Use the exact URL where your frontend is hosted
- Include `https://` (production)
- No trailing slash
- If you have multiple URLs: `https://domain1.com,https://domain2.com`

## Verify Your Frontend URL

Find your actual frontend domain:
- **Vercel**: Go to your project dashboard, copy the domain from the top
- **Netlify**: Go to Site settings, find your site URL
- **Other**: Check your deployment platform's dashboard

## Test After Deployment

Run this in browser console to verify the backend is working:
```javascript
fetch('https://itecony-neriva-backend.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error('Backend error:', e))
```

Should output:
```
{
  "status": "Server is running",
  "database": "Connected",
  "websocket": "Connected",
  "timestamp": "2025-12-28T..."
}
```

## Still Having Issues?

### Check Render Logs
1. In Render dashboard, view recent logs
2. Look for errors like:
   - "CORS policy"
   - "Cannot find module"
   - "Database connection failed"

### Common Issues & Fixes

| Error | Solution |
|-------|----------|
| `socket.io 404` | Set `FRONTEND_URL` env var |
| `CORS policy error` | Frontend URL doesn't match env var |
| `Database connection failed` | Check `DATABASE_URL` env var |
| `Cannot find module 'socket.io'` | Run `npm install` before deploying |

## Need Help?

Check these files:
- [SOCKET_IO_SETUP.md](./SOCKET_IO_SETUP.md) - Detailed setup guide
- [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) - API endpoints
- [server.js](./server.js) - Main server file with Socket.IO config

## Quick Deployment Checklist

Before deploying to Render:

- [ ] All environment variables are set in Render dashboard
- [ ] `FRONTEND_URL` matches your actual frontend domain
- [ ] Backend code is committed and pushed
- [ ] `npm install` dependencies are in package.json
- [ ] No local .env file is being deployed
- [ ] Database migration/seeding is done

After deploying:
- [ ] Check Render logs for "Server running" message
- [ ] Test `/api/health` endpoint
- [ ] Test WebSocket connection from frontend
- [ ] Monitor for 404 errors on `/socket.io/`
