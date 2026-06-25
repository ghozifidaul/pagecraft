import Card from "./Card";
import Badge from "./Badge";
import type { Book } from "../../lib/api";
import { formatRelativeDate } from "../../lib/format";
import { artStyleVariant } from "../../lib/artStyleVariant";

type BookCardProps = {
  book: Book;
  styleLabel: string;
  onOpen: (id: string) => void;
  onDelete: (book: Book) => void;
};

export default function BookCard({
  book,
  styleLabel,
  onOpen,
  onDelete,
}: BookCardProps) {
  return (
    <Card className="relative">
      <div className="flex items-center justify-between mb-3 pr-10">
        <Badge variant={artStyleVariant(book.art_style_id)}>{styleLabel}</Badge>
        <span className="text-xs text-gray-600 font-medium">
          {book.page_count} pages
        </span>
      </div>
      <button
        type="button"
        onClick={() => onOpen(book.id)}
        className="text-left w-full focus-visible:outline-[3px] focus-visible:outline-brutal-ink focus-visible:outline-offset-2 rounded-md"
      >
        <h2 className="text-[19px] font-extrabold mb-1 leading-tight">
          {book.title}
        </h2>
        <p className="text-[13px] text-gray-700 font-medium line-clamp-2 mb-3">
          {book.character_desc}
        </p>
        <p className="text-xs text-gray-600 font-medium">
          {formatRelativeDate(book.created_at)}
        </p>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(book);
        }}
        aria-label={`Delete ${book.title}`}
        className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg border-[2.5px] border-brutal-ink bg-brutal-paper font-extrabold shadow-[2px_2px_0_#161616] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#161616] transition-all duration-150"
      >
        ✕
      </button>
    </Card>
  );
}

export function BookCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 w-20 rounded-full bg-brutal-ink/10" />
        <div className="h-3 w-14 rounded bg-brutal-ink/10" />
      </div>
      <div className="h-5 w-3/4 rounded bg-brutal-ink/10 mb-2" />
      <div className="h-3 w-full rounded bg-brutal-ink/10 mb-4" />
      <div className="h-8 w-20 rounded-lg bg-brutal-ink/10" />
    </Card>
  );
}
