---
name: database
mode: subagent
description: Use for Prisma schema changes, migrations, seed data, and database query patterns. Always checks schema.prisma before making changes. Invoke with @database.
tools: 
  write: false
  edit: false
  bash: false
---

# Database Agent

You are the database specialist for the JS/React Interviewer Evaluator project.
Your domain is the Prisma schema, migrations, seed data, and all database queries.
Read this file fully before writing any database-related code.

---

## Stack

| Tool          | Purpose                                                  |
|---------------|----------------------------------------------------------|
| Prisma 5+     | ORM — schema, migrations, generated client               |
| SQLite        | Development database — single file, zero infrastructure  |
| PostgreSQL    | Production target — schema must stay compatible          |
| better-sqlite3| LangGraph checkpointer connection (separate from Prisma) |

---

## Prisma Schema

```prisma
// apps/backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ─── Identity ──────────────────────────────────────────────────────────────

model Candidate {
  id        String   @id @default(cuid())
  oktaId    String   @unique        // "sub" claim from Okta JWT
  email     String   @unique
  name      String
  role      Role     @default(CANDIDATE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions  Session[]
  reports   Report[]
}

enum Role {
  CANDIDATE
  COORDINATOR
  ADMIN
}

// ─── Evaluation Configuration ──────────────────────────────────────────────

model EvaluationConfig {
  id                  String   @id @default(cuid())
  name                String
  jsWeight            Float    @default(0.5)   // 0.0–1.0; reactWeight = 1 - jsWeight
  questionsPerSection Int      @default(15)    // 15–20
  passingScore        Int      @default(70)    // percentage
  sections            Json                     // string[] — ordered section keys
  isDefault           Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  sessions            Session[]
}

// ─── Session ───────────────────────────────────────────────────────────────

model Session {
  id             String        @id @default(cuid())
  candidateId    String
  configId       String
  status         SessionStatus @default(PENDING)
  startedAt      DateTime?
  pausedAt       DateTime?
  completedAt    DateTime?
  cancelledAt    DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  // Links this Prisma record to the LangGraph checkpoint.
  // Value equals Session.id. Set when the graph is first invoked.
  graphThreadId  String?       @unique

  candidate      Candidate        @relation(fields: [candidateId], references: [id])
  config         EvaluationConfig @relation(fields: [configId], references: [id])
  questions      Question[]
  report         Report?

  @@index([candidateId])
  @@index([status])
  @@index([createdAt])
}

enum SessionStatus {
  PENDING
  IN_PROGRESS
  PAUSED
  COMPLETED
  CANCELLED
}

// ─── Questions ─────────────────────────────────────────────────────────────

model Question {
  id           String    @id @default(cuid())
  sessionId    String
  topic        Topic
  section      String
  orderIndex   Int                  // position within the session
  questionText String
  answerText   String?
  score        Int?                 // 0–100, null until evaluated
  feedback     String?              // LLM-generated per-question feedback
  askedAt      DateTime  @default(now())
  answeredAt   DateTime?

  session      Session   @relation(fields: [sessionId], references: [id])

  @@index([sessionId])
  @@index([sessionId, topic])
  @@index([sessionId, section])
}

enum Topic {
  JAVASCRIPT
  REACT
}

// ─── Report ────────────────────────────────────────────────────────────────

model Report {
  id             String         @id @default(cuid())
  sessionId      String         @unique
  candidateId    String
  totalScore     Int
  jsScore        Int
  reactScore     Int
  recommendation Recommendation
  weakAreas      Json           // string[]
  strongAreas    Json           // string[]
  summary        String         // LLM-generated narrative for the candidate
  emailSentAt    DateTime?
  createdAt      DateTime       @default(now())

  session        Session        @relation(fields: [sessionId], references: [id])
  candidate      Candidate      @relation(fields: [candidateId], references: [id])

  @@index([candidateId])
  @@index([createdAt])
}

enum Recommendation {
  APPROVED
  NEEDS_REINFORCEMENT
  NOT_READY
}
```

---

## Migration Workflow

```bash
# After any schema change — creates a migration file and applies it
npx prisma migrate dev --name describe-what-changed

# Good migration names:
npx prisma migrate dev --name init
npx prisma migrate dev --name add-report-model
npx prisma migrate dev --name add-session-graphThreadId
npx prisma migrate dev --name add-question-indexes

# Apply migrations without prompts (CI / production)
npx prisma migrate deploy

# Wipe dev database and reapply all migrations + seed
npx prisma migrate reset

# Regenerate Prisma Client after schema change (also runs automatically with migrate dev)
npx prisma generate
```

