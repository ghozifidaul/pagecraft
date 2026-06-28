import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import BookCard, { BookCardSkeleton } from "../components/ui/BookCard";
import ConfirmDialog from "../components/ConfirmDialog";
import CreateBookDialog from "../components/CreateBookDialog";
import useBooks from "../hooks/useBooks";
import {
  ApiError,
  deleteBook,
  getArtStyles,
  type ArtStyle,
  type Book,
  type BookWithPages,
} from "../lib/api";

const SKELETON_KEYS = ["s1", "s2", "s3"] as const;

function artStyleLabel(styles: ArtStyle[], id: string): string {
  return styles.find((s) => s.id === id)?.name ?? id;
}

function BookGallery() {
  useEffect(() => {
    document.title = "My Books — PageCraft";
  }, []);
  const navigate = useNavigate();
  const { books, loading, error, fetch } = useBooks();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [artStyles, setArtStyles] = useState<ArtStyle[]>([]);

  function handleOpen(id: string) {
    navigate(`/create/${id}`);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteBook(deleteTarget.id);
      setDeleteTarget(null);
      await fetch();
    } catch (err) {
      if (err instanceof ApiError) setDeleteError(err.message);
      else if (err instanceof Error) setDeleteError(err.message);
      else setDeleteError("Failed to delete book.");
    } finally {
      setDeleting(false);
    }
  }

  function handleCreated(book: BookWithPages) {
    setCreateOpen(false);
    fetch();
    navigate(`/create/${book.id}`);
  }

  useEffect(() => {
    const fetchArtStyles = async () => {
      try {
        const artstyles = await getArtStyles();
        setArtStyles(artstyles);
      } catch { /* ignore */ }
    };

    fetch();
    fetchArtStyles();
  }, [fetch]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <span className="block text-[12px] font-extrabold tracking-wider uppercase text-gray-600 mb-1">
            Gallery
          </span>
          <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">
            Your Books
          </h1>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          + New Book
        </Button>
      </header>

      {deleteError && (
        <Alert
          variant="error"
          title="Couldn't delete book"
          onClose={() => setDeleteError(null)}
        >
          {deleteError}
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SKELETON_KEYS.map((k) => (
            <BookCardSkeleton key={k} />
          ))}
        </div>
      ) : error ? (
        <Alert variant="error" title="Couldn't load books">
          {error}
          <div className="mt-3">
            <Button variant="ghost" size="sm" onClick={fetch}>
              Try again
            </Button>
          </div>
        </Alert>
      ) : books.length === 0 ? (
        <Card featured>
          <h2 className="text-[22px] font-extrabold mb-2">No books yet</h2>
          <p className="text-[14.5px] font-medium mb-5">
            Create your first storybook to get started.
          </p>
          <Button variant="dark" onClick={() => setCreateOpen(true)}>
            Create a Book
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              styleLabel={artStyleLabel(artStyles, book.art_style_id)}
              onOpen={handleOpen}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CreateBookDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete book?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently deleted. This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (deleting) return;
          setDeleteTarget(null);
        }}
        pending={deleting}
      />
    </main>
  );
}

export default BookGallery;
