const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(status: number, message: string, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    let message = res.statusText || `Request failed (${res.status})`;
    let details: string[] | undefined;
    try {
      const body = (await res.json()) as { error?: string; details?: string[] };
      if (body.error) message = body.error;
      if (Array.isArray(body.details)) details = body.details;
    } catch {
      // body wasn't JSON; keep statusText
    }
    throw new ApiError(res.status, message, details);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type Book = {
  id: string;
  title: string;
  synopsis: string;
  character_desc: string;
  page_count: number;
  art_style_id: string;
  created_at: string;
};

export type Page = {
  id: string;
  book_id: string;
  page_number: number;
  page_story: string;
  image_r2_key: string | null;
  imageUrl?: string;
  created_at: string;
};

export type BookWithPages = Book & { pages: Page[] };

export type ArtStyle = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
};

export type CreateBookInput = {
  title: string;
  synopsis: string;
  characterDesc: string;
  pageCount: number;
  artStyleId: string;
};

export function getBooks(): Promise<Book[]> {
  return request<Book[]>("/api/books");
}

export function getArtStyles(): Promise<ArtStyle[]> {
  return request<ArtStyle[]>("/api/art-styles");
}

export function createBook(input: CreateBookInput): Promise<BookWithPages> {
  return request<BookWithPages>("/api/books", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteBook(id: string): Promise<void> {
  return request<void>(`/api/books/${id}`, { method: "DELETE" });
}