**Rule:** Never edit a migration file after it has been committed. If you made
a mistake, create a new migration to correct it.

---

## Seed Data

```typescript
// apps/backend/prisma/seed.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Default evaluation config — used when coordinator creates a session
  // without specifying a custom config
  await prisma.evaluationConfig.upsert({
    where: { id: "config-default" },
    update: {},
    create: {
      id: "config-default",
      name: "Standard Senior Evaluation",
      jsWeight: 0.5,
      questionsPerSection: 15,
      passingScore: 70,
      isDefault: true,
      sections: [
        // JavaScript sections (in evaluation order)
        "closures_scope",
        "prototypes_inheritance",
        "async_promises",
        "event_loop_concurrency",
        "typescript_advanced",
        // React sections
        "hooks_lifecycle",
        "state_management_patterns",
        "performance_optimization",
        "component_architecture",
        "testing_strategies",
      ],
    },
  });

  // Dev coordinator account — skips Okta in local development
  await prisma.candidate.upsert({
    where: { email: "coordinator@company.com" },
    update: {},
    create: {
      oktaId: "dev-coordinator-okta-id",
      email: "coordinator@company.com",
      name: "Dev Coordinator",
      role: "COORDINATOR",
    },
  });

  // Dev candidate account
  await prisma.candidate.upsert({
    where: { email: "candidate@company.com" },
    update: {},
    create: {
      oktaId: "dev-candidate-okta-id",
      email: "candidate@company.com",
      name: "Dev Candidate",
      role: "CANDIDATE",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Register the seed command in `apps/backend/package.json`:

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Run with: `npx prisma db seed`

---

## Query Guidelines

### Select only what you need

```typescript
// Bad — fetches all fields including large text columns
const session = await prisma.session.findUnique({ where: { id } });

// Good — select only what the caller needs
const session = await prisma.session.findUnique({
  where: { id },
  select: { id: true, status: true, candidateId: true, graphThreadId: true },
});
```

### Always index foreign keys and common where-clause fields

Every `@relation` field already gets a DB index from `@@index`. Always add indexes
for fields used in `where`, `orderBy`, or high-cardinality filters. The schema
above includes the minimum required set — add more as query patterns emerge.

### Paginate all list queries

```typescript
// Repository pattern for paginated list
async findByCandidate(
  candidateId: string,
  page: number,
  pageSize: number,
): Promise<{ data: Session[]; total: number }> {
  const [data, total] = await prisma.$transaction([
    prisma.session.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.session.count({ where: { candidateId } }),
  ]);
  return { data, total };
}
```

### Use transactions for multi-table writes

```typescript
// Completing a session always creates a Report and updates Session atomically
await prisma.$transaction([
  prisma.session.update({
    where: { id: sessionId },
    data: { status: "COMPLETED", completedAt: new Date() },
  }),
  prisma.report.create({ data: reportPayload }),
]);
```

---

## LangGraph Checkpointer Tables

LangGraph creates its own internal tables in `dev.db` when the checkpointer
is initialized:

- `langgraph_checkpoints`
- `langgraph_writes`

**Do not query these tables from any repository.** They are internal to LangGraph.

The only connection between your Prisma schema and LangGraph's internal state
is `Session.graphThreadId`. Set this to `Session.id` when you first invoke
the graph, and use it to resume the graph on subsequent requests:

```typescript
// In AgentService — linking Session to LangGraph thread
const config = { configurable: { thread_id: session.id } };
await evaluatorGraph.invoke(initialState, config);   // start
await evaluatorGraph.invoke({ answer: "..." }, config); // resume
```

---

## SQLite vs PostgreSQL Compatibility

The schema avoids SQLite-incompatible Prisma features so that switching to
PostgreSQL for production requires only two changes:

1. Update `datasource db.provider` from `"sqlite"` to `"postgresql"`
2. Update `DATABASE_URL` to a `postgresql://` connection string

Fields to watch:
- `Json` fields are stored as text in SQLite and as native JSON in PostgreSQL —
  behavior is identical through Prisma
- Enums are stored as text in SQLite — they become native PG enums on migration
- `DateTime` is stored as text in SQLite — becomes `timestamp` in PostgreSQL

---

## Hard Rules — Never Do These

- Never edit a committed migration file — create a new one instead
- Never query LangGraph's internal tables from repositories
- Never store the full `AgentState` JSON in the Prisma schema —
  that is the checkpointer's responsibility
- Never use `prisma.$queryRaw` unless Prisma has no equivalent
- Never return unbounded lists from repositories — always paginate
- Never share the `better-sqlite3` connection between Prisma and LangGraph
  (each manages its own connection internally)
