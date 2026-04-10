import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { Runnable } from '@langchain/core/runnables';
import { getLlm } from '../../../../config/llm.config';
import { AgentState } from '../state';
import { QUESTION_GENERATOR_PROMPT } from '../prompts/question-generator.prompt';

// Lazy chain initialization
type ChainType = Runnable<Record<string, string>, string>;
let chain: ChainType | null = null;

function getChain(): ChainType {
  if (chain) {
    return chain;
  }

  const prompt = PromptTemplate.fromTemplate(QUESTION_GENERATOR_PROMPT);
  chain = prompt.pipe(getLlm()).pipe(new StringOutputParser());
  return chain;
}

/**
 * Format previous questions for the prompt.
 */
function formatPreviousQuestions(history: AgentState['history']): string {
  if (history.length === 0) {
    return 'None - this is the first question.';
  }

  return history.map((qa) => `- ${qa.question}`).join('\n');
}

/**
 * Question generator node - generates a question based on current topic and difficulty.
 *
 * Input: AgentState with currentTopic and currentDifficulty set
 * Output: Partial<AgentState> with currentQuestion populated
 */
export async function questionGeneratorNode(
  state: AgentState,
): Promise<Partial<AgentState>> {
  const previousQuestions = formatPreviousQuestions(state.history);

  const question = await getChain().invoke({
    topic: state.currentTopic,
    difficulty: state.currentDifficulty,
    previousQuestions,
  });

  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    return {
      error: 'LLM returned empty response',
    };
  }

  return {
    currentQuestion: trimmedQuestion,
    error: null,
  };
}
