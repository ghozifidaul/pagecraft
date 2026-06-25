import { Link } from "react-router";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

type Book = {
  id: string;
  title: string;
  artStyle: string;
  pageCount: number;
};

const placeholderBooks: Book[] = [
  { id: "1", title: "The Curious Robot", artStyle: "Watercolor", pageCount: 8 },
  { id: "2", title: "Maya and the Moon", artStyle: "Storybook", pageCount: 12 },
  { id: "3", title: "Captain Whiskers", artStyle: "Comic", pageCount: 6 },
];

function BookGallery() {
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
        <Link to="/create">
          <Button variant="primary" size="sm">
            + New Book
          </Button>
        </Link>
      </header>

      {placeholderBooks.length === 0 ? (
        <Card>
          <p className="font-semibold">No books yet. Create your first one!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderBooks.map((book) => (
            <Card key={book.id}>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="blue">{book.artStyle}</Badge>
                <span className="text-xs text-gray-600 font-medium">
                  {book.pageCount} pages
                </span>
              </div>
              <h2 className="text-[19px] font-extrabold mb-4">{book.title}</h2>
              <Button variant="ghost" size="sm">
                Open
              </Button>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

export default BookGallery;
