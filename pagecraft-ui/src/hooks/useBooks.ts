import { useCallback, useState } from "react";
import { ApiError, getBooks, type Book } from "../lib/api";

type UseBooksResult = {
  books: Book[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
};

export default function useBooks(): UseBooksResult {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError("Failed to load books.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { books, loading, error, fetch };
}
