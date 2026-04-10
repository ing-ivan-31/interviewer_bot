import { z } from 'zod';

/**
 * Submit answer DTO with validation.
 */
export const SubmitAnswerSchema = z.object({
  answer: z
    .string()
    .min(1, 'Answer is required')
    .max(2500, 'Answer exceeds 2500 characters')
    .refine((val) => val.trim().length > 0, {
      message: 'Answer is required',
    }),
});

export type SubmitAnswerDto = z.infer<typeof SubmitAnswerSchema>;
