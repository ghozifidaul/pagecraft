import { describe, it, expect, vi, beforeEach } from "vitest"
import { generateBookStory, regeneratePageStory } from "../story.service"
import type { StoryGenInput, StoryRegenInput } from "../../types/ai"

const API_KEY = "test-api-key"

const mockInput: StoryGenInput = {
  title: "The Brave Little Turtle",
  synopsis: "A shy turtle learns to be brave",
  characterDesc: "A shy green sea turtle named Timmy",
  pageCount: 3,
  artStyleId: "watercolor",
}

const mockRegenInput: StoryRegenInput = {
  currentStory: "Timmy was scared of the big ocean.",
  feedback: "Make it funnier",
  bookContext: {
    title: "The Brave Little Turtle",
    characterDesc: "A shy green sea turtle named Timmy",
    synopsis: "A shy turtle learns to be brave",
  },
}

function mockFetch(response: Record<string, unknown>) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
    ...response,
  })
}

function buildSuccessResponse(pages: Array<{ page_number: number; story: string }>) {
  const outputText = JSON.stringify({ pages })
  return {
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        id: "int_test",
        status: "completed",
        steps: [
          {
            type: "model_output",
            content: [{ type: "text", text: outputText }],
          },
        ],
        usage: { total_tokens: 100 },
      }),
  }
}

describe("generateBookStory", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("returns PageStory array on successful generation", async () => {
    const mockPages = [
      { page_number: 1, story: "Once upon a time there was a turtle." },
      { page_number: 2, story: "He faced his fears." },
      { page_number: 3, story: "He became brave." },
    ]
    mockFetch(buildSuccessResponse(mockPages))

    const result = await generateBookStory(API_KEY, mockInput)

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ pageNumber: 1, story: "Once upon a time there was a turtle." })
    expect(result[1]).toEqual({ pageNumber: 2, story: "He faced his fears." })
    expect(result[2]).toEqual({ pageNumber: 3, story: "He became brave." })
  })

  it("sends correct model and structured output config", async () => {
    mockFetch(buildSuccessResponse([{ page_number: 1, story: "Test." }]))
    await generateBookStory(API_KEY, mockInput)

    const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(callArgs[1].body as string)

    expect(body.model).toBe("gemini-3.1-flash-lite")
    expect(body.system_instruction).toContain("children's story writer")
    expect(body.response_format.type).toBe("text")
    expect(body.response_format.mime_type).toBe("application/json")
    expect(body.response_format.schema).toBeDefined()
    expect(body.response_format.schema.properties.pages.minItems).toBe(3)
    expect(body.response_format.schema.properties.pages.maxItems).toBe(3)
    expect(body.input).toContain("The Brave Little Turtle")
    expect(body.input).toContain("watercolor")
  })

  it("throws when status is failed", async () => {
    mockFetch({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: "int_test",
          status: "failed",
          steps: [],
          error: { message: "Model refused" },
        }),
    })

    await expect(generateBookStory(API_KEY, mockInput)).rejects.toThrow("Model refused")
  })

  it("throws when no pages returned", async () => {
    mockFetch(buildSuccessResponse([]))

    await expect(generateBookStory(API_KEY, mockInput)).rejects.toThrow("No pages returned")
  })

  it("throws when outputText is null", async () => {
    mockFetch({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: "int_test",
          status: "completed",
          steps: [{ type: "thought", signature: "abc" }],
        }),
    })

    await expect(generateBookStory(API_KEY, mockInput)).rejects.toThrow(
      "No pages returned from story generation"
    )
  })

  it("throws on malformed JSON in outputText", async () => {
    mockFetch({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: "int_test",
          status: "completed",
          steps: [
            {
              type: "model_output",
              content: [{ type: "text", text: "not valid json" }],
            },
          ],
        }),
    })

    await expect(generateBookStory(API_KEY, mockInput)).rejects.toThrow()
  })

  it("throws on non-ok HTTP response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: "API key invalid" } }), { status: 401 }))

    await expect(generateBookStory(API_KEY, mockInput)).rejects.toThrow("API key invalid")
  })

  it("throws on network error", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"))

    await expect(generateBookStory(API_KEY, mockInput)).rejects.toThrow()
  })
})

describe("regeneratePageStory", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("returns rewritten story on success", async () => {
    mockFetch({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: "int_regen",
          status: "completed",
          steps: [
            {
              type: "model_output",
              content: [{ type: "text", text: "Timmy told a joke to the ocean." }],
            },
          ],
        }),
    })

    const result = await regeneratePageStory(API_KEY, mockRegenInput)

    expect(result).toBe("Timmy told a joke to the ocean.")
  })

  it("sends book context and feedback in prompt", async () => {
    mockFetch({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: "int_regen",
          status: "completed",
          steps: [
            {
              type: "model_output",
              content: [{ type: "text", text: "New story." }],
            },
          ],
        }),
    })

    await regeneratePageStory(API_KEY, mockRegenInput)

    const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(callArgs[1].body as string)

    expect(body.model).toBe("gemini-3.1-flash-lite")
    expect(body.input).toContain("Make it funnier")
    expect(body.input).toContain("Timmy was scared of the big ocean.")
    expect(body.input).toContain("The Brave Little Turtle")
  })

  it("falls back to currentStory when outputText is null", async () => {
    mockFetch({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: "int_regen",
          status: "completed",
          steps: [{ type: "model_output", content: [{ type: "image", data: "abc", mime_type: "image/png" }] }],
        }),
    })

    const result = await regeneratePageStory(API_KEY, mockRegenInput)

    expect(result).toBe(mockRegenInput.currentStory)
  })

  it("throws when status is failed", async () => {
    mockFetch({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: "int_regen",
          status: "failed",
          steps: [],
          error: { message: "Content blocked" },
        }),
    })

    await expect(regeneratePageStory(API_KEY, mockRegenInput)).rejects.toThrow("Content blocked")
  })
})
