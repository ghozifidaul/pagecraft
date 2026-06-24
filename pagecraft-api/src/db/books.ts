import type { Book, CreateBookInput } from "../types/db"

export async function listBooks(db: D1Database): Promise<Book[]> {
  const { results } = await db.prepare(
    "SELECT * FROM books ORDER BY created_at DESC"
  ).all<Book>()
  return results
}

export async function getBookById(db: D1Database, id: string): Promise<Book | null> {
  const book = await db.prepare(
    "SELECT * FROM books WHERE id = ?"
  ).bind(id).first<Book>()
  return book ?? null
}

export async function createBook(
  db: D1Database,
  id: string,
  input: CreateBookInput
): Promise<Book> {
  await db.prepare(
    `INSERT INTO books (id, title, synopsis, character_desc, page_count, art_style_id)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    input.title,
    input.synopsis,
    input.characterDesc,
    input.pageCount,
    input.artStyleId
  ).run()

  const book = await getBookById(db, id)
  if (!book) {
    throw new Error("Failed to create book")
  }
  return book
}

export async function deleteBook(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare(
    "DELETE FROM books WHERE id = ?"
  ).bind(id).run()
  return result.meta.changes > 0
}

export async function bookExists(db: D1Database, id: string): Promise<boolean> {
  const row = await db.prepare(
    "SELECT 1 FROM books WHERE id = ?"
  ).bind(id).first()
  return row !== null
}
