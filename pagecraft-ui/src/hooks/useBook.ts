import { useCallback, useState } from "react";
import { ApiError, getBook, type BookWithPages, type Page } from "../lib/api";

type UseBookResult = {
  book: BookWithPages | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  patchPage: (page: Page) => void;
};

export default function useBook(id: string): UseBookResult {
  const [book, setBook] = useState<BookWithPages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBook(id);
      setBook(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError("Failed to load book.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const patchPage = useCallback((updatedPage: Page) => {
    setBook((prev) => {
      if (!prev) return prev;
      return { ...prev, pages: prev.pages.map((p) => (p.id === updatedPage.id ? updatedPage : p)) };
    });
  }, []);

  return { book, loading, error, fetch, patchPage };
}
