import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

function BookCraft() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookId) {
      navigate("/gallery", { replace: true });
    }
  }, [bookId, navigate]);

  if (!bookId) return null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <span className="block text-[12px] font-extrabold tracking-wider uppercase text-gray-600 mb-1">
        Crafting
      </span>
      <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight mb-2">
        Book {bookId.slice(0, 8)}
      </h1>
      <p className="text-sm font-medium text-gray-700">
        Story and illustration controls will land here in the next plan.
      </p>
    </main>
  );
}

export default BookCraft;
