# interviewer_bot — AGENTS.md

## Project
AI evaluator for JS/React technical interviews. Two independent apps:
- `src/interviewer-evaluator/` — Next.js 16 frontend
- `src/interviewer-evaluator-api/` — NestJS backend + LangGraph + Prisma

## Verified Commands

| Task | Command |
|------|--------|
| Run frontend | `cd src/interviewer-evaluator && npm run dev` |
| Run backend | `cd src/interviewer-evaluator-api && npm run start:dev` |
| Typecheck frontend | `cd src/interviewer-evaluator && npm run typecheck` |
| Typecheck backend | `cd src/interviewer-evaluator-api && npx tsc --noEmit` |
| Lint frontend | `cd src/interviewer-evaluator && npm run lint` |
| Lint backend | `cd src/interviewer-evaluator-api && npm run lint` |
| DB migrate | `cd src/interviewer-evaluator-api && npx prisma migrate dev --name <name>` |
| DB seed | `cd src/interviewer-evaluator-api && npx prisma db seed` |
| DB studio | `cd src/interviewer-evaluator-api && npx prisma studio` |

## Setup
1. Install: `npm install` in each app directory
2. Env files required:
   - `src/interviewer-evaluator-api/.env` (copy from `.env.example`)
   - `src/interviewer-evaluator/.env.local` (copy from `.env`)

## Critical Rules (from CLAUDE.md)
- Never run builds/tests yourself
- Never print full terminal output
- When build needed: "Please build and paste ONLY error section (max 50 lines)"
- When test needed: "Please run test and paste ONLY error section (max 50 lines)"
- Never run git commands — user handles all version control
- Never drop database or empty a table — always ask first

## Tech Stack (actual, not CLAUDE.md defaults)
- Frontend: Next.js 16.2.3, React 19, Zustand, Tailwind 4
- Backend: NestJS 11, LangGraph, Prisma, SQLite
- LLM: Google Gemini only for development Open AI for production
- Auth: Okta SSO
- Observability: LangSmith (env vars)

## Key Concepts
- Session: evaluation instance tied to one candidate
- Status lifecycle: PENDING → IN_PROGRESS ⇆ PAUSED → COMPLETED | CANCELLED
- AgentState: LangGraph state persisted to SQLite
- Graph thread ID = Session.id

## Sub-agents
| Agent | File |
|-------|------|
| @architect | `.claude/agents/architect.md` |
| @frontend | `.claude/agents/frontend.md` |
| @backend | `.claude/agents/backend.md` |
| @database | `.claude/agents/database.md` |
| @spec-writer | `.claude/agents/spec-writer.md` |