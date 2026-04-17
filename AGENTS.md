# interviewer_bot — AGENTS.md

## Project
An AI-powered chatbot that evaluates senior JavaScript and React knowledge for
prospective technical interviewers. Candidates authenticate via Okta SSO, complete
a multi-section chat evaluation, and receive structured feedback. Coordinators
manage evaluations through a dashboard and receive reports by email. Two independent apps:
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

## Spec-Driven Workflow
1. `/spec <feature>` → generates `docs/specs/YYYY-MM-DD-feature.md`
2. Review and approve the spec (change Status:  → Approved)
3. `/implement <spec-file>` → delegates to sub-agents with Task tool
4. Sub-agents commit after each task — review diffs before merging


## Development Workflow

The order is always: **Spec → Tests → Implementation**. Never reversed.

1. **Spec first** — create `docs/specs/<domain>/<feature>.spec.md` using the
   template in `.opencode/agents/spec-writer.md`. Use `@spec-writer` to generate it from
   a plain-English description of what you want to build.
2. **Tests second** — derive test cases from the spec's acceptance criteria.
3. **Implement** — use the relevant agent (`@frontend` or `@backend`) to implement.
4. **Verify** — `npm run typecheck && npm run test` must pass before committing.

## Critical Rules
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

## Tech Stack
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