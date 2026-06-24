import type { Page } from "../types/db"

export async function getPagesByBookId(db: D1Database, bookId: string): Promise<Page[]> {
  const { results } = await db.prepare(
    "SELECT * FROM pages WHERE book_id = ? ORDER BY page_number ASC"
  ).bind(bookId).all<Page>()
  return results
}

export async function getPageById(db: D1Database, id: string): Promise<Page | null> {
  const page = await db.prepare(
    "SELECT * FROM pages WHERE id = ?"
  ).bind(id).first<Page>()
  return page ?? null
}

export async function getPageByBookAndNumber(
  db: D1Database,
  bookId: string,
  pageNumber: number
): Promise<Page | null> {
  const page = await db.prepare(
    "SELECT * FROM pages WHERE book_id = ? AND page_number = ?"
  ).bind(bookId, pageNumber).first<Page>()
  return page ?? null
}

export async function updatePageStory(
  db: D1Database,
  id: string,
  story: string
): Promise<void> {
  await db.prepare(
    "UPDATE pages SET page_story = ? WHERE id = ?"
  ).bind(story, id).run()
}

export async function updatePageImageKey(
  db: D1Database,
  id: string,
  imageR2Key: string | null
): Promise<void> {
  await db.prepare(
    "UPDATE pages SET image_r2_key = ? WHERE id = ?"
  ).bind(imageR2Key, id).run()
}

export async function insertPages(
  db: D1Database,
  pages: Array<{
    id: string
    bookId: string
    pageNumber: number
    pageStory: string
  }>
): Promise<void> {
  if (pages.length === 0) return

  const stmt = db.prepare(
    `INSERT INTO pages (id, book_id, page_number, page_story)
     VALUES (?, ?, ?, ?)`
  )

  const batch = pages.map((p) =>
    stmt.bind(p.id, p.bookId, p.pageNumber, p.pageStory)
  )

  await db.batch(batch)
}

export async function getMaxPageNumberWithImage(
  db: D1Database,
  bookId: string
): Promise<number> {
  const result = await db.prepare(
    "SELECT COALESCE(MAX(page_number), 0) AS max_page FROM pages WHERE book_id = ? AND image_r2_key IS NOT NULL"
  ).bind(bookId).first<{ max_page: number }>()
  return result?.max_page ?? 0
}

export async function getLatestImagePageNumber(
  db: D1Database,
  bookId: string
): Promise<number> {
  return getMaxPageNumberWithImage(db, bookId)
}
