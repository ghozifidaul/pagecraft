import { createInteraction } from "../lib/gemini"
import type { StoryGenInput, StoryGenOutput, StoryRegenInput } from "../types/ai"

const MODEL = "gemini-3.1-flash-lite"
const SYSTEM_INSTRUCTION = `You are a children's story writer.
You write engaging, age-appropriate stories split across multiple pages.
Each page must be a coherent narrative segment of 2–4 sentences.
End each page with a gentle hook that makes the reader want to continue.
The story should have a clear beginning, middle, and end across all pages.
Maintain consistent character voices and descriptions throughout.`

function buildStorySchema(pageCount: number): Record<string, unknown> {
  return {
    type: "object",
    properties: {
      pages: {
        type: "array",
        minItems: pageCount,
        maxItems: pageCount,
        items: {
          type: "object",
          properties: {
            page_number: {
              type: "integer",
              description: "Page number starting from 1",
            },
            story: {
              type: "string",
              description: "Story text for this page, 2-4 sentences",
            },
          },
          required: ["page_number", "story"],
        },
      },
    },
    required: ["pages"],
  }
}

export async function generateBookStory(
  apiKey: string,
  input: StoryGenInput
): Promise<StoryGenOutput> {
  const userPrompt = `Create a children's story with the following details:

Title: ${input.title}
Character: ${input.characterDesc}
Synopsis: ${input.synopsis}
Number of pages: ${input.pageCount}
Art Style: ${input.artStyleId}

Write a ${input.pageCount}-page story that follows the synopsis above. Each page should be 2-4 sentences and end with a gentle hook.`

  const result = await createInteraction(apiKey, {
    model: MODEL,
    input: userPrompt,
    system_instruction: SYSTEM_INSTRUCTION,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: buildStorySchema(input.pageCount),
    },
  })

  if (result.status === "failed") {
    throw new Error(result.error ?? "Story generation failed")
  }

  const parsed = JSON.parse(result.outputText ?? "{}") as {
    pages?: Array<{ page_number: number; story: string }>
  }

  if (!parsed.pages || parsed.pages.length === 0) {
    throw new Error("No pages returned from story generation")
  }

  return parsed.pages.map((p) => ({
    pageNumber: p.page_number,
    story: p.story,
  }))
}

export async function regeneratePageStory(
  apiKey: string,
  input: StoryRegenInput
): Promise<string> {
  const userPrompt = `I need to rewrite one page of a children's book.

Book context:
- Title: ${input.bookContext.title}
- Character: ${input.bookContext.characterDesc}
- Synopsis: ${input.bookContext.synopsis}

Current page story: "${input.currentStory}"

User feedback: "${input.feedback}"

Rewrite the page story based on the feedback. Keep it 2-4 sentences and maintain consistency with the book's characters and style. Return only the rewritten story text.`

  const result = await createInteraction(apiKey, {
    model: MODEL,
    input: userPrompt,
    system_instruction: SYSTEM_INSTRUCTION,
  })

  if (result.status === "failed") {
    throw new Error(result.error ?? "Story regeneration failed")
  }

  return result.outputText ?? input.currentStory
}
