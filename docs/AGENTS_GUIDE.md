# Agents & Spec-Driven Development Guide
## JS/React Interviewer Evaluator

---

## What are sub-agents in Claude Code?

Sub-agents are specialized Claude instances that run in their **own context window**, separate from your main session. Each has:
- A specific role and system prompt
- Access only to the tools it needs
- A fresh context (no pollution from your main conversation)

This solves the biggest problem with AI coding agents: **context fills up and Claude starts making mistakes**. With sub-agents, the orchestrator (you or the main agent) stays lightweight and delegates heavy work to specialists.

---

## Available Sub-agents

| Agent | When to use | How to invoke |
|-------|-------------|---------------|
| `@architect` | Design a new module, review architectural decisions, plan API contracts | `@architect design the session lifecycle` |
| `@spec-writer` | Write a spec before implementing anything | `/spec evaluation session pause` |
| `@backend` | Implement NestJS modules, LangGraph nodes, auth, WebSocket | `@backend implement the sessions module` |
| `@frontend` | Create Next.js pages, shadcn components, Zustand stores | `@frontend create the evaluation chat page` |
| `@database` | Add Prisma models, indexes, migrations, seeds | `@database add pausedAt field to Session` |

---

## Slash Commands

| Command | Description |
|---------|-------------|
| `/spec <feature>` | Start spec-driven development — writes the spec first |
| `/implement <spec-file>` | Implement a feature from its spec using sub-agents |
| `/new-module <name>` | Scaffold a NestJS module with Repository Pattern files |

---

## Spec-Driven Development (SDD) Workflow

This is the correct flow. **Never skip the spec step.**

```
1. /spec <feature description>
   └─ @spec-writer reads the codebase and writes docs/specs/<domain>/YYYY-MM-DD-feature.spec.md

2. You review the spec
   └─ Does it make sense? Any missing edge cases? Is the schema correct?
   └─ Approve by changing: Status: Draft → Status: Approved

3. /implement docs/specs/<domain>/YYYY-MM-DD-feature.spec.md
   └─ Orchestrator reads the spec
   └─ Delegates in parallel using the Task tool:
       ├─ @database → schema migration (runs first if needed)
       ├─ @backend  → NestJS module + LangGraph nodes + repository methods
       └─ @frontend → pages + shadcn components + Zustand stores

4. Review diffs and merge
```

### Step-by-step example

```bash
# 1. Start with a feature request
/spec session pause and resume with LangGraph checkpoint

# Claude Code writes docs/specs/backend/2025-XX-XX-session-pause.spec.md
# Open it in your editor and review it

# 2. Approve the spec (edit the file or tell Claude)
# Status: Approved

# 3. Implement
/implement docs/specs/backend/2025-XX-XX-session-pause.spec.md

# Claude orchestrates:
# → @database  adds pausedAt/resumedAt fields to Session model
# → @backend   implements PATCH /sessions/:id/pause + resume, emits WebSocket event
# → @frontend  updates chat page to show paused state + resume button
```

---

## Repository Pattern Quick Reference

Every NestJS module has 4 layers — this is mandatory:

```
Controller  →  receives HTTP request, validates DTO, calls Service
Service     →  enforces business rules, calls Repository
Repository  →  executes ALL Prisma queries for this module
Prisma      →  database
```

**Never call Prisma from a Controller or directly from a Service.**

---

## LangGraph Node Quick Reference

The AI evaluation agent is a LangGraph state machine. Each node is a pure function
that reads from `AgentState` and returns a partial state mutation.

```
graph: question_generator → answer_evaluator → section_router
                                                   ↓ (all sections done)
                              feedback_aggregator → report_emitter
```

Each node lives in `apps/backend/src/agent/nodes/` and has its own spec and test.

---

## State Management Quick Reference

| State type | Where it lives | Examples |
|------------|----------------|---------|
| Auth state | Zustand (`stores/auth.store.ts`) | user, accessToken |
| UI state | Zustand (`stores/ui.store.ts`) | sidebar open, active section |
| Server data | TanStack Query hooks | session status, questions, scores |
| Form state | react-hook-form | evaluation config form |
| Component state | useState | modal open/closed |

---

## Effective Agent Prompts

