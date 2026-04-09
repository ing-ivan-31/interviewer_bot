---
description: Seed the database with test evaluation data (EvaluationConfig, sample sessions, candidate users). Useful for resetting a dev environment. Usage: /seed [--reset]
allowed-tools: Read, Bash
---

# Seed Development Data: $ARGUMENTS

Populate the SQLite database with test data for local development.

## Parse arguments
Arguments: `$ARGUMENTS`
- `--reset` → drop all existing data before seeding (candidates, sessions, configs)
- (no args) → seed without dropping existing rows

## Check backend is running (optional — seed can run standalone)
```bash
curl -s http://localhost:3001/health \
  || echo "Backend not running — seed will still work via Prisma directly"
```

## Run the seed script
```bash
cd apps/backend
npx prisma db seed
```

The seed file lives at `apps/backend/prisma/seed.ts`.

## If --reset was requested
```bash
cd apps/backend
npx prisma migrate reset --force
npx prisma db seed
```

> WARNING: `migrate reset` drops all data. Only use in development.

## Inspect seeded data
```bash
cd apps/backend
npx prisma studio
```

This opens a browser UI at http://localhost:5555 where you can browse
EvaluationConfig, Session, and User records.

## Useful Prisma one-liners for debugging

```bash
# Count sessions by status
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.session.groupBy({ by: ['status'], _count: true })
  .then(r => { console.table(r); process.exit(); });
"

# Show latest 10 sessions
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.session.findMany({ orderBy: { createdAt: 'desc' }, take: 10,
  select: { id: true, status: true, candidateId: true, createdAt: true }
}).then(r => { console.table(r); process.exit(); });
"
```
