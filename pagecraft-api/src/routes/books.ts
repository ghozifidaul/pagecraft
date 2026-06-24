import { Hono } from "hono"
import * as Books from "../db/books"
import * as Pages from "../db/pages"
import { generateBookStory } from "../services/story.service"
import { getSignedImageUrl } from "../services/image.service"
import type { CreateBookInput } from "../types/db"

const router = new Hono<{ Bindings: CloudflareBindings }>()

router.get("/", async (c) => {
  const books = await Books.listBooks(c.env.pagecraft_db)
  return c.json(books)
})

router.get("/:id", async (c) => {
  const id = c.req.param("id")
  const book = await Books.getBookById(c.env.pagecraft_db, id)

  if (!book) {
    return c.json({ error: "Book not found" }, 404)
  }

  const pages = await Pages.getPagesByBookId(c.env.pagecraft_db, id)

  const pagesWithUrls = await Promise.all(pages.map(async (page) => {
    if (page.image_r2_key) {
      const signedUrl = await getSignedImageUrl({
        R2_ACCESS_KEY_ID: (c.env as any).R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: (c.env as any).R2_SECRET_ACCESS_KEY,
        R2_ENDPOINT: (c.env as any).R2_ENDPOINT,
      }, page.image_r2_key);
      return { ...page, imageUrl: signedUrl };
    }
    return page;
  }));

  return c.json({ ...book, pages: pagesWithUrls })
})

router.post("/", async (c) => {
  const apiKey = c.env.GEMINI_API_KEY
  const body = await c.req.json<CreateBookInput>()

  const errors = validateCreateBook(body)
  if (errors.length > 0) {
    return c.json({ error: "Validation failed", details: errors }, 400)
  }

  const bookId = crypto.randomUUID()

  const book = await Books.createBook(c.env.pagecraft_db, bookId, body)

  try {
    const storyPages = await generateBookStory(apiKey, {
      title: body.title,
      synopsis: body.synopsis,
      characterDesc: body.characterDesc,
      pageCount: body.pageCount,
      artStyleId: body.artStyleId,
    })

    const pageInserts = storyPages.map((sp) => ({
      id: crypto.randomUUID(),
      bookId,
      pageNumber: sp.pageNumber,
      pageStory: sp.story,
    }))

    await Pages.insertPages(c.env.pagecraft_db, pageInserts)

    const pages = await Pages.getPagesByBookId(c.env.pagecraft_db, bookId)

    return c.json({ ...book, pages }, 201)
  } catch (err) {
    await Books.deleteBook(c.env.pagecraft_db, bookId)
    throw err
  }
})

router.delete("/:id", async (c) => {
  const id = c.req.param("id")
  const exists = await Books.bookExists(c.env.pagecraft_db, id)

  if (!exists) {
    return c.json({ error: "Book not found" }, 404)
  }

  await Books.deleteBook(c.env.pagecraft_db, id)

  return c.json({ success: true })
})

function validateCreateBook(body: CreateBookInput): string[] {
  const errors: string[] = []

  if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.push("title is required and must be a non-empty string")
  }
  if (!body.synopsis || typeof body.synopsis !== "string" || body.synopsis.trim().length === 0) {
    errors.push("synopsis is required and must be a non-empty string")
  }
  if (!body.characterDesc || typeof body.characterDesc !== "string" || body.characterDesc.trim().length === 0) {
    errors.push("characterDesc is required and must be a non-empty string")
  }
  if (typeof body.pageCount !== "number" || !Number.isInteger(body.pageCount)) {
    errors.push("pageCount is required and must be an integer")
  } else if (body.pageCount < 6 || body.pageCount > 10) {
    errors.push("pageCount must be between 6 and 10")
  }
  if (!body.artStyleId || typeof body.artStyleId !== "string" || body.artStyleId.trim().length === 0) {
    errors.push("artStyleId is required and must be a non-empty string")
  }

  return errors
}

export default router