### Designing something new
```
@architect I need to design the scoring system. Currently fixed at 0/50/100 per
answer. I want EvaluationConfig to support custom score weights per section.
How do we store this without breaking existing sessions?
```

### Implementing a backend module
```
@backend implement the SessionsModule following the spec at
docs/specs/backend/2025-01-15-session-pause.spec.md.
Start with the repository layer, then service, then controller.
Make sure PATCH /sessions/:id/pause emits a 'session:paused' WebSocket event.
```

### Implementing a LangGraph node
```
@backend implement the answer_evaluator node following the spec at
docs/specs/agent/2025-01-20-answer-evaluator.spec.md.
Use temperature 0.3. Return structured JSON via Zod schema.
Log the raw LLM response to LangSmith on parse error.
```

### Frontend chat page
```
@frontend create the evaluation chat page at app/sessions/[sessionId]/page.tsx.
It should stream questions via WebSocket 'session:question' events.
Store sessionId in useSessionStore.
Disable ChatInput while waiting for the next question (disabled prop).
```

### Debugging
```
@backend PATCH /sessions/:id/pause is returning 403 for coordinators.
Check SessionsService.pause() — coordinators should be able to pause any session.
Find why the ownership check is not accounting for the coordinator role.
```

---

## Project Folder Structure

```
js-react-evaluator/
├── CLAUDE.md
├── apps/
│   ├── backend/                    ← NestJS backend
│   │   ├── src/
│   │   │   ├── agent/
│   │   │   │   ├── nodes/          ← LangGraph nodes
│   │   │   │   │   ├── question-generator.node.ts
│   │   │   │   │   ├── answer-evaluator.node.ts
│   │   │   │   │   ├── section-router.node.ts
│   │   │   │   │   ├── feedback-aggregator.node.ts
│   │   │   │   │   └── report-emitter.node.ts
│   │   │   │   ├── prompts/        ← Prompt templates per node
│   │   │   │   └── graph.ts        ← LangGraph state machine definition
│   │   │   ├── auth/               ← Okta SSO, JWT, guards
│   │   │   ├── sessions/           ← Session CRUD + WebSocket gateway
│   │   │   ├── evaluation-config/  ← Coordinator config management
│   │   │   ├── reports/            ← Report generation + Resend email
│   │   │   └── prisma/             ← PrismaModule + PrismaService
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── seed.ts
│   └── frontend/                   ← Next.js 14 frontend
│       ├── app/
│       │   ├── (auth)/             ← Login page, Okta callback
│       │   ├── dashboard/          ← Coordinator dashboard
│       │   └── sessions/
│       │       └── [sessionId]/    ← Evaluation chat page
│       ├── components/
│       │   └── ui/                 ← shadcn/ui components
│       ├── stores/                 ← Zustand stores
│       │   ├── auth.store.ts
│       │   ├── session.store.ts
│       │   └── ui.store.ts
│       ├── hooks/                  ← TanStack Query hooks
│       │   ├── use-session.ts
│       │   └── use-reports.ts
│       └── lib/
│           ├── api.ts              ← centralized API client
│           └── socket.ts           ← Socket.io singleton
├── packages/
│   ├── shared-types/               ← Shared TS interfaces (AgentState, DTOs)
│   └── email/                      ← React Email templates (Resend)
├── .claude/
│   ├── agents/                     ← sub-agent definitions
│   └── commands/                   ← slash commands
└── docs/
    ├── AGENTS_GUIDE.md             ← this file
    ├── adr/                        ← Architecture Decision Records
    └── specs/                      ← generated specs (spec-first!)
        ├── frontend/               ← one .spec.md per component or hook
        ├── backend/                ← one .spec.md per endpoint or service method
        └── agent/                  ← one .spec.md per LangGraph node
```

---

## Tips for Effective Claude Code Sessions

1. **Plan mode first** — run `claude --plan` before implementing something large
2. **Fresh context** — if a session is long, open a new one and reference files with `@`
3. **One agent per task** — don't ask `@backend` to also do the frontend
4. **Specs are documentation** — `docs/specs/` with `Status: Done` is your decision history
5. **Background agents** — press `Ctrl+B` to send a long-running agent to background while you continue working
6. **Check LangSmith** — every LangGraph node transition and LLM call is traced; use it to debug agent behavior
