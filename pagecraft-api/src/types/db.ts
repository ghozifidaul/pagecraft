export interface Book {
  id: string
  title: string
  synopsis: string
  character_desc: string
  page_count: number
  art_style_id: string
  created_at: string
}

export interface Page {
  id: string
  book_id: string
  page_number: number
  page_story: string
  image_r2_key: string | null
  created_at: string
}

export interface CreateBookInput {
  title: string
  synopsis: string
  characterDesc: string
  pageCount: number
  artStyleId: string
}

export interface BookWithPages extends Book {
  pages: Page[]
}

export interface ArtStyle {
  id: string
  name: string
  description: string
  imageUrl: string
}
