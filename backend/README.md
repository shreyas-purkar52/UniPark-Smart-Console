# UniPark Backend Setup

## Initial Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Create database (first time only):**
```bash
npx prisma migrate dev --name init
```

This will:
- Create SQLite database (`dev.db`)
- Run all migrations
- Generate Prisma Client

3. **Start development server:**
```bash
npm run dev
```

You should see:
```
✅ UniPark Backend running on http://localhost:4000
✅ Database connected
```

## Testing

### Health Check
```bash
curl http://localhost:4000/health
# Response: { "status": "ok", "timestamp": "..." }
```

### Seed Slots (optional)
```bash
curl -X POST http://localhost:4000/seed-slots
```

## Environment Variables

The `.env` file is automatically created with SQLite database.

For production, replace with:
```
DATABASE_URL="your_database_url"
```

## Troubleshooting

- **Port 4000 already in use:** Change port in `server.js`
- **Database locked:** Remove `dev.db` and run migrate again
- **Prisma errors:** Run `npx prisma generate` to regenerate client
