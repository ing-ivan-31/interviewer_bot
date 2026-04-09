---
description: Start spec-driven development for a new feature. Invokes @spec-writer to produce a spec in docs/specs/ before any code is written. Usage: /spec <feature description>
allowed-tools: Read, Write, Glob, Grep
---

# Spec-Driven Development: $ARGUMENTS

You are starting a new feature using the spec-first approach. No code is written until the spec is reviewed.

## Step 1 — Read project context
Before writing anything, read:
- `CLAUDE.md` — project conventions, business rules, stack
- `apps/backend/prisma/schema.prisma` — current data model
- Existing specs in `docs/specs/` — avoid duplicating or conflicting

## Step 2 — Interview (max 3 questions)
The feature requested: **$ARGUMENTS**

Ask the developer up to 3 targeted questions:
1. Who is the actor (candidate / coordinator) and what triggers this action?
2. What are all the expected outcomes (success + failure cases)?
3. Any edge cases or constraints already known?

If the answers are clear from the codebase — skip the questions and write the spec.

## Step 3 — Choose the right subdirectory
Determine whether this spec belongs in:
- `docs/specs/frontend/` — React component or custom hook
- `docs/specs/backend/` — NestJS endpoint or service method
- `docs/specs/agent/` — LangGraph node

## Step 4 — Write the spec
Save to: `docs/specs/{domain}/{YYYY-MM-DD}-{feature-slug}.spec.md`

Follow the spec template from `.claude/agents/spec-writer.md` exactly. Include:
- Purpose (one sentence)
- Inputs / Props / State fields used
- Outputs / Return value / Emitted events
- Invariants
- Edge cases table
- Acceptance criteria (testable, each maps to at least one test)

For backend endpoints also include:
- Full API contract with request/response JSON examples
- Repository methods needed (by name and signature)
- Auth requirements

For LangGraph nodes also include:
- Input state fields used
- Output state mutations
- LLM behavior (temperature, response schema)

## Step 5 — Implementation summary
After writing the spec, output:
- Path to the spec file created
- Which agents to invoke and in what order
- Estimated complexity: S (< 2h) / M (half day) / L (full day+)
- Any blockers or dependencies to resolve first

## Step 6 — Suggest next command
```
/implement docs/specs/{domain}/{filename}.spec.md
```

**Remember:** the spec is the contract. No agent writes code until the spec is approved.
