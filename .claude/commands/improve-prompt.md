---
description: Refine a rough feature idea into a spec-ready prompt using Claude best practices before running /spec. Usage: /improve-prompt <idea>
allowed-tools: Read, Write, Glob, Grep, Task
---

# Prompt Refinement Pre-Spec

You prepare the feature request *before* `/spec` runs so downstream agents work from a crisp brief. Take the raw idea below and rewrite it using Anthropic’s prompting best practices.

<raw_request>
$ARGUMENTS
</raw_request>

## Step 1 — Load context
- Read `AGENTS.md` for rules.
- Glance at `docs/specs/` for similar work to avoid duplicates.
- If the feature touches data, skim `src/interviewer-evaluator-api/prisma/schema.prisma`.

## Step 2 — Apply Claude Prompting Best Practices
Transform the request using these principles:
1. **Clarity & Directness** — Specify actor, trigger, outcome, success criteria. Say what to do, not what to avoid.
2. **Context & Motivation** — Explain *why* each requirement matters so Claude can generalize.
3. **Examples & Edge Cases** — Include 1–3 `<example>` blocks or explicit scenarios when helpful.
4. **XML Structure** — Wrap sections with descriptive tags (`<context>`, `<requirements>`, `<constraints>`, `<edge_cases>`, `<output_format>`).
5. **Role Assignment** — State the perspective (candidate, coordinator, evaluator bot).
6. **Positive Output Control** — Request desired formatting explicitly.
7. **Thinking Guidance** — Use cues like “Think carefully before responding” when reasoning is complex.
8. **Avoid Overengineering** — Keep scope limited to what was asked unless a blocker exists.

### Helpful Example

```xml
<context>
Coordinators need pause/resume controls so candidates can step away without losing evaluation progress.
</context>
<requirements>
  <req id="1">Show current session status (IN_PROGRESS, PAUSED, COMPLETED) with unambiguous badges.</req>
  <req id="2">Coordinators can pause/resume any session; candidates can only affect their own.</req>
</requirements>
<edge_cases>
  <case>Resuming after 24h requires confirmation.</case>
  <case>Completed session → display toast “Cannot resume”.</case>
</edge_cases>
<output_format>
Return acceptance criteria bullets plus REST + WebSocket contract updates.</output_format>
```

## Step 3 — Output
Produce:
1. **Refined Prompt** — Structured XML containing context, requirements, constraints, edge cases, telemetry, and explicit output instructions.
2. **Delta Notes** — 2–3 bullets explaining the improvements you made.
3. **Critical-Thinking Option** — Ask the user: “Run critical-thinking review on this? (yes/no)”. Wait for their reply.
   - If **yes** → use the Task tool to invoke `@critical-thinking` with the refined prompt. Return its single probing question + critique under `### Critical Thinking Review`.
   - If **no** → skip the delegation.
4. **Next Step** — Suggest `/spec "<refined prompt>"` on a dedicated line for easy copy/paste.

## Guardrails
- Do not launch `/spec` or modify files.
- Never overwrite user intent—clarify it.
- If the request still lacks must-have details after best effort, list open questions and stop.
