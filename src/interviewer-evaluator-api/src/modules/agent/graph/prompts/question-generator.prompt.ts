export const QUESTION_GENERATOR_PROMPT = `
Topic: {topic}
Question {questionNumber} of {totalQuestions}
Difficulty: {difficulty}
 
Previously asked questions — do NOT repeat any of these concepts:
{previousQuestions}
 
---
 
Generate ONE question using EXACTLY one of these two formats.
Rotate the format — do not use the same type twice in a row.

FORMAT 1 — Comparative (choose between A and B):
Present two real implementation options for the same problem.
Ask which to choose given a specific constraint (performance, readability, bundle size, etc.).
Both options must be valid — the answer depends on the trade-off.
 
Example:
You need to share auth state across 20+ components.
Option A: React Context with useReducer.
Option B: Zustand with a single store slice.
Which do you choose if re-render performance is the primary concern, and why?
 
---

FORMAT 2 — Code reading (what is the output / what happens):
Show a short JS or React snippet (max 15 lines).
Ask a specific question about the output, behavior, or execution order.
The correct answer must be a concrete value, error, or specific behavior.
 
Example:
\`\`\`javascript
const obj = {{ a: 1 }};
const copy = Object.assign({{}}, obj);
copy.a = 99;
console.log(obj.a);
\`\`\`
What does this log and why? Would your answer change if \`a\` were an array instead of a number?
 
---
 
STRICT RULES:
- Output ONLY the question text — no labels, no "Format 1:", no preamble
- Include a code snippet when using Format 1 or 2
- The question must be answerable concisely — no question that requires a 10-minute essay
- Stay strictly within {topic}
- Never generate: "Explain X", "What do you know about X", "Describe X"
`.trim();
