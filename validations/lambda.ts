import { z } from "zod"

const emailSchema = z.email().trim()
const problemIdSchema = z.number().int().min(1).max(15)

export const GenerateRequestSchema = z
  .object({
    action: z.literal("generate"),
    email: emailSchema,
    problemId: problemIdSchema,
  })
  .strict()

export const ValidateRequestSchema = z
  .object({
    action: z.literal("validate"),
    email: emailSchema,
    problemId: problemIdSchema,
    answer: z.unknown(),
  })
  .strict()

export type generateRequest = z.infer<typeof GenerateRequestSchema>
export type validateRequest = z.infer<typeof ValidateRequestSchema>
