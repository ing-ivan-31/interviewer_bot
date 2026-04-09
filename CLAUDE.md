# JS/React Interviewer Evaluator — Project Constitution

## Project Overview
An AI-powered chatbot that evaluates senior JavaScript and React knowledge for
prospective technical interviewers. Candidates authenticate via Okta SSO, complete
a multi-section chat evaluation, and receive structured feedback. Coordinators
manage evaluations through a dashboard and receive reports by email.

---

## Architecture at a Glance

```
interviewer_bot/
├── src/
│   ├── interviewer-evaluator/        Next.js 14 · TypeScript · shadcn/ui · Zustand
│   └── interviewer-evaluator-api/         NestJS · TypeScript · LangGraph · Prisma · SQLite
├── docs/
│   ├── specs/           Spec files — written before any code
└── .claude/
    └── agents/          Specialized sub-agents for each domain
```

---

## Tech Stack

| Layer             | Technology                                       |
|-------------------|--------------------------------------------------|
| Frontend          | Next.js 14 (App Router), TypeScript              |
| UI Components     | shadcn/ui, Tailwind CSS                          |
| Global State      | Zustand (UI state only)                          |
| Backend           | NestJS, TypeScript                               |
| Architecture      | Repository pattern, domain modules               |
| AI Orchestration  | LangGraph (state machine), LangChain Core (LCEL) |
| LLM               | OpenAI GPT-4o mini                               |
| ORM               | Prisma                                           |
| Database          | SQLite (dev) → PostgreSQL (prod-ready)           |
| Auth              | Okta SSO (OAuth 2.0 / OIDC)                      |
| Email             | Resend + React Email                             |
| Observability     | LangSmith (zero-code, enabled via env vars)      |

---

## Specialized Agents

Four sub-agents cover each domain. Reference them in chat to get domain-specific
patterns, standards, and code guidance.

| Agent       | File                         | Owns                                      |
|-------------|------------------------------|-------------------------------------------|
| `@architect`| `.claude/agents/architect.md`| system design, module planning, API contracts       |
| `@frontend` | `.claude/agents/frontend.md` | Next.js, React, Zustand, shadcn/ui        |
| `@backend`  | `.claude/agents/backend.md`  | NestJS, LangGraph, auth, WebSocket        |
| `@database` | `.claude/agents/database.md` | Prisma schema, migrations, seeds, queries |
| `@spec-writer`    | `.claude/agents/spec-writer.md`    | Spec writing, test writing, ADRs          |

---

## Environment Variables

Copy `.env.example` to `.env` in each app directory before running.

### apps/backend/.env

```
# OpenAI — required
# Get key at: platform.openai.com → API Keys
OPENAI_API_KEY=sk-...

# LangSmith — optional but strongly recommended for debugging the agent
# Get key at: smith.langchain.com → Settings → API Keys
# When enabled, every node transition and LLM call is traced visually.
LANGCHAIN_API_KEY=ls__...
LANGCHAIN_PROJECT=js-react-evaluator
LANGCHAIN_TRACING_V2=true

# Resend — required for email reports (free tier: 3,000 emails/month)
# Get key at: resend.com → API Keys
RESEND_API_KEY=re_...

# Okta — required for SSO authentication
# Create a free developer account at: developer.okta.com
# Register a "Web Application". Redirect URI: http://localhost:3001/auth/callback
OKTA_DOMAIN=dev-xxxxxxx.okta.com
OKTA_CLIENT_ID=0oa...
OKTA_CLIENT_SECRET=...
OKTA_CALLBACK_URL=http://localhost:3001/auth/callback

# Database — SQLite file path relative to apps/backend/
DATABASE_URL="file:./dev.db"

# App
JWT_SECRET=change-me-in-production-use-a-long-random-string
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### apps/frontend/.env.local

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_OKTA_DOMAIN=dev-xxxxxxx.okta.com
NEXT_PUBLIC_OKTA_CLIENT_ID=0oa...
```

---

## Local Setup — Step by Step

### 1. Prerequisites

- Node.js 20 LTS or higher
- npm 10 or higher
- Native build tools for `better-sqlite3` (required by LangGraph checkpointer):
  - macOS: `xcode-select --install`
  - Ubuntu/Debian: `sudo apt install build-essential python3`
  - Windows: `npm install --global windows-build-tools`

### 2. Install

```bash
git clone <repo-url> interviewer-evaluator
cd interviewer-evaluator
npm install
```

### 3. Configure environment

```bash
cp src/interviewer-evaluator-api/.env.example apps/interviewer-evaluator-api/.env
cp src/interviewer-evaluator/.env.example apps/interviewer-evaluator/.env.local
# Edit both files — fill in your API keys before running
```

### 4. Database

```bash
cd src/interviewer-evaluator-api
npx prisma migrate dev --name init
npx prisma db seed
# Optional: inspect data in a browser UI
npx prisma studio
```

### 5. Run

```bash
# From repo root — runs both apps concurrently
npm run dev

# Or individually
npm run dev:interviewer-evaluator-api    # http://localhost:3001
npm run dev:interviewer-evaluator   # http://localhost:3000
```

## Monorepo Scripts

