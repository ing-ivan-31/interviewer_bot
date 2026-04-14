import { z } from 'zod';

/**
 * Create session DTO - empty body, config comes from env.
 */
export const CreateSessionSchema = z.object({}).strict();

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
