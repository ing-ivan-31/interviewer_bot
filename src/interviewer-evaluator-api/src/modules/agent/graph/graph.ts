import { StateGraph, END } from '@langchain/langgraph';
import { AgentStateAnnotation } from './state';
import { questionGeneratorNode } from './nodes/question-generator.node';

/**
 * Build and compile the agent graph.
 * Phase 1: Single node (question_generator) with no checkpointing.
 *
 * Flow: START -> question_generator -> END
 */
export function buildGraph() {
  const graph = new StateGraph(AgentStateAnnotation)
    .addNode('question_generator', questionGeneratorNode)
    .addEdge('__start__', 'question_generator')
    .addEdge('question_generator', END);

  return graph.compile();
}
