import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../db/books", () => ({
  listBooks: vi.fn(),
  getBookById: vi.fn(),
  createBook: vi.fn(),
  deleteBook: vi.fn(),
  bookExists: vi.fn(),
}))

vi.mock("../../db/pages", () => ({
  getPagesByBookId: vi.fn(),
  getPageById: vi.fn(),
  getPageByBookAndNumber: vi.fn(),
  updatePageStory: vi.fn(),
  insertPages: vi.fn(),
  getLatestImagePageNumber: vi.fn(),
}))

vi.mock("../../services/story.service", () => ({
  generateBookStory: vi.fn(),
  regeneratePageStory: vi.fn(),
}))

import * as Books from "../../db/books"
import * as Pages from "../../db/pages"
import { generateBookStory, regeneratePageStory } from "../../services/story.service"
import booksRouter from "../books"
import pagesRouter from "../pages"
import type { Book, Page } from "../../types/db"

const mockBook: Book = {
  id: "book-1",
  title: "The Brave Little Turtle",
  synopsis: "A shy turtle learns to be brave",
  character_desc: "A shy green sea turtle named Timmy",
  page_count: 6,
  art_style_id: "watercolor",
  created_at: "2024-01-01T00:00:00.000Z",
}

const mockPages: Page[] = [
  {
    id: "page-1",
    book_id: "book-1",
    page_number: 1,
    page_story: "Once upon a time there was a turtle.",
    image_r2_key: null,
    created_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "page-2",
    book_id: "book-1",
    page_number: 2,
    page_story: "He faced his fears.",
    image_r2_key: null,
    created_at: "2024-01-01T00:00:00.000Z",
  },
]

const validBookInput = {
  title: "The Brave Little Turtle",
  synopsis: "A shy turtle learns to be brave",
  characterDesc: "A shy green sea turtle named Timmy",
  pageCount: 6,
  artStyleId: "watercolor",
}

