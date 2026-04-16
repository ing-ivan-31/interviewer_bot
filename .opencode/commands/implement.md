---
description: Implement a feature from an approved spec file using sub-agents. Usage: /implement <path-to-spec>
agent: general
---

# Implement from Spec: $ARGUMENTS

You are the orchestrator. Your job is to coordinate sub-agents — you do NOT write implementation code yourself.

## Step 1 — Validate the spec
Read: `$ARGUMENTS`

Check:
- [ ] Status is "Draft" or "Approved" (not "In Progress" or "Done")
- [ ] Acceptance criteria are clear and testable
- [ ] API contract has request/response schemas (for backend specs)
- [ ] Repository methods are listed (for backend specs)
- [ ] State mutations are listed (for agent/LangGraph specs)
- [ ] Business rules are explicit

If the spec is incomplete, stop and ask the developer to complete it.

## Step 2 — Mark as In Progress
Edit the spec: `Status: Draft` → `Status: In Progress`

## Step 3 — Delegate tasks using the Task tool

Follow dependency order. Run parallel tasks simultaneously where safe.

### If DB changes are needed → run FIRST (blocks everything else)
Task: @database
Read spec at $ARGUMENTS.
Apply the schema changes described in the spec.
Run migration and confirm success.

### Then in parallel (if no inter-dependencies)
Task: @backend
Read spec at $ARGUMENTS.
Implement all endpoints and/or LangGraph nodes listed in the spec.
Follow Repository Pattern: controller → service → repository.
Commit after each module.

Task: @frontend
Read spec at $ARGUMENTS.
Implement all pages and components listed in the spec.
Update Zustand stores as described.
Add TanStack Query hooks for new endpoints.
Commit after each page.

## Step 4 — Final validation
Once all tasks complete:
1. Run typecheck on both apps (see AGENTS.md for commands)
2. Run lint on both apps
3. Review git log to confirm commits from each agent

## Step 5 — Mark as Done
Edit the spec: `Status: In Progress` → `Status: Done`

Output a summary:
- What was implemented
- Commits made (with hashes)
- Any known issues or follow-up tasks