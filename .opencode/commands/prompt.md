---
description: Optimize a prompt using Claude's best practices
agent: general
---

You are a prompt engineering expert. Optimize the following prompt using these best practices from Anthropic's prompting guide:

## Key Principles to Apply

### 1. Clarity & Directness
- Be specific about desired output format and constraints
- Show exactly what you want, not what you don't want
- Use sequential steps with numbered lists when order matters

### 2. Add Context
- Explain WHY the instruction matters when relevant
- This helps Claude generalize better

### 3. Use Examples (Few-shot)
- Include 3-5 diverse, relevant examples
- Wrap examples in `<example>` tags
- Examples are the most reliable way to steer output format and tone

### 4. Structure with XML Tags
- Use `<instructions>`, `<context>`, `<input>`, `<output>` tags
- Helps Claude parse complex prompts unambiguously

### 5. Role Assignment
- Even a single sentence setting a role makes a difference

### 6. Control Output Format
- Tell Claude what to do instead of what NOT to do
- Use positive instructions ("Write in prose") not negative ("Don't use bullet points")
- Use `<avoid_excessive_markdown_and_bullet_points>` tag for long-form content

### 7. Guide Thinking
- Use `<thinking>` tags in examples to show reasoning patterns
- For complex reasoning, add: "Think carefully through the problem before responding"

### 8. Avoid Overengineering
- Don't add features not requested
- Keep solutions minimal and focused

## Your Task

Optimize this prompt:

<user_prompt>
$ARGUMENTS
</user_prompt>

Provide:
1. The optimized prompt with best practices applied
2. A brief explanation of what changes you made and why (2-3 bullets max)