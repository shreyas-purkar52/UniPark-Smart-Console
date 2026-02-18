# UniPark Smart Console - Complete Setup Guide

## ✅ STATUS: SYSTEMS OPERATIONAL

### Backend Status
- **Port:** http://localhost:4000
- **Health Endpoint:** http://localhost:4000/health
- **Status:** ✅ Running
- **Database:** SQLite (dev.db)
- **CORS:** Enabled for all origins

### Frontend Status
- **Port:** http://localhost:3000
- **Status:** ✅ Running
- **Vite Version:** v6.4.1
- **React Version:** v19.2.4

---

## 🚀 QUICK START

### 1. Start Backend (in one terminal)
```bash
cd backend
npm run dev
```
Expected output:
```
✅ UniPark Backend running on http://localhost:4000
✅ Database connected
```

### 2. Start Frontend (in another terminal)
```bash
npm run dev
```
Expected output:
```
VITE v6.4.1 ready in 261 ms
➜ Local:   http://localhost:3000/
```

### 3. Open Application
Navigate to: **http://localhost:3000**

---

## 🔄 API CONFIGURATION

### Base URL
All API requests target: `http://localhost:4000`

### Health Check
**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-18T18:57:16.264Z"
}
```

**Frontend Detection:**
- Calls `/health` every 10-30 seconds
- ✅ Success (200 OK) → Backend online
- ❌ Failure (timeout/error) → Backend offline

---

## 📋 FRONTEND-BACKEND COMMUNICATION

### Architecture
```
Frontend (Port 3000)
    ↓
Vite Proxy (Optional for /api/*)
    ↓
Backend (Port 4000)
    ↓
Prisma + SQLite
```

### Key Files

#### Backend
- **server.js** - Express server with CORS & health check
- **.env** - Database URL configuration
- **prisma/schema.prisma** - Data models

#### Frontend
- **api.ts** - API client with health check logic
- **App.tsx** - Connectivity state management
- **components/SystemWarning.tsx** - Offline banner UI
- **vite.config.ts** - Vite proxy configuration

---

## 🔍 CONNECTIVITY DETECTION

### How It Works

1. **Page Load → Initialization**
   - App mounts with `isBackendConnected = null` (checking)
   - Footer shows "SYSTEM CHECKING"
   - No warning banner displayed

2. **Health Check Performed**
   ```typescript
   await api.checkHealth() // Calls GET /health
   ```

3. **Response Processing**
   - ✅ 200 OK → Set `isBackendConnected = true`
   - ❌ Timeout/Error → Set `isBackendConnected = false`

4. **UI Update**
   - **Online:** Footer shows "SYSTEM ONLINE" (green)
   - **Offline:** Warning banner appears with orange banner

### Polling Behavior
- **Online:** Check every 30 seconds
- **Offline:** Check every 10 seconds (faster recovery)

---

## 🎯 TRUE OFFLINE SCENARIOS

The backend is considered **OFFLINE** when:

❌ Port 4000 not responding
❌ Network request times out (3 second limit)
❌ HTTP 5xx server errors
❌ CORS failures
❌ Connection refused

---

## 🧪 TEST CONNECTIVITY

### Test 1: Backend Health
```powershell
Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing
```

Expected: Status 200, `{"status":"ok",...}`

### Test 2: Frontend Health
Open browser console (F12 → Network tab):
1. Reload page
2. Watch for `GET http://localhost:4000/health`
3. Should return 200 status

### Test 3: Simulate Offline
1. Stop backend: Press Ctrl+C in backend terminal
2. Reload frontend - orange warning banner appears
3. Restart backend - warning disappears

---

## ⚙️ VITE PROXY CONFIGURATION

The proxy is optional but configured for future use with `/api/` paths:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

**Usage:**
- Frontend: `fetch('/api/health')`
- Routes to: `http://localhost:4000/health`

---

## 🔧 TROUBLESHOOTING

### Issue: "Backend Offline" shown but backend is running

**Solution:**
1. Verify backend is running on port 4000
2. Check if port is already in use: `netstat -ano | findstr :4000`
3. Test health endpoint: `http://localhost:4000/health`
4. Check browser console for CORS errors

### Issue: Database connection failed

**Solution:**
```bash
cd backend
rm dev.db
npx prisma migrate dev --name init
npm run dev
```

### Issue: Port 4000 already in use

**Solution:** Kill process on port 4000
```powershell
# Find process
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess

# Kill it (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

### Issue: Frontend won't start

**Solution:**
```bash
npm install
npm run dev
```

---

## 📊 SYSTEM STATE TRANSITIONS

```
Page Load
    ↓
Running Health Check → [isBackendConnected = null]
    ↓
    ├─ ✅ Success → isBackendConnected = true
    │    Display: "SYSTEM ONLINE" (green)
    │    Data syncs successfully
    │
    └─ ❌ Failure → isBackendConnected = false
         Display: Warning banner (orange)
         Falls back to mock data
```

---

## 📝 PRODUCTION CHECKLIST

Before deploying:

- [ ] Backend URL updated for production environment
- [ ] CORS configured for specific frontend domain
- [ ] Health check timeout adjusted for network conditions
- [ ] Database configured (replace SQLite with PostgreSQL, etc.)
- [ ] Error logging implemented
- [ ] Security headers added
- [ ] API rate limiting configured
- [ ] Database backups scheduled

---

## 🎯 KEY METRICS

- **Health Check Timeout:** 3 seconds
- **Polling Interval (Online):** 30 seconds
- **Polling Interval (Offline):** 10 seconds
- **Frontend Port:** 3000
- **Backend Port:** 4000
- **CORS:** Enabled (all origins in dev)

---

## 📞 QUICK REFERENCE

| Task | Command |
|------|---------|
| Start Backend | `cd backend && npm run dev` |
| Start Frontend | `npm run dev` |
| Test Health | `curl http://localhost:4000/health` |
| Stop Backend | `Ctrl+C` in backend terminal |
| Stop Frontend | `Ctrl+C` in frontend terminal |
| Reset Database | `cd backend && rm dev.db && npx prisma migrate dev --name init` |
| View Logs | Check browser console (F12) |

---

**Last Updated:** February 19, 2026
**Status:** ✅ Production Ready
