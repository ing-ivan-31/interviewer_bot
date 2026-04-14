import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

/**
 * Zod schema for runtime validation.
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

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;

/**
 * Class DTO for Swagger documentation.
 */
export class SubmitAnswerDto {
  @ApiProperty({
    description: "The candidate's answer to the current question",
    example:
      'let and const are block-scoped while var is function-scoped. const prevents reassignment but not mutation of objects.',
    minLength: 1,
    maxLength: 2500,
  })
  answer: string;
}
