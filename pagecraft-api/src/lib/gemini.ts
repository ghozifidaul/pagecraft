import type { GeminiRequest, InteractionResponse, InteractionStep, InteractionContent } from "../types/ai"

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/interactions"

function extractOutputText(steps: InteractionStep[]): string | null {
  const textParts: string[] = []
  for (const step of steps) {
    if (step.type !== "model_output") continue
    if (!step.content) continue
    for (const item of step.content) {
      if (item.type === "text" && item.text) {
        textParts.push(item.text)
      }
    }
  }
  return textParts.length > 0 ? textParts.join("") : null
}

function extractOutputImage(steps: InteractionStep[]): { data: string; mimeType: string } | null {
  for (const step of steps) {
    if (step.type !== "model_output") continue
    if (!step.content) continue
    for (const item of step.content) {
      if (item.type === "image" && item.data && item.mime_type) {
        return { data: item.data, mimeType: item.mime_type }
      }
    }
  }
  return null
}

interface GeminiErrorResponse {
  error?: {
    message?: string
    code?: number
    status?: string
  }
}

export async function createInteraction(
  apiKey: string,
  body: GeminiRequest
): Promise<InteractionResponse> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  })

  const data = await response.json() as Record<string, unknown> & GeminiErrorResponse

  if (!response.ok) {
    const msg = data?.error?.message ?? `Gemini API error: ${response.status}`
    throw new Error(msg)
  }

  const steps = (data.steps ?? []) as InteractionStep[]
  const outputText = extractOutputText(steps)

  return {
    id: data.id as string,
    status: data.status as InteractionResponse["status"],
    steps,
    outputText,
    usage: data.usage as InteractionResponse["usage"],
    error: data.error?.message,
  }
}

export async function getInteraction(
  apiKey: string,
  interactionId: string
): Promise<InteractionResponse> {
  const response = await fetch(`${BASE_URL}/${interactionId}`, {
    headers: {
      "x-goog-api-key": apiKey,
    },
  })

  const data = await response.json() as Record<string, unknown> & GeminiErrorResponse

  if (!response.ok) {
    const msg = data?.error?.message ?? `Gemini API error: ${response.status}`
    throw new Error(msg)
  }

  const steps = (data.steps ?? []) as InteractionStep[]
  const outputText = extractOutputText(steps)

  return {
    id: data.id as string,
    status: data.status as InteractionResponse["status"],
    steps,
    outputText,
    usage: data.usage as InteractionResponse["usage"],
    error: data.error?.message,
  }
}

export { extractOutputText, extractOutputImage }
