import { describe, it, expect } from "vitest"
import { generateBookStory, regeneratePageStory } from "../story.service"
import type { StoryGenInput, StoryRegenInput } from "../../types/ai"

const API_KEY = process.env.GEMINI_API_KEY ?? ""

function skipIfNoKey() {
  if (!API_KEY) {
    console.warn("Skipping integration tests: GEMINI_API_KEY not set")
  }
  return !API_KEY
}

describe("generateBookStory integration", () => {
  it.skipIf(skipIfNoKey())("generates a 6-page story from real inputs", async () => {
    const input: StoryGenInput = {
      title: "The Brave Little Turtle",
      synopsis: "A shy turtle named Timmy learns to overcome his fears with the help of his friends.",
      characterDesc: "A small green sea turtle with big eyes who is afraid of the deep ocean",
      pageCount: 6,
      artStyleId: "watercolor",
    }

    const result = await generateBookStory(API_KEY, input)

    expect(result).toHaveLength(6)

    for (let i = 0; i < result.length; i++) {
      expect(result[i].pageNumber).toBe(i + 1)
      expect(result[i].story).toBeTruthy()
      expect(result[i].story.length).toBeGreaterThan(20)
    }
  })

  it.skipIf(skipIfNoKey())("generates a 3-page story (minimum viable)", async () => {
    const input: StoryGenInput = {
      title: "Red Balloon",
      synopsis: "A balloon floats away and finds a new home.",
      characterDesc: "A cheerful red balloon",
      pageCount: 3,
      artStyleId: "pixel-art",
    }

    const result = await generateBookStory(API_KEY, input)

    expect(result).toHaveLength(3)
    expect(result[0].pageNumber).toBe(1)
    expect(result[2].pageNumber).toBe(3)
    result.forEach((p) => expect(p.story.length).toBeGreaterThan(15))
  })
})

describe("regeneratePageStory integration", () => {
  it.skipIf(skipIfNoKey())("rewrites a page based on feedback", async () => {
    const input: StoryRegenInput = {
      currentStory: "Timmy hid inside his shell and refused to come out.",
      feedback: "Make it funnier and more playful",
      bookContext: {
        title: "The Brave Little Turtle",
        characterDesc: "A shy green sea turtle named Timmy",
        synopsis: "A shy turtle learns to be brave",
      },
    }

    const result = await regeneratePageStory(API_KEY, input)

    expect(result).toBeTruthy()
    expect(result.length).toBeGreaterThan(15)
    expect(result).not.toBe(input.currentStory)
  })
})
