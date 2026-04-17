---
description: Seed the database with test evaluation data. Usage: /seed
agent: general
---

# Seed Development Data

Populate the SQLite database with test data for local development.

## Run the seed script
```bash
cd src/interviewer-evaluator-api
npx prisma db seed
```

The seed file lives at `src/interviewer-evaluator-api/prisma/seed.ts`.

## To reset and reseed (WARNING: drops all data)
```bash
cd src/interviewer-evaluator-api
npx prisma migrate reset --force
npx prisma db seed
```
> Only use in development.

## Inspect seeded data
```bash
cd src/interviewer-evaluator-api
npx prisma studio
```

This opens a browser UI at http://localhost:5555 where you can browse EvaluationConfig, Session, and User records.

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