| Command              | What it does                          |
|----------------------|---------------------------------------|
| `npm run dev`        | Both apps concurrently                |
| `npm run dev:interviewer-evaluator` | Next.js only                        |
| `npm run dev:interviewer-evaluator-api`  | NestJS only                         |
| `npm run test`       | All tests across workspaces           |
| `npm run typecheck`  | TypeScript checks across workspaces   |
| `npm run lint`       | ESLint across workspaces              |
| `npm run db:migrate` | `prisma migrate dev`                  |
| `npm run db:seed`    | `prisma db seed`                      |
| `npm run db:studio`  | `prisma studio`                       |

---

## Spec-Driven Workflow
1. `/spec <feature>` → generates `docs/specs/YYYY-MM-DD-feature.md`
2. Review and approve the spec (change Status:  → Approved)
3. `/implement <spec-file>` → delegates to sub-agents with Task tool
4. Sub-agents commit after each task — review diffs before merging

---

## Development Workflow

The order is always: **Spec → Tests → Implementation**. Never reversed.

1. **Spec first** — create `docs/specs/<domain>/<feature>.spec.md` using the
   template in `.claude/agents/spec-writer.md`. Use `@spec-writer` to generate it from
   a plain-English description of what you want to build.
2. **Tests second** — derive test cases from the spec's acceptance criteria.
3. **Implement** — use the relevant agent (`@frontend` or `@backend`) to implement.
4. **Verify** — `npm run typecheck && npm run test` must pass before committing.

---

## Key Domain Concepts

**Session** — one evaluation instance tied to one candidate.
Status lifecycle: `PENDING → IN_PROGRESS ⇆ PAUSED → COMPLETED` or `CANCELLED`.
Candidates can pause and resume; coordinators can cancel.

**EvaluationConfig** — coordinator-defined settings stored in the database:
topic weights (JS/React ratio), questions per section (15–20, configurable),
passing score threshold, and the ordered list of section keys.

**Section** — one topic block within a session (e.g. `closures_scope`,
`hooks_lifecycle`). A session progresses through all configured sections in order.

**AgentState** — the full serialized state of the LangGraph agent for a session.
Persisted to SQLite by the checkpointer after every node transition. The link
between Prisma and LangGraph is `Session.graphThreadId = Session.id`.

**Report** — generated at session completion by `feedback_aggregator` and
`report_emitter` nodes. Contains total score, per-topic scores, weak areas,
strong areas, an LLM-written summary, and a recommendation:
`APPROVED | NEEDS_REINFORCEMENT | NOT_READY`.

---

## Phased Build Plan

Build in this order. Each phase is independently verifiable before moving on.

| Phase | Scope                                                     | Done when                                    |
|-------|-----------------------------------------------------------|----------------------------------------------|
| 1     | LangGraph agent standalone — nodes, graph, prompts        | `graph.run.ts` generates a question          |
| 2     | NestJS backend — modules, repositories, auth, WebSocket   | Postman can start a session and get a question |
| 3     | Next.js frontend — chat UI, dashboard, Zustand store      | Full evaluation flow works in the browser    |
| 4     | Reports — feedback aggregator, React Email, Resend        | Emails arrive at session completion          |

---

## Coding Conventions

### Git Branches

```
main          production-ready, always deployable
develop       integration branch
feat/<name>   new features
fix/<name>    bug fixes
chore/<name>  tooling, config, dependency updates
```

### Commit Format (Conventional Commits)

```
feat(scope): short present-tense description
fix(scope): short present-tense description
chore(scope): short present-tense description

Examples:
feat(agent): add answer-evaluator node
fix(auth): handle okta token expiry correctly
chore(db): add indexes on session status and candidateId
```

### File Naming

| Type                  | Convention              | Example                           |
|-----------------------|-------------------------|-----------------------------------|
| React components      | PascalCase              | `ChatBubble.tsx`                  |
| React hooks           | camelCase, `use` prefix | `useEvaluationStream.ts`          |
| NestJS services       | kebab-case + suffix     | `sessions.service.ts`             |
| NestJS repositories   | kebab-case + suffix     | `sessions.repository.ts`          |
| NestJS controllers    | kebab-case + suffix     | `sessions.controller.ts`          |
| LangGraph nodes       | kebab-case + suffix     | `question-generator.node.ts`      |
| Prompt templates      | kebab-case + suffix     | `question-generator.prompt.ts`    |
| Spec files            | kebab-case + suffix     | `chat-input.spec.md`              |
| Unit/integration tests| match source file       | `chat-input.test.tsx`             |
| ADRs                  | NNN-kebab-case          | `001-sqlite-checkpointer.md`      |

### TypeScript Rules

- `strict: true` in all `tsconfig.json` files — no exceptions
- No `any` — use `unknown` and narrow it, or define a proper interface
- All function parameters and return types must be explicitly annotated
- Use Zod for runtime validation at every API boundary and LLM JSON response
- Prefer `interface` over `type` for object shapes; use `type` for unions/aliases

---

## Rules (never break):
- Never implement a non-trivial feature without a spec. "Non-trivial" = anything touching auth, payments, data schema, or cross-module logic.
- Never run builds/tests yourself
- Never print full terminal output
- When build needed: "Please build and paste ONLY error section (max 50 lines)"
- When run test needed: "Please run test and confirm and paste ONLY error section (max 50 lines)"
- Never run git commands (status, diff, commit, push, etc.)
- I handle all version control manually
- Respond with minimal diffs only unless I ask for explanation
- Focus on one small task at a time
- Never drop database or empty a table alway ask first
