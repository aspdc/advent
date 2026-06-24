import {
  InvokeCommand,
  InvokeCommandOutput,
  LambdaClient,
} from "@aws-sdk/client-lambda"
import { serverEnv } from "@/lib/env"
import {
  GenerateRequestSchema,
  ValidateRequestSchema,
  type generateRequest,
  type validateRequest,
} from "@/validations/lambda"
import { tryCatch } from "@/lib/try-catch"

export const lambda = new LambdaClient({
  region: serverEnv.AWS_REGION,
  credentials: {
    accessKeyId: serverEnv.IAM_ACCESS_KEY_ID,
    secretAccessKey: serverEnv.IAM_SECRET_ACCESS_KEY,
  },
})

export async function executeLambda(
  input:
    | { action: "generate"; payload: generateRequest }
    | { action: "validate"; payload: validateRequest }
) {
  const parsedPayload =
    input.action === "generate"
      ? GenerateRequestSchema.parse(input.payload)
      : ValidateRequestSchema.parse(input.payload)

  const command = new InvokeCommand({
    FunctionName: serverEnv.LAMBDA_NAME,
    Payload: JSON.stringify(parsedPayload),
    InvocationType: "RequestResponse",
  })

  const { data, error } = await tryCatch<InvokeCommandOutput>(
    lambda.send(command)
  )

  if (error) {
    console.error("Infrastructure or IAM Error:", error)
    return { success: false, errorMessage: "Failed to reach the server." }
  }

  if (data.FunctionError) {
    const errorPayload = data.Payload
      ? Buffer.from(data.Payload).toString()
      : "Unknown"
    console.error("Lambda internal execution error:", errorPayload)
    return { success: false, errorMessage: "The function crashed internally." }
  }

  let parsedResponse = null
  if (data.Payload) {
    const stringPayload = Buffer.from(data.Payload).toString("utf-8")
    parsedResponse = JSON.parse(stringPayload)
  }

  return { success: true, data: parsedResponse }
}
