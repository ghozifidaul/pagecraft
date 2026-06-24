import { Hono } from "hono";
import * as Books from "../db/books";
import * as Pages from "../db/pages";
import { regeneratePageStory } from "../services/story.service";
import { generatePageIllustration } from "../services/illustration.service";
import { uploadImage, getSignedImageUrl } from "../services/image.service";

const router = new Hono<{ Bindings: CloudflareBindings }>();

router.put("/:id/pages/:pageId/story", async (c) => {
  const bookId = c.req.param("id");
  const pageId = c.req.param("pageId");
  const body = await c.req.json<{ story: string }>();

  const book = await Books.getBookById(c.env.pagecraft_db, bookId);
  if (!book) {
    return c.json({ error: "Book not found" }, 404);
  }

  const page = await Pages.getPageById(c.env.pagecraft_db, pageId);
  if (!page || page.book_id !== bookId) {
    return c.json({ error: "Page not found" }, 404);
  }

  if (
    !body.story ||
    typeof body.story !== "string" ||
    body.story.trim().length === 0
  ) {
    return c.json(
      { error: "story is required and must be a non-empty string" },
      400,
    );
  }

  await Pages.updatePageStory(c.env.pagecraft_db, pageId, body.story);

  const updated = await Pages.getPageById(c.env.pagecraft_db, pageId);

  return c.json(updated);
});

router.post("/:id/pages/:pageId/story/regenerate", async (c) => {
  const apiKey = c.env.GEMINI_API_KEY;
  const bookId = c.req.param("id");
  const pageId = c.req.param("pageId");
  const body = await c.req.json<{ feedback: string }>();

  const book = await Books.getBookById(c.env.pagecraft_db, bookId);
  if (!book) {
    return c.json({ error: "Book not found" }, 404);
  }

  const page = await Pages.getPageById(c.env.pagecraft_db, pageId);
  if (!page || page.book_id !== bookId) {
    return c.json({ error: "Page not found" }, 404);
  }

  if (
    !body.feedback ||
    typeof body.feedback !== "string" ||
    body.feedback.trim().length === 0
  ) {
    return c.json(
      { error: "feedback is required and must be a non-empty string" },
      400,
    );
  }

  let previousPageStory: string | undefined;
  if (page.page_number > 1) {
    const prevPage = await Pages.getPageByBookAndNumber(
      c.env.pagecraft_db,
      bookId,
      page.page_number - 1,
    );
    if (prevPage?.page_story) {
      previousPageStory = prevPage.page_story;
    }
  }

  let nextPageStory: string | undefined;
  if (page.page_number < book.page_count) {
    const nextPage = await Pages.getPageByBookAndNumber(
      c.env.pagecraft_db,
      bookId,
      page.page_number + 1,
    );
    if (nextPage?.page_story) {
      nextPageStory = nextPage.page_story;
    }
  }

  try {
    const newStory = await regeneratePageStory(apiKey, {
      currentStory: page.page_story,
      feedback: body.feedback,
      bookContext: {
        title: book.title,
        characterDesc: book.character_desc,
        synopsis: book.synopsis,
      },
      pageNumber: page.page_number,
      totalPages: book.page_count,
      previousPageStory,
      nextPageStory,
    });

    await Pages.updatePageStory(c.env.pagecraft_db, pageId, newStory);

    const updated = await Pages.getPageById(c.env.pagecraft_db, pageId);

    return c.json(updated);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Story regeneration failed";
    return c.json({ error: message }, 500);
  }
});

router.post("/:id/pages/:pageId/illustration", async (c) => {
  const apiKey = c.env.GEMINI_API_KEY;
  const bookId = c.req.param("id");
  const pageId = c.req.param("pageId");
  const body = await c.req
    .json<{ feedback?: string }>()
    .catch(() => ({}) as { feedback?: string });

  const book = await Books.getBookById(c.env.pagecraft_db, bookId);
  if (!book) {
    return c.json({ error: "Book not found" }, 404);
  }

  const page = await Pages.getPageById(c.env.pagecraft_db, pageId);
  if (!page || page.book_id !== bookId) {
    return c.json({ error: "Page not found" }, 404);
  }

  const latestImagePage = await Pages.getLatestImagePageNumber(
    c.env.pagecraft_db,
    bookId,
  );

  if (page.page_number > latestImagePage + 1) {
    return c.json(
      {
        error: `Illustration for page ${page.page_number} cannot be generated yet. Generate illustration for page ${latestImagePage + 1} first.`,
      },
      400,
    );
  }

  let previousPageImage: string | undefined;
  if (page.page_number > 1) {
    const prevPage = await Pages.getPageByBookAndNumber(
      c.env.pagecraft_db,
      bookId,
      page.page_number - 1,
    );
    if (prevPage?.image_r2_key) {
      previousPageImage = prevPage.image_r2_key;
    }
  }

  try {
    const illustration = await generatePageIllustration(apiKey, {
      pageStory: page.page_story,
      characterDesc: book.character_desc,
      artStyleDescription: book.art_style_id,
      previousPageImage,
      feedback: body.feedback,
    });

    const imageBuffer = Uint8Array.from(atob(illustration.data), (c) =>
      c.charCodeAt(0),
    ).buffer;
    const r2Key = await uploadImage(
      {
        IMAGE_BUCKET: c.env.IMAGE_BUCKET,
        R2_ACCESS_KEY_ID: (c.env as any).R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: (c.env as any).R2_SECRET_ACCESS_KEY,
        R2_ENDPOINT: (c.env as any).R2_ENDPOINT,
      },
      bookId,
      pageId,
      imageBuffer,
    );

    await Pages.updatePageImageKey(c.env.pagecraft_db, pageId, r2Key);

    const updated = await Pages.getPageById(c.env.pagecraft_db, pageId);
    const signedUrl = await getSignedImageUrl(
      {
        R2_ACCESS_KEY_ID: (c.env as any).R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: (c.env as any).R2_SECRET_ACCESS_KEY,
        R2_ENDPOINT: (c.env as any).R2_ENDPOINT,
      },
      r2Key,
    );

    return c.json({ ...updated, imageUrl: signedUrl });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Illustration generation failed";
    return c.json({ error: message }, 500);
  }
});

export default router;