const mockEnv = {
  pagecraft_db: {} as any,
  GEMINI_API_KEY: "test-api-key",
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/books", () => {
  it("returns 200 with empty list when no books exist", async () => {
    vi.mocked(Books.listBooks).mockResolvedValue([])

    const res = await booksRouter.request("/", { method: "GET" }, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual([])
  })

  it("returns 200 with all books sorted by created_at desc", async () => {
    vi.mocked(Books.listBooks).mockResolvedValue([mockBook])

    const res = await booksRouter.request("/", { method: "GET" }, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe("book-1")
    expect(body[0].title).toBe("The Brave Little Turtle")
    expect(body[0].pages).toBeUndefined()
  })
})

describe("GET /api/books/:id", () => {
  it("returns 200 with book and pages when found", async () => {
    vi.mocked(Books.getBookById).mockResolvedValue(mockBook)
    vi.mocked(Pages.getPagesByBookId).mockResolvedValue(mockPages)

    const res = await booksRouter.request("/book-1", { method: "GET" }, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe("book-1")
    expect(body.title).toBe("The Brave Little Turtle")
    expect(body.pages).toHaveLength(2)
    expect(body.pages[0].page_number).toBe(1)
    expect(body.pages[1].page_number).toBe(2)
  })

  it("returns 404 when book not found", async () => {
    vi.mocked(Books.getBookById).mockResolvedValue(null)

    const res = await booksRouter.request("/nonexistent", { method: "GET" }, mockEnv)

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe("Book not found")
  })
})

describe("POST /api/books", () => {
  beforeEach(() => {
    vi.mocked(Books.createBook).mockResolvedValue(mockBook)
    vi.mocked(Pages.getPagesByBookId).mockResolvedValue(mockPages)
    generateBookStory.mockReset()
  })

  it("returns 201 with book and pages on successful creation", async () => {
    vi.mocked(generateBookStory).mockResolvedValue([
      { pageNumber: 1, story: "Once upon a time there was a turtle." },
      { pageNumber: 2, story: "He faced his fears." },
    ])

    const res = await booksRouter.request(
      "/",
      {
        method: "POST",
        body: JSON.stringify(validBookInput),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.title).toBe("The Brave Little Turtle")
    expect(body.pages).toHaveLength(2)

    expect(vi.mocked(Books.createBook)).toHaveBeenCalledWith(
      mockEnv.pagecraft_db,
      expect.any(String),
      validBookInput,
    )
    expect(vi.mocked(generateBookStory)).toHaveBeenCalledWith("test-api-key", {
      title: validBookInput.title,
      synopsis: validBookInput.synopsis,
      characterDesc: validBookInput.characterDesc,
      pageCount: validBookInput.pageCount,
      artStyleId: validBookInput.artStyleId,
    })
    expect(vi.mocked(Pages.insertPages)).toHaveBeenCalledWith(
      mockEnv.pagecraft_db,
      expect.arrayContaining([
        expect.objectContaining({ bookId: expect.any(String), pageNumber: 1, pageStory: "Once upon a time there was a turtle." }),
        expect.objectContaining({ bookId: expect.any(String), pageNumber: 2, pageStory: "He faced his fears." }),
      ]),
    )
  })

  it("returns 400 when title is missing", async () => {
    const res = await booksRouter.request(
      "/",
      {
        method: "POST",
        body: JSON.stringify({ ...validBookInput, title: "" }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Validation failed")
    expect(body.details).toContain("title is required and must be a non-empty string")
  })

  it("returns 400 when synopsis is missing", async () => {
    const res = await booksRouter.request(
      "/",
      {
        method: "POST",
        body: JSON.stringify({ ...validBookInput, synopsis: "" }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.details).toContain("synopsis is required and must be a non-empty string")
  })

  it("returns 400 when characterDesc is missing", async () => {
    const res = await booksRouter.request(
      "/",
      {
        method: "POST",
        body: JSON.stringify({ ...validBookInput, characterDesc: "" }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.details).toContain("characterDesc is required and must be a non-empty string")
  })

  it("returns 400 when pageCount is less than 6", async () => {
    const res = await booksRouter.request(
      "/",
      {
        method: "POST",
        body: JSON.stringify({ ...validBookInput, pageCount: 3 }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.details).toContain("pageCount must be between 6 and 10")
  })

  it("returns 400 when pageCount is greater than 10", async () => {
    const res = await booksRouter.request(
      "/",
      {
        method: "POST",
        body: JSON.stringify({ ...validBookInput, pageCount: 12 }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.details).toContain("pageCount must be between 6 and 10")
  })

  it("returns 400 when pageCount is not an integer", async () => {
    const res = await booksRouter.request(
      "/",
      {
        method: "POST",
        body: JSON.stringify({ ...validBookInput, pageCount: 6.5 }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.details).toContain("pageCount is required and must be an integer")
  })

  it("returns 400 when artStyleId is missing", async () => {
    const res = await booksRouter.request(
      "/",
      {
        method: "POST",
        body: JSON.stringify({ ...validBookInput, artStyleId: "" }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.details).toContain("artStyleId is required and must be a non-empty string")
  })

  it("returns 400 with multiple validation errors", async () => {
    const res = await booksRouter.request(
      "/",
      {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.details.length).toBeGreaterThanOrEqual(5)
  })

  it("deletes book and returns 500 when story generation fails", async () => {
    vi.mocked(generateBookStory).mockRejectedValue(new Error("API key invalid"))

    const res = await booksRouter.request(
      "/",
      {
        method: "POST",
        body: JSON.stringify(validBookInput),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(500)

    expect(vi.mocked(Books.deleteBook)).toHaveBeenCalledWith(
      mockEnv.pagecraft_db,
      expect.any(String),
    )
  })
})

describe("DELETE /api/books/:id", () => {
  it("returns 200 with success: true when book is deleted", async () => {
    vi.mocked(Books.bookExists).mockResolvedValue(true)
    vi.mocked(Books.deleteBook).mockResolvedValue(true)

    const res = await booksRouter.request("/book-1", { method: "DELETE" }, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ success: true })
    expect(vi.mocked(Books.deleteBook)).toHaveBeenCalledWith(mockEnv.pagecraft_db, "book-1")
  })

  it("returns 404 when book does not exist", async () => {
    vi.mocked(Books.bookExists).mockResolvedValue(false)

    const res = await booksRouter.request("/nonexistent", { method: "DELETE" }, mockEnv)

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe("Book not found")
    expect(vi.mocked(Books.deleteBook)).not.toHaveBeenCalled()
  })
})

describe("PUT /api/books/:id/pages/:pageId/story", () => {
  const updatedStory = "The brave turtle swam across the ocean."

  beforeEach(() => {
    vi.mocked(Books.getBookById).mockResolvedValue(mockBook)
    vi.mocked(Pages.getPageById).mockResolvedValue(mockPages[0])
    vi.mocked(Pages.updatePageStory).mockResolvedValue(undefined)
    vi.mocked(Pages.getPagesByBookId).mockResolvedValue(mockPages)
  })

  it("returns 200 with updated page on success", async () => {
    vi.mocked(Pages.getPageById).mockResolvedValue({
      ...mockPages[0],
      page_story: updatedStory,
    })

    const res = await pagesRouter.request(
      "/book-1/pages/page-1/story",
      {
        method: "PUT",
        body: JSON.stringify({ story: updatedStory }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.page_story).toBe(updatedStory)
    expect(vi.mocked(Pages.updatePageStory)).toHaveBeenCalledWith(
      mockEnv.pagecraft_db,
      "page-1",
      updatedStory,
    )
  })

  it("returns 404 when book not found", async () => {
    vi.mocked(Books.getBookById).mockResolvedValue(null)

    const res = await pagesRouter.request(
      "/book-1/pages/page-1/story",
      {
        method: "PUT",
        body: JSON.stringify({ story: updatedStory }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe("Book not found")
  })

  it("returns 404 when page not found", async () => {
    vi.mocked(Pages.getPageById).mockResolvedValue(null)

    const res = await pagesRouter.request(
      "/book-1/pages/nonexistent/story",
      {
        method: "PUT",
        body: JSON.stringify({ story: updatedStory }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe("Page not found")
  })

  it("returns 404 when page does not belong to the book", async () => {
    vi.mocked(Pages.getPageById).mockResolvedValue({
      ...mockPages[0],
      book_id: "other-book",
    })

    const res = await pagesRouter.request(
      "/book-1/pages/page-1/story",
      {
        method: "PUT",
        body: JSON.stringify({ story: updatedStory }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe("Page not found")
  })

  it("returns 400 when story is empty", async () => {
    const res = await pagesRouter.request(
      "/book-1/pages/page-1/story",
      {
        method: "PUT",
        body: JSON.stringify({ story: "" }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("story is required and must be a non-empty string")
  })

  it("returns 400 when story is missing from body", async () => {
    const res = await pagesRouter.request(
      "/book-1/pages/page-1/story",
      {
        method: "PUT",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("story is required and must be a non-empty string")
  })
})

describe("POST /api/books/:id/pages/:pageId/story/regenerate", () => {
  const feedback = "Make it funnier and more playful"
  const regeneratedStory = "Timmy told a joke to the ocean and the waves laughed."

  beforeEach(() => {
    vi.mocked(Books.getBookById).mockResolvedValue(mockBook)
    vi.mocked(Pages.getPageById).mockResolvedValue(mockPages[0])
    vi.mocked(Pages.updatePageStory).mockResolvedValue(undefined)
    vi.mocked(regeneratePageStory).mockResolvedValue(regeneratedStory)
  })

  it("returns 200 with regenerated page on success", async () => {
    vi.mocked(Pages.getPageById)
      .mockResolvedValueOnce(mockPages[0])
      .mockResolvedValueOnce({
        ...mockPages[0],
        page_story: regeneratedStory,
      })

    const res = await pagesRouter.request(
      "/book-1/pages/page-1/story/regenerate",
      {
        method: "POST",
        body: JSON.stringify({ feedback }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.page_story).toBe(regeneratedStory)

    expect(vi.mocked(regeneratePageStory)).toHaveBeenCalledWith("test-api-key", {
      currentStory: mockPages[0].page_story,
      feedback,
      bookContext: {
        title: mockBook.title,
        characterDesc: mockBook.character_desc,
        synopsis: mockBook.synopsis,
      },
      pageNumber: 1,
      totalPages: 6,
      previousPageStory: undefined,
      nextPageStory: undefined,
    })
    expect(vi.mocked(Pages.updatePageStory)).toHaveBeenCalledWith(
      mockEnv.pagecraft_db,
      "page-1",
      regeneratedStory,
    )
  })

  it("returns 404 when book not found", async () => {
    vi.mocked(Books.getBookById).mockResolvedValue(null)

    const res = await pagesRouter.request(
      "/book-1/pages/page-1/story/regenerate",
      {
        method: "POST",
        body: JSON.stringify({ feedback }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe("Book not found")
  })

  it("returns 404 when page not found", async () => {
    vi.mocked(Pages.getPageById).mockResolvedValue(null)

    const res = await pagesRouter.request(
      "/book-1/pages/nonexistent/story/regenerate",
      {
        method: "POST",
        body: JSON.stringify({ feedback }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe("Page not found")
  })

  it("returns 404 when page does not belong to the book", async () => {
    vi.mocked(Pages.getPageById).mockResolvedValue({
      ...mockPages[0],
      book_id: "other-book",
    })

    const res = await pagesRouter.request(
      "/book-1/pages/page-1/story/regenerate",
      {
        method: "POST",
        body: JSON.stringify({ feedback }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe("Page not found")
  })

  it("returns 400 when feedback is empty", async () => {
    const res = await pagesRouter.request(
      "/book-1/pages/page-1/story/regenerate",
      {
        method: "POST",
        body: JSON.stringify({ feedback: "" }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("feedback is required and must be a non-empty string")
  })

  it("returns 400 when feedback is missing from body", async () => {
    const res = await pagesRouter.request(
      "/book-1/pages/page-1/story/regenerate",
      {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("feedback is required and must be a non-empty string")
  })

  it("returns 500 when AI regeneration fails", async () => {
    vi.mocked(regeneratePageStory).mockRejectedValue(new Error("Content blocked by safety filters"))

    const res = await pagesRouter.request(
      "/book-1/pages/page-1/story/regenerate",
      {
        method: "POST",
        body: JSON.stringify({ feedback }),
        headers: { "Content-Type": "application/json" },
      },
      mockEnv,
    )

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe("Content blocked by safety filters")
  })
})
