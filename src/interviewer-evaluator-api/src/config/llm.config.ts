import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

let llmInstance: ChatGoogleGenerativeAI | null = null;
let maxQuestionsValue: number | null = null;

/**
 * Get the LLM instance (lazy initialization).
 * Called after ConfigModule has loaded .env
 */
export function getLlm(): ChatGoogleGenerativeAI {
  if (llmInstance) {
    return llmInstance;
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-04-17';

  if (!apiKey) {
    throw new Error(
      'GOOGLE_API_KEY environment variable is required. Get one at https://aistudio.google.com/app/apikey',
    );
  }

  llmInstance = new ChatGoogleGenerativeAI({
    model,
    apiKey,
    temperature: 0.7,
  });

  return llmInstance;
}

/**
 * Get MAX_QUESTIONS_PER_SESSION with clamping to [1, 50].
 */
export function getMaxQuestionsPerSession(): number {
  if (maxQuestionsValue !== null) {
    return maxQuestionsValue;
  }

  const raw = process.env.MAX_QUESTIONS_PER_SESSION;
  if (!raw) {
    maxQuestionsValue = 10;
    return maxQuestionsValue;
  }

  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    maxQuestionsValue = 10;
    return maxQuestionsValue;
  }

  if (parsed < 1) {
    maxQuestionsValue = 1;
  } else if (parsed > 50) {
    maxQuestionsValue = 50;
  } else {
    maxQuestionsValue = parsed;
  }

  return maxQuestionsValue;
}